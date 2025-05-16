import config from "../config"
import { C03PacketPlayer, S08PacketPlayerPosLook, C04PacketPlayerPosition, sendMsg, setMotion, stopWalk, motion, center } from "./utils/Utils"
import { drawLine3d } from "../../BloomCore/utils/Utils"
import RenderLibV2 from "RenderLibV2"

new KeyBind("Stop Recording - Blink", Keyboard.KEY_NONE, "AK-47").registerKeyPress(() => toggleRecording(false))
new KeyBind("Charge Packets - Blink", Keyboard.KEY_NONE, "AK-47").registerKeyPress(() => toggleCharge())

let missingPackets = 0
let ticksStill = 0
let chargingPackets = false
let S08Received = false
let inBoss = false

let previousPacket = [0, 0, 0]
let packetsLogged
let packetLogToggle = false
let selectedRouteName

const renderText = register("renderOverlay", () => {
    if (!config().Blink) return
    const text = `&6${missingPackets}`
    const scale = 1
    Renderer.scale(scale)
    Renderer.drawStringWithShadow(text, (Renderer.screen.getWidth() / scale - Renderer.getStringWidth(text)) / 2, Renderer.screen.getHeight() / scale / 2 + 15)
}).unregister()

const packetCounter = register("packetSent", (packet, event) => {
    Client.scheduleTask(0, () => {
        if (event.isCancelled() && missingPackets < 400) missingPackets++
    })
}).setFilteredClasses([C03PacketPlayer])

const packetCollector = register("packetSent", (packet, event) => {
    const packetName = packet.class.getSimpleName()
    if (packetName === "C06PacketPlayerPosLook" && S08Received) return
    if ((packetName === "C05PacketPlayerLook" || packetName === "C06PacketPlayerPosLook")) return
    if (ticksStill === 0 || !Player.asPlayerMP().isOnGround()) return

    if (missingPackets < 400) cancel(event)
}).setFilteredClasses([C03PacketPlayer]).unregister()

let posLastTick = [Player.getX(), Player.getY(), Player.getZ()]
register("tick", () => {
    const posThisTick = [Player.getX(), Player.getY(), Player.getZ()]
    if ((!Player.getPlayer().field_70124_G || Player.getPlayer().field_70159_w !== 0 || Player.getPlayer().field_70179_y !== 0) || posThisTick.some((a, index) => a !== posLastTick[index])) {
        ticksStill = 0
        posLastTick = [...posThisTick]
        return
    }
    posLastTick = [...posThisTick]
    ticksStill++
})

register("packetReceived", () => {
    S08Received = true
    Client.scheduleTask(1, () => S08Received = false)
}).setFilteredClass(S08PacketPlayerPosLook)

register("chat", () => {
    if (!config().Blink) return

    packetCollector.register()
    renderText.register()
    chargingPackets = true
    inBoss = true
}).setCriteria("[BOSS] Maxor: WELL! WELL! WELL! LOOK WHO'S HERE!")

register("chat", () => {
    if (!config().Blink) return

    packetCollector.unregister()
    renderText.unregister()
    chargingPackets = false
    inBoss = false
}).setCriteria("The Core entrance is opening!")

register("worldUnload", () => {
    packetCollector.unregister()
    renderText.unregister()
    packetLogger.unregister()
    packetLogToggle = false
    missingPackets = 0
    chargingPackets = false
    inBoss = false
})

register("command", (...args) => {
    if (!args) return sendMsg(`&7No route specified`)
    if (!Player.asPlayerMP().isOnGround()) return sendMsg(`&7Not on ground`)
    if (!chargingPackets) return sendMsg(`&7You are not charging packets`)
    const routeName = args.join(" ")
    if (!FileLib.exists("AK47/data/Blink/", routeName + ".json")) return sendMsg(`&7Route doesn't exist`)
    const packets = parseFile(routeName + ".json")
    if (!packets) return sendMsg(`&7Unknown error`)
    if (packets.length > missingPackets) return sendMsg(`&7Required packets: &6${packets.length}`)

    const firstPacket = packets[0]
    if (firstPacket.length !== 4) return sendMsg(`&7Invalid route data`)
    const [firstX, firstY, firstZ] = [parseFloat(firstPacket[0]), parseFloat(firstPacket[1]), parseFloat(firstPacket[2])]
    const distance = Math.sqrt(
        Math.pow(Player.getX() - firstX, 2) +
        Math.pow(Player.getY() - firstY, 2) +
        Math.pow(Player.getZ() - firstZ, 2)
    )
    if (distance > 1) return sendMsg(`&7Not within 1 block of first coord`)

    packetCounter.unregister()
    packetCollector.unregister()

    for (let i = 0; i < packets.length; i++) {
        let packet = packets[i]
        if (packet.length !== 4) continue

        const [x, y, z, onGround] = [parseFloat(packet[0]), parseFloat(packet[1]), parseFloat(packet[2]), packet[3] === "true"]
        Client.sendPacket(new C04PacketPlayerPosition(x, y, z, onGround))
        missingPackets--
        let packet2 = packets[i - 1]
        if (!packet2) continue
        if (packet2.length !== 4) continue
    }

    const finalPacket = packets[packets.length - 1]
    Player.getPlayer().func_70107_b(parseFloat(finalPacket[0]), parseFloat(finalPacket[1]), parseFloat(finalPacket[2]))
    sendMsg(`&7Blinked &6${packets.length} &7packets`)
    Client.scheduleTask(1, () => {
        packetCounter.register()
        packetCollector.register()
    })
}).setName("playroute")

function toggleCharge() {
    chargingPackets = !chargingPackets
    if (chargingPackets) {
        renderText.register()
        packetCollector.register()
        sendMsg(`&7Charging packets`)
    } else {
        packetCollector.unregister()
        renderText.unregister()
        sendMsg(`&7Stopped charging packets`)
    }
}

// Packet Logger
register("command", () => toggleRecording(false)).setName("stoprecording")

register("command", (...args) => {
    selectedRouteName = args.join(" ")
    if (!selectedRouteName) return sendMsg(`&7No route name specified`)
    toggleRecording(true)
}).setName("blinkrecord")

const packetLogger = register("packetSent", (packet) => {
    if (packet.class.getSimpleName() === "C05PacketPlayerLook" || packet.class.getSimpleName() === "C03PacketPlayer") return
    let currentPacket = packetGetXYZ(packet)
    if (currentPacket.every((param, index) => param == previousPacket[index])) return
    FileLib.append("AK47/data/Blink/", selectedRouteName + ".json", `\n${packet.func_149464_c()}, ${packet.func_149467_d()}, ${packet.func_149472_e()}, ${packet.func_149465_i()}`)
    packetsLogged++
    previousPacket = packetGetXYZ(packet)
    updateRoutes()
}).setFilteredClasses([C03PacketPlayer]).unregister()

function toggleRecording(state = !selectedRouteName) {
    if (!selectedRouteName) return sendMsg(`&7No route selected`)

    packetLogToggle = state

    if (packetLogToggle) {
        FileLib.delete("AK47/data/Blink/", selectedRouteName + ".json")
        FileLib.append("AK47/data/Blink/", selectedRouteName + ".json", `Speed when this route was recorded: ${((Player.getPlayer().field_71075_bZ.func_75094_b()) * 1000).toFixed(0)}`)
        packetLogger.register()
        sendMsg(`&7Started recording ${selectedRouteName}.json`)
        packetsLogged = 0
    } else {
        packetLogger.unregister()
        sendMsg(`&7Stopped recording &6${packetsLogged} &7packets logged`)
        selectedRouteName = ""
        previousPacket = [0, 0, 0]
    }
}

// File Stuff
const File = Java.type("java.io.File")

let routes = []
let parsedFiles = []

register("command", (...args) => {
    const fileName = args.join(" ")
    const dir = new File("./config/ChatTriggers/modules/AK47/data/Blink")
    if (!dir.exists()) dir.mkdirs()
    if (FileLib.exists("AK47/data/Blink", fileName + ".json")) return sendMsg(`&7Route already exists`)
    FileLib.write("AK47/data/Blink", fileName + ".json", "")
    sendMsg(`&7Created ${fileName}.json`)
}).setName("blinkcreate")

register("command", (...args) => {
    const fileName = args.join(" ")
    if (!FileLib.exists("AK47/data/Blink", fileName + ".json")) return sendMsg(`&7Route doesn't exist`)
    FileLib.delete("AK47/data/Blink/", fileName + ".json")
    sendMsg(`&7Deleted ${fileName}.json`)
}).setName("blinkdelete")

const renderRoutes = register("renderWorld", () => {
    if (!routes) return
    parsedFiles.forEach((file, index) => {
        if (!file) return
        for (let i = 0; i < file.length; i++) {
            let Vec1 = file[i]
            let Vec2 = file[i + 1]
            if (!Vec1 || !Vec2) continue
            if (config().RenderBlinkLine) drawLine3d(parseFloat(Vec1[0]), parseFloat(Vec1[1]) + 0.01, parseFloat(Vec1[2]), parseFloat(Vec2[0]), parseFloat(Vec2[1]), parseFloat(Vec2[2]), 1, 1, 1, 1, 1, false)
        }
        let Vec1 = file[0]
        let Vec2 = file[file.length - 1]
        if (!Vec1 || !Vec2) return
        if (config().RenderBlinkStartEnd) {
            RenderLibV2.drawEspBox(parseFloat(Vec1[0]), parseFloat(Vec1[1]), parseFloat(Vec1[2]), 0.25, 0.25, 0, 1, 0, 1, true) // start
            RenderLibV2.drawEspBox(parseFloat(Vec2[0]), parseFloat(Vec2[1]), parseFloat(Vec2[2]), 0.25, 0.25, 1, 0, 0, 1, true) // end
        }
        Tessellator.drawString(`${file.length} packets`, Vec1[0], Vec1[1], Vec1[2], 16777215, false, 0.02, false)
    })
}).unregister()

register("step", () => {
    updateRoutes()
    if (config().Blink && inBoss) renderRoutes.register()
    else renderRoutes.unregister()
}).setDelay(1)

function updateRoutes() {
    routes = new File("./config/ChatTriggers/modules/AK47/data/Blink").list()
    parsedFiles = routes.map(fileName => parseFile(fileName))
}

function parseFile(fileName) {
    try {
        const packets = FileLib.read("AK47/data/Blink", fileName).split("\n").map(str => str.split(", "))
        packets.shift()
        return packets
    } catch (e) {
        return null
    }
}

function packetGetXYZ(packet) {
    return [packet.func_149464_c(), packet.func_149467_d(), packet.func_149472_e()]
}

register("command", (...args) => {
    if (args[0] === "start") {
        if (config().RenderBlink) renderRoutes.register()
        packetCollector.register()
        renderText.register()
        inBoss = true
        chargingPackets = true
        missingPackets = 0
    } else if (args[0] === "stop") {
        if (config().RenderBlink) renderRoutes.unregister()
        packetCollector.unregister()
        renderText.unregister()
        packetLogger.unregister()
        inBoss = false
        chargingPackets = false
        missingPackets = 0
        packetLogToggle = false
    }
}).setName("blink")