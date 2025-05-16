import config from "../config"
import { sendMsg, S2APacketParticles, swapItem, KeyBinding, S32PacketConfirmTransaction, doJump, rightClick, holdingItem, getClass } from "./utils/Utils"
import { closestColor, dragonColors, dragDeathMessages, dragonDelays } from "./utils/AutoP5Utils"
import { scheduleTask } from "./utils/S32ScheduleTask"
import Pathfinder from "./utils/PathfinderUtils"

const dragonLocations = {
    Red: [{ x: 28, y: 6, z: 56, shouldJump: true, shouldSnap: false, yawPitch: [0, 0], ignoreY: true, setPitch: true, setMotion: true, setPosition: true, cancelPath: true }],
    Orange: [{ x: 82.5, y: 6, z: 57.5, shouldJump: true, shouldSnap: false, yawPitch: [0, 0], ignoreY: true, setPitch: true, setMotion: true, setPosition: true, cancelPath: true }],
    Blue: [{ x: 82.5, y: 6, z: 97.5, shouldJump: true, shouldSnap: false, yawPitch: [0, 0], ignoreY: true, setPitch: true, setMotion: true, setPosition: true, cancelPath: true }],
    Purple: [{ x: 56.5, y: 8, z: 123.5, shouldJump: true, shouldSnap: false, yawPitch: [0, 0], ignoreY: true, setPitch: true, setMotion: true, setPosition: true, cancelPath: true }],
    Green: [{ x: 27, y: 6, z: 91.5, shouldJump: true, shouldSnap: false, yawPitch: [0, 0], ignoreY: true, setPitch: true, setMotion: true, setPosition: true, cancelPath: true }],
    Middle: [{ x: 54.5, y: 5, z: 76.5, shouldJump: true, shouldSnap: true, yawPitch: [0, 0], ignoreY: true, setPitch: false, setMotion: true, setPosition: true, cancelPath: true }]
}

/* Pathfind */
register("chat", (event) => {
    if (!config().AutoP5) return
    //if (getClass() !== "Tank" && getClass() !== "Healer") return sendMsg(`&7Invalid Class &c(Not Tank or Healer)`)
    const message = ChatLib.removeFormatting(ChatLib.getChatMessage(event))
    const drag = message.split(" ")[0].toLowerCase()
    
    addPath(drag)
    if (dragDeathMessages.some(deathMessage => message.includes(deathMessage))) addPath("Middle")
}).setCriteria(/.+ is spawning|.+/)

function addPath(dragon) {
    const validDragon = Object.keys(dragonLocations).find(key => key.toLowerCase() === dragon.toLowerCase())
    if (!validDragon) return
    swapItem("last breath")
    dragonLocations[validDragon].forEach(({ x, y, z, shouldJump, shouldSnap, yawPitch, ignoreY, setPitch, setMotion, setPosition, cancelPath }) => Pathfinder.addPath(x, y, z, shouldJump, shouldSnap, yawPitch, ignoreY, setPitch, setMotion, setPosition, cancelPath))
}

register("command", (dragon) => addPath(dragon)).setName("pathfind")

/* Debuff */
let charged = false
let ticks

register("tick", () => {
    if (!(holdingItem("Last Breath")) || !(Player.getPitch() < -70)) {
        if (charged) {
            charged = false
            KeyBinding.func_74510_a(-99, charged)
        }
        return
    }
    if (!holdingItem("Last Breath") || !(Player.getPitch() < -70) || !config().AutoLastBreath || (Player.getY() > 31)) return
    if (!charged) {
        charged = true
        KeyBinding.func_74510_a(-99, true)
        scheduleTask(() => {
            KeyBinding.func_74510_a(-99, false)
            scheduleTask(() => charged = false, 1)
        }, dragonDelays[closestColor()])
    }
})

const y = register("renderWorld", () => {
    const fy = Player.getY() - Math.floor(Player.getY())
    if (fy >= 0.19 && fy <= 0.2491870772188) {
        if (config().AutoP5 && config().AutoP5Debug) sendMsg(`&7Used Spray &6${Player.getY()}`)
        rightClick()
        y.unregister()
    }
}).unregister()

const tickCounter = register("packetReceived", () => {
    ticks--
    if (ticks == config().AutoIceSprayTick && config().AutoIceSpray) {
        y.register()
        swapItem("ice spray wand")
        doJump()
        if (config().AutoSoulWhip) {
            Client.scheduleTask(4, () => swapItem("soul whip"))
            Client.scheduleTask(4, () => KeyBinding.func_74510_a(-99, true))
            Client.scheduleTask(config().AutoSoulWhipTick, () => KeyBinding.func_74510_a(-99, false))
        }
    }
    if (ticks <= 0) tickCounter.unregister()
}).setFilteredClass(S32PacketConfirmTransaction).unregister()

/* Priority */
let inP5 = false
let redSpawning = false
let orangeSpawning = false
let blueSpawning = false
let purpleSpawning = false
let greenSpawning = false
let drags = [null, null]

register("chat", () => inP5 = true).setCriteria("[BOSS] Necron: All this, for nothing...")

register("packetReceived", (packet) => {
    if (config().AutoP5 && inP5 && packet.func_179749_a().toString() == "ENCHANTMENT_TABLE") {
        handleParticles(parseInt(packet.func_149220_d()), parseInt(packet.func_149226_e()), parseInt(packet.func_149225_f()))
    }
}).setFilteredClass(S2APacketParticles)

const dragonInfo = {
    Purple: { name: "Purple", prio: [0, 4], colorCode: dragonColors.Purple },
    Blue: { name: "Blue", prio: [1, 0], colorCode: dragonColors.Blue },
    Red: { name: "Red", prio: [2, 1], colorCode: dragonColors.Red },
    Green: { name: "Green", prio: [3, 2], colorCode: dragonColors.Green },
    Orange: { name: "Orange", prio: [4, 3], colorCode: dragonColors.Orange }
}

function assignColor(drag) {
    if (!drags[0]) {
        drags[0] = drag
    } else if (!drags[1] && drag != drags[0]) {
        drags[1] = drag
        determinePrio()
    } else {
        ChatLib.simulateChat(`${drag.colorCode}${drag.name} is spawning`)
    }
}

function determinePrio() {
    if (getClass() == "Archer" || getClass() == "Tank") {
        if (drags[0].prio[0] < drags[1].prio[0]) {
            ChatLib.simulateChat(`${drags[0].colorCode}${drags[0].name} is spawning`)
        } else {
            ChatLib.simulateChat(`${drags[1].colorCode}${drags[1].name} is spawning`)
        }
    } else if (getClass() == "Berserk" || getClass() == "Mage" || (getClass() == "Healer" && config().HealerTeam == 1)) {
        if (drags[0].prio[0] > drags[1].prio[0]) {
            ChatLib.simulateChat(`${drags[0].colorCode}${drags[0].name} is spawning`)
        } else {
            ChatLib.simulateChat(`${drags[1].colorCode}${drags[1].name} is spawning`)
        }
    } else if (getClass() == "Healer" && config().HealerTeam == 0) {
        if (drags[0].prio[1] < drags[1].prio[1]) {
            ChatLib.simulateChat(`${drags[0].colorCode}${drags[0].name} is spawning`)
        } else {
            ChatLib.simulateChat(`${drags[1].colorCode}${drags[1].name} is spawning`)
        }
    }
}

function handleParticles(x, y, z) {
    // check if correct height
    if (y >= 14 && y <= 19) {
        // check if red/green
        if (x >= 27 && x <= 32) {
            // check if red
            if (z == 59) {
                if (!redSpawning) {
                    assignColor(dragonInfo.Red)
                    redSpawning = true
                    tickCounter.register()
                    ticks = 100
                    setTimeout(() => {
                        redSpawning = false
                    }, 8000)
                }
            // check if green
            } else if (z == 94) {
                if (!greenSpawning) {
                    assignColor(dragonInfo.Green)
                    greenSpawning = true
                    tickCounter.register()
                    ticks = 100
                    setTimeout(() => {
                        greenSpawning = false
                    }, 8000)
                }
            }
        // check if blue/orange
        } else if (x >= 79 && x <= 85) {
            // check if blue
            if (z == 94) {
                if (!blueSpawning) {
                    assignColor(dragonInfo.Blue)
                    blueSpawning = true
                    tickCounter.register()
                    ticks = 100
                    setTimeout(() => {
                        blueSpawning = false
                    }, 8000)
                }
            // check if orange
            } else if (z == 56) {
                if (!orangeSpawning) {
                    assignColor(dragonInfo.Orange)
                    orangeSpawning = true
                    tickCounter.register()
                    ticks = 100
                    setTimeout(() => {
                        orangeSpawning = false
                    }, 8000)
                }
            }
        // check if purple    
        } else if (x == 56) {
            if (!purpleSpawning) {
                assignColor(dragonInfo.Purple)
                purpleSpawning = true
                tickCounter.register()
                ticks = 100
                setTimeout(() => {
                    purpleSpawning = false
                }, 8000)
            }
        }
    }
}

register("worldLoad", () => {
    inP5 = false
    ticks = 0
    redSpawning = false
    orangeSpawning = false
    blueSpawning = false
    purpleSpawning = false
    greenSpawning = false
    drags = [null, null]
    Pathfinder.cancelPath()
})