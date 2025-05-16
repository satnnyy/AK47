import config from "../config"
import {
    setSneakKey, swapItem, snapTo, sendMsg, getDistance3D, Keyboard, setMotion, center, pearlClip,
    leftClick, startWalk, stopWalk, C0BPacketEntityAction, C08PacketPlayerBlockPlacement, S0DPacketCollectItem,
    S29PacketSoundEffect, items, hclip, KeyBinding, keys, isWithinTolerance, sendBlockPlacement
} from "./utils/Utils"
import Render from "./utils/AutorouteUtils"
import DmapDungeon from "./utils/components/DmapDungeon"
import { getDistanceToCoord, getDistanceToEntity } from "../../BloomCore/utils/Utils"
import RenderLib from "RenderLib"


/* utils */
function getRoomName() {
    const currentRoom = DmapDungeon.getCurrentRoom()
    return currentRoom.name
}

let etherwarp = false
register("packetSent", packet => {
	const action = packet.func_180764_b()
	if (action == C0BPacketEntityAction.Action.START_SNEAKING) etherwarp = true
	if (action == C0BPacketEntityAction.Action.STOP_SNEAKING) etherwarp = false
}).setFilteredClass(C0BPacketEntityAction)

const sneak = register("renderWorld", () => {
    if (!Player.isSneaking()) setSneakKey(true)
    if (!etherwarp) return
    sendBlockPlacement()
    setSneakKey(false)
    sneak.unregister()
}).unregister()

function ether() {
    sneak.register()
    setSneakKey(true)
}

const click = register("packetSent", (packet) => {
    const pos = new BlockPos(packet.func_179724_a())
    const [x, y, z] = [pos.x, pos.y, pos.z]
    const blockName = World.getBlockAt(x, y, z).type.getRegistryName()
    if (!["minecraft:chest", "minecraft:trapped_chest", "minecraft:skull", "minecraft:lever"].includes(blockName)) return
    sendMsg(`&7Clicked &6${blockName}`)
    Client.scheduleTask(1, () => {
        ether()
        clear()
    })
}).setFilteredClass(C08PacketPlayerBlockPlacement).unregister()

const item = register("packetReceived", (packet) => {
    const item = World.getWorld().func_73045_a(packet.func_149354_c())?.func_92059_d()?.func_82833_r()?.removeFormatting()
    if (!items.includes(item)) return
    sendMsg(`&7Picked Up &6${item}`)
    ether()
    clear()
}).setFilteredClass(S0DPacketCollectItem).unregister()

const batDeath = register("packetReceived", (packet) => {
    const soundPos = [packet.func_149207_d(), packet.func_149211_e(), packet.func_149210_f()]
    if (packet.func_149212_c() !== "mob.bat.hurt" || getDistanceToCoord(...soundPos, true) > 15) return
    sendMsg("&7Bat Dead")
    ether()
    clear()
}).setFilteredClass(S29PacketSoundEffect).unregister()

const batSpawn = register("tick", () => {
    const bats = World.getAllEntitiesOfType(net.minecraft.entity.passive.EntityBat)
    for (let bat of bats) {
        if (getDistanceToEntity(bat) > 15) continue
        sendMsg("&7Bat Spawned")
        Client.scheduleTask(0, () => {
            sendBlockPlacement()
            clear()
        })
        return
    }
}).unregister()

function clear() {
    batDeath.unregister()
    item.unregister()
    click.unregister()
    batSpawn.unregister()
}

const wallClip = register("tick", () => {
    const fx = Player.getX() - Math.floor(Player.getX())
    const fz = Player.getZ() - Math.floor(Player.getZ())

    if (!Player.getPlayer().field_70124_G) return

    const coords = [0.69999998807907, 0.30000001192093]

    if (coords.some(tolerance => isWithinTolerance(fx, tolerance)) || coords.some(tolerance => isWithinTolerance(fz, tolerance))) {
        if (config().Autoroute && config().AutorouteDebug) sendMsg(`&7Wall Clipped`)
        keys.forEach(keybind => KeyBinding.func_74510_a(keybind, false))
        hclip(0.062)

        Client.scheduleTask(() => {
            hclip(1.4756)
            keys.forEach(keybind => KeyBinding.func_74510_a(keybind, Keyboard.isKeyDown(keybind)))
            wallClip.unregister()
        })
        Client.scheduleTask(20, () => wallClip.unregister())
    }
}).unregister()


let module = "AK47"
let path = "data/Autoroute/Autoroute.json"
let nodes = {}
let editMode = false
let isKeyHeld = false

register("worldLoad", () => { loadAutoroute(); clear() })
register("renderWorld", () => { if (config().Autoroute && !config().AutorouteDisableRendering) renderAutoroute() })
register("tick", () => { if (config().Autoroute) checkProximity() })
register("step", () => isKeyHeld = Keyboard.isKeyDown(config().AutorouteDisabler))
register("command", (...args) => {
    if (!args.length) return

    const data = {}
    const [px, y, pz] = [Math.floor(Player.getX()) + 0.5, Player.getY(), Math.floor(Player.getZ()) + 0.5]
    const [x, , z] = DmapDungeon.getCurrentRoom().getRoomCoord([px, y, pz])
    const relativeYaw = (Player.getYaw() - DmapDungeon.getCurrentRoom().rotation) % 360

    if (args[0] === "add") {
        if (args[1] === "ether") {
            data.yaw = relativeYaw
            data.pitch = Player.getPitch()
            data.stopMotion = args[2] === "true"
            data.center = args[3] === "true"
            const autoroute = { type: "ether", data, x, y, z }
            addAutoroute(autoroute)
        } else if (args[1] === "awaitsecret") {
            data.yaw = relativeYaw
            data.pitch = Player.getPitch()
            data.stopMotion = args[2] === "true"
            data.center = args[3] === "true"
            const autoroute = { type: "awaitsecret", data, x, y, z }
            addAutoroute(autoroute)
        } else if (args[1] === "batspawn") {
            data.yaw = relativeYaw
            data.pitch = Player.getPitch()
            data.stopMotion = args[2] === "true"
            data.center = args[3] === "true"
            const autoroute = { type: "batspawn", data, x, y, z }
            addAutoroute(autoroute)
        } else if (args[1] === "startwalk") {
            data.yaw = relativeYaw
            data.pitch = Player.getPitch()
            data.stopMotion = args[2] === "true"
            data.center = args[3] === "true"
            const autoroute = { type: "startwalk", data, x, y, z }
            addAutoroute(autoroute)
        } else if (args[1] === "pearlclip") {
            data.distance = args[2]
            const autoroute = { type: "pearlclip", data, x, y, z }
            addAutoroute(autoroute)
        } else if (args[1] === "use") {
            data.yaw = relativeYaw
            data.pitch = Player.getPitch()
            const trueIndex = args.indexOf("true")
            data.item = trueIndex !== -1 ? args.slice(2, trueIndex).join(" ") : args.slice(2).join(" ")
            data.leftClick = trueIndex !== -1
            const autoroute = { type: "use", data, x, y, z }
            addAutoroute(autoroute)
        } else if (args[1] === "wallclip") {
            data.yaw = relativeYaw
            data.pitch = Player.getPitch()
            const autoroute = { type: "wallclip", data, x, y, z }
            addAutoroute(autoroute)
        } else if (args[1] === "rotate") {
            data.yaw = relativeYaw
            data.pitch = Player.getPitch()
            data.stopMotion = args[2] === "true"
            data.center = args[3] === "true"
            const autoroute = { type: "rotate", data, x, y, z }
            addAutoroute(autoroute)
        } else {
            if (config().Autoroute && config().AutorouteDebug) sendMsg(`&cInvalid autoroute type`)
        }
    } else if (args[0] === "remove") {
        removeAutoroute()
    } else if (args[0] === "em") {
        toggleEditMode()
    } else if (args[0] === "chain") {
        chainAutoroute()
    }
}).setName("autoroute").setAliases(["ar"])

function handleAutoroute(autoroute) {
    if (!config().Autoroute || isKeyHeld || editMode) return

    const yaw = (autoroute.data.yaw + DmapDungeon.getCurrentRoom().rotation) % 360

    switch (autoroute.type) {
        case "ether":
            if (config().Autoroute && config().AutorouteDebug) sendMsg(`&7Etherwarping`)
            if (autoroute.data.stopMotion) setMotion(0, 0)
            if (autoroute.data.center) center()
            stopWalk()
            setSneakKey(false)
            snapTo(yaw, autoroute.data.pitch)
            swapItem("aspect of the void")
            ether()
            break

        case "awaitsecret":
            if (config().Autoroute && config().AutorouteDebug) sendMsg(`&7Awaiting Secret..`)
            if (autoroute.data.stopMotion) setMotion(0, 0)
            if (autoroute.data.center) center()
            stopWalk()
            snapTo(yaw, autoroute.data.pitch)
            swapItem("aspect of the void")
            setSneakKey(true)
            click.register()
            item.register()
            batDeath.register()
            break

        case "batspawn":
            if (config().Autoroute && config().AutorouteDebug) sendMsg(`&7Awaiting Bat..`)
            if (autoroute.data.stopMotion) setMotion(0, 0)
            if (autoroute.data.center) center()
            stopWalk()
            setSneakKey(false)
            snapTo(yaw, autoroute.data.pitch)
            swapItem("hyperion")
            batSpawn.register()
            break

        case "startwalk":
            if (config().Autoroute && config().AutorouteDebug) sendMsg(`&7Walking`)
            if (autoroute.data.stopMotion) setMotion(0, 0)
            if (autoroute.data.center) center()
            setSneakKey(false)
            snapTo(yaw, autoroute.data.pitch)
            setTimeout(() => startWalk(), 50)
            break

        case "pearlclip":
            stopWalk()
            setSneakKey(false)
            pearlClip(autoroute.data.distance)
            break

        case "use":
            if (config().Autoroute && config().AutorouteDebug) sendMsg(`&7Using: &6${autoroute.data.item}&7, &6${yaw}&7, &6${autoroute.data.pitch}`)
            stopWalk()
            setSneakKey(false)
            swapItem(autoroute.data.item)
            snapTo(yaw, autoroute.data.pitch)
            Client.scheduleTask(1, () => {
                if (autoroute.data.leftClick) {
                    leftClick()
                } else {
                    sendBlockPlacement()
                }
            })
            break

        case "wallclip":
            setSneakKey(false)
            snapTo(yaw, autoroute.data.pitch)
            startWalk()
            wallClip.register()
            break

        case "rotate":
            if (config().Autoroute && config().AutorouteDebug) sendMsg(`&7Snapped`)
            if (autoroute.data.stopMotion) setMotion(0, 0)
            if (autoroute.data.center) center()
            stopWalk()
            setSneakKey(false)
            snapTo(yaw, autoroute.data.pitch)
            break
    }
}

function addAutoroute(autoroute) {
    const roomName = getRoomName()
    if (!nodes[roomName]) nodes[roomName] = []

    autoroute.id = `${Date.now()}${Math.random().toString(36).slice(2, 11)}`
    nodes[roomName].push(autoroute)
    saveAutoroute()
    if (config().Autoroute && config().AutorouteDebug) sendMsg(`&7Added autoroute: &6${roomName}`)
}

function chainAutoroute() {
    let closestDistance = Infinity
    let nearestNode = null
    const roomName = DmapDungeon.getCurrentRoom()

    nodes[roomName.name].forEach(node => {
        const realCoord = roomName.getRealCoord([node.x, node.y, node.z])
        const distance = getDistance3D(Player.getX(), Player.getY(), Player.getZ(), realCoord[0], node.y, realCoord[2])
        if (distance < closestDistance) {
            closestDistance = distance
            nearestNode = node
        }
    })

    if (nearestNode && closestDistance <= 2.5) {
        nearestNode.chain = !nearestNode.chain
        saveAutoroute()
        if (config().Autoroute && config().AutorouteDebug) {
            if (nearestNode.chain) {
                sendMsg(`&7Chained autoroute: &6${nearestNode.x}&7, &6${nearestNode.y}&7, &6${nearestNode.z} &7in room: &6${roomName.name}`)
            } else {
                sendMsg(`&7Unchained autoroute: &6${nearestNode.x}&7, &6${nearestNode.y}&7, &6${nearestNode.z} &7in room: &6${roomName.name}`)
            }
        }
    } else {
        if (config().Autoroute && config().AutorouteDebug) sendMsg("&cNo autoroute to chain")
    }
}

function removeAutoroute() {
    let closestDistance = Infinity
    let nearestNode = null
    const roomName = DmapDungeon.getCurrentRoom()

    nodes[roomName.name].forEach(node => {
        const realCoord = roomName.getRealCoord([node.x, node.y, node.z])
        const distance = getDistance3D(Player.getX(), Player.getY(), Player.getZ(), realCoord[0], node.y, realCoord[2])
        if (distance < closestDistance) {
            closestDistance = distance
            nearestNode = node
        }
    })
    
    if (nearestNode && closestDistance <= 2.5) {
        nodes[roomName.name] = nodes[roomName.name].filter(node => node.id !== nearestNode.id)
        saveAutoroute()
        if (config().Autoroute && config().AutorouteDebug) sendMsg(`&7Removed autoroute: &6${nearestNode.x}&7, &6${nearestNode.y}&7, &6${nearestNode.z} &7in room: &6${roomName.name}`)
    } else {
        if (config().Autoroute && config().AutorouteDebug) sendMsg("&cNo autoroute to remove")
    }
}

function renderAutoroute() {
    const autorouteColors = {
        "ether": config().AutorouteEtherColor.map(c => c / 255),
        "awaitsecret": config().AutorouteAwaitSecretColor.map(c => c / 255),
        "batspawn": config().AutorouteBatSpawnColor.map(c => c / 255),
        "startwalk": config().AutorouteStartWalkColor.map(c => c / 255),
        "pearlclip": config().AutoroutePearlClipColor.map(c => c / 255),
        "use": config().AutorouteUseColor.map(c => c / 255),
        "wallclip": config().AutorouteWallClipColor.map(c => c / 255),
        "rotate": config().AutorouteRotateColor.map(c => c / 255)
    }
    const roomName = DmapDungeon.getCurrentRoom()
    if (!roomName || !nodes[roomName.name] || isKeyHeld) return
    
    nodes[roomName.name].forEach(node => {
        const realCoord = roomName.getRealCoord([node.x, node.y, node.z])
        const rgb = autorouteColors[node.type]
        if (config().RenderMode === 0) RenderLib.drawCyl(realCoord[0], node.y + 0.01, realCoord[2], 0.49, 0.49, 0.01, 50, 1, 90, 255, 0, rgb[0], rgb[1], rgb[2], rgb[3], config().RenderAutorouteThroughWalls, true)
        if (config().RenderMode === 1) Render.drawEspBox(realCoord[0], node.y + 0.01, realCoord[2], 0.99, 0, rgb[0], rgb[1], rgb[2], 1, config().RenderAutorouteThroughWalls)
        if (config().RenderMode === 2) RenderLib.drawInnerEspBox(realCoord[0], node.y + 0.01, realCoord[2], 0.99, 0, rgb[0], rgb[1], rgb[2], 0.35, config().RenderAutorouteThroughWalls)

        if (node.type === "pearlclip" && node.data.distance) Tessellator.drawString(node.data.distance, realCoord[0], node.y + 0.05, realCoord[2], 16777215, false, 0.02, false)
    })
}

const triggeredNodes = new Set()

function checkProximity() {
    const roomName = DmapDungeon.getCurrentRoom()
    if (!roomName || !nodes[roomName.name] || isKeyHeld || editMode) return

    nodes[roomName.name].forEach(node => {
        const realCoord = roomName.getRealCoord([node.x, node.y, node.z])
        const distance = getDistance3D(Player.getX(), Player.getY(), Player.getZ(), realCoord[0], node.y, realCoord[2])

        const inNode = node.chain
            ? (
                Math.abs(Player.getX() - realCoord[0]) < 0.001 &&
                Math.abs(Player.getZ() - realCoord[2]) < 0.001 &&
                Player.getY() >= node.y - 0.01 && Player.getY() <= node.y + 0.5
            ) : distance <= 0.5

        if (inNode && !triggeredNodes.has(node.id)) {
            handleAutoroute(node)
            triggeredNodes.add(node.id)
        } else if (!inNode && triggeredNodes.has(node.id)) {
            triggeredNodes.delete(node.id)
        }
    })
}

function saveAutoroute() {
    try {
        FileLib.write(module, path, JSON.stringify(nodes, null, 4))
        if (config().Autoroute && config().AutorouteDebug) sendMsg("&7Autoroutes saved")
    } catch (error) {
        if (config().Autoroute && config().AutorouteDebug) sendMsg(`&cError saving autoroutes: ${error}`)
    }
}

function loadAutoroute() {
    try {
        const data = FileLib.read(module, path)
        if (!data) return
        nodes = JSON.parse(data)
        if (config().Autoroute && config().AutorouteDebug) sendMsg("&7Autoroutes loaded")
    } catch (error) {
        if (config().Autoroute && config().AutorouteDebug) sendMsg(`&cError loading autoroutes: ${error}`)
    }
}

function toggleEditMode() {
    editMode = !editMode
    sendMsg(`&7Edit mode ${editMode ? "&aEnabled" : "&cDisabled"}`)
}