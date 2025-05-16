import config from "../config"
import { sendMsg, snapTo, getDistance3D, startWalk, stopWalk, doJump, setMotion, center, calcYawPitch, edgeJump, awaitTerm, inSingleplayer, isPlayerInBox, motion, unpressKeys, holdKey } from "./utils/Utils"
import { slingshot } from "./Slingshot"
import { scheduleTask } from "./utils/S32ScheduleTask"
import RenderLib from "RenderLib"

let module = "AK47"
let basePath = "data/AutoP3/"
let routeName = "DefaultRoute"
let path = `${basePath}${routeName}.json`
let nodes = []
let editMode = false
let exactMode = false
let inBoss = false

register("command", (...args) => {
    const [x, y, z] = [Player.getX(), Player.getY(), Player.getZ()]
    const motionArg = (arg) => args.slice(arg).includes("motion")
    let radius = args[args.length - 1]
    let data = {
        walk: args.includes("walk"),
        stop: args.includes("stop"),
        rotate: args.includes("rotate"),
        term: args.includes("term"),
        motion: false,
        center: args.includes("center"),
        jump: args.includes("jump"),
        edge: args.includes("edge")
    }

    if (args[0] === "add") {
        if (args[1] === "rotate") {
            data.yaw = isNaN(parseFloat(args[2])) ? Player.getYaw() : parseFloat(args[2])
            data.pitch = isNaN(parseFloat(args[3])) ? Player.getPitch() : parseFloat(args[3])
            if (motionArg(4)) data.motion = true
            const route = { type: args[1], data, x, y, z, radius }
            addRoute(route)
        } else if (args[1] === "motion") {
            data.dir = isNaN(parseFloat(args[2])) ? Player.getYaw() : parseFloat(args[2])
            if (motionArg(3)) data.motion = true
            const route = { type: args[1], data, x, y, z, radius }
            addRoute(route)
        } else if (args[1] === "wait") {
            data.ticks = isNaN(parseFloat(args[2])) ? 20 : parseFloat(args[2])
            data.yaw = isNaN(parseFloat(args[3])) ? Player.getYaw() : parseFloat(args[3])
            data.pitch = isNaN(parseFloat(args[4])) ? Player.getPitch() : parseFloat(args[4])
            if (motionArg(5)) data.motion = true
            const route = { type: args[1], data, x, y, z, radius }
            addRoute(route)
        } else if (args[1] === "coord") {
            data.coordX = parseFloat(args[2])
            data.coordY = parseFloat(args[3])
            data.coordZ = parseFloat(args[4])
            if (motionArg(5)) data.motion = true
            const route = { type: args[1], data, x, y, z, radius }
            addRoute(route)
        } else if (args[1] === "hclip") {
            data.dir = isNaN(parseFloat(args[2])) ? Player.getYaw() : parseFloat(args[2])
            if (motionArg(3)) data.motion = true
            const route = { type: args[1], data, x, y, z, radius }
            addRoute(route)
        } else if (args[1] === "key") {
            data.key = args[2]
            const route = { type: args[1], data, x, y, z, radius }
            addRoute(route)
        } else if (args[1] === "cmd") {
            data.command = args.slice(2, args.length - 1).join(" ")
            const route = { type: args[1], data, x, y, z, radius }
            addRoute(route)
        } else if (args[1] === "blink") {
            data.blinkroute = args.slice(2, args.length - 1).join(" ")
            const route = { type: args[1], data, x, y, z, radius }
            addRoute(route)
        } else {
            sendMsg(`&cInvalid ring type`)
        }
    } else if (args[0] === "remove") removeRoute()
    else if (args[0] === "em") toggleEditMode()
    else if (args[0] === "exact") toggleExactMode()
    else if (["createroute", "create"].includes(args[0])) createRoute(args[1])
    else if (["switchroute", "switch"].includes(args[0])) switchRoute(args[1])
    else if (["deleteroute", "delete"].includes(args[0])) deleteRoute(args[1])
    else if (["currentroute", "current"].includes(args[0])) sendMsg(`&7Current Route: &6${routeName}`)
}).setName("autop3").setAliases(["ap3", "p3"])

register("step", () => inBoss = isPlayerInBox(-8, 0, 148, 135, 255, -8)).setFps(10)
register("worldLoad", () => loadCurrentRoute())
register("renderWorld", () => { if (!config().DisableRingRendering && config().AutoP3 && (config().DisregardBossCheck || inBoss)) renderNodes() })
register("renderWorld", () => checkProximity())
register("chat", (event) => {
    const message = ChatLib.removeFormatting(ChatLib.getChatMessage(event))

    if (!config().AutoP3) return
    if (config().ToggleBossEntryRoute && message.startsWith("[BOSS] Maxor: WELL! WELL! WELL! LOOK WHO'S HERE!")) switchRoute(config().BossEntryRoute)
    if (config().ToggleP3StartRoute && message.startsWith("[BOSS] Storm: I'd be happy to show you what that's like!")) switchRoute(config().P3StartRoute)
})
register("renderOverlay", () => {
    if (!editMode) return
    const scale = 1
    Renderer.scale(scale)
    const text = `&7Edit Mode`
    Renderer.drawStringWithShadow(text, (Renderer.screen.getWidth() / scale - Renderer.getStringWidth(text)) / 2, Renderer.screen.getHeight() / scale / 2 + 15)
})

function handleRoute(route) {
    if (!config().AutoP3 || editMode) return

    switch (route.type) {
        case "rotate":
            if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Snapped: &6${route.data.yaw}&7, &6${route.data.pitch}&7, &6${route.data.walk}&7, &6${route.data.stop}&7, &6${route.data.motion}&7, &6${route.data.center}&7, &6${route.data.jump}&7, &6${route.data.edge}`)
            snapTo(route.data.yaw, route.data.pitch)
            if (route.data.walk) startWalk(); motion(null)
            if (route.data.stop) stopWalk(); motion(null)
            if (route.data.term) awaitTerm(); motion(null)
            if (route.data.motion) setMotion(0, 0)
            if (route.data.center) center()
            if (route.data.jump) doJump()
            if (route.data.edge) edgeJump()
            break

        case "motion":
            if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Motion: &6${route.data.dir}&7, &6${route.data.rotate}&7, &6${route.data.motion}&7, &6${route.data.center}&7, &6${route.data.jump}&7, &6${route.data.edge}`)
            stopWalk()
            motion(route.data.dir)
            if (route.data.rotate) snapTo(route.data.dir, Player.getPitch())
            if (route.data.motion) setMotion(0, 0)
            if (route.data.center) center()
            if (route.data.jump) doJump()
            if (route.data.edge) edgeJump()
            break

        case "wait":
            if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Waiting &6${route.data.ticks} &7Ticks, &6${route.data.motion}&7, &6${route.data.center}&7, &6${route.data.jump}&7, &6${route.data.edge}`)
            motion(null)
            stopWalk()
            snapTo(route.data.yaw, route.data.pitch)
            if (inSingleplayer) { Client.scheduleTask(route.data.ticks, () => startWalk()) } else scheduleTask(() => startWalk(), route.data.ticks)
            if (route.data.motion) setMotion(0, 0)
            if (route.data.center) center()
            if (route.data.jump) doJump()
            if (route.data.edge) edgeJump()
            break

        case "coord":
            const [yaw, pitch] = calcYawPitch({ x: route.data.coordX, y: route.data.coordY, z: route.data.coordZ })
            if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Coord Snapped: &6${route.data.coordX}&7, &6${route.data.coordY}&7, &6${route.data.coordZ}&7, &6${route.data.walk}&7, &6${route.data.stop}&7, &6${route.data.motion}&7, &6${route.data.center}&7, &6${route.data.jump}&7, &6${route.data.edge}`)
            snapTo(yaw, pitch)
            if (route.data.walk) startWalk(); motion(null)
            if (route.data.stop) stopWalk(); motion(null)
            if (route.data.term) awaitTerm(); motion(null)
            if (route.data.motion) setMotion(0, 0)
            if (route.data.center) center()
            if (route.data.jump) doJump()
            if (route.data.edge) edgeJump()
            break

        case "hclip":
            if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Slingshotting &6${route.data.dir}&7, &6${route.data.rotate}&7, &6${route.data.motion}&7, &6${route.data.center}&7, &6${route.data.jump}&7, &6${route.data.edge}`)
            motion(null)
            slingshot(route.data.dir)
            Client.scheduleTask(2, () => startWalk())
            if (route.data.rotate) snapTo(route.data.dir, Player.getPitch())
            if (route.data.motion) setMotion(0, 0)
            if (route.data.center) center()
            break

        case "key":
            if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Key: &6${route.data.key}`)
            unpressKeys()
            setTimeout(() => holdKey(route.data.key), 10)
            break

        case "cmd":
            if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Sent: &6${route.data.command}`)
            ChatLib.command(route.data.command, true)
            break

        case "blink":
            if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Sent: &6${route.data.blinkroute}`)
            ChatLib.command(`playroute ${route.data.blinkroute}`, true)
            stopWalk(); motion(null)
            setMotion(0, 0)
            break
    }
}

function addRoute(route) {
    const [px, py, pz] = [Player.getX(), Player.getY(), Player.getZ()]

    if (exactMode) {
        route.x = px
        route.y = py
        route.z = pz
    } else {
        route.x = Math.floor(px) + 0.5
        route.y = Math.floor(py)
        route.z = Math.floor(pz) + 0.5
    }

    route.id = `${Date.now()}${Math.random().toString(36).slice(2, 11)}`
    nodes.push(route)
    saveRoutes()
    if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&6Ring added: ${JSON.stringify(route)}`)
}

function removeRoute() {
    const [px, py, pz] = [Player.getX(), Player.getY(), Player.getZ()]
    let closestDistance = Infinity
    let closestRouteIndex = -1

    Object.values(nodes).forEach((route, i) => {
        const distance = getDistance3D(px, py, pz, route.x, route.y, route.z)
        if (distance < closestDistance) {
            closestDistance = distance
            closestRouteIndex = i
        }
    })

    if (closestRouteIndex !== -1) {
        const removedRoute = nodes.splice(closestRouteIndex, 1)[0]
        saveRoutes()
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&6Ring removed: ${JSON.stringify(removedRoute)}`)
    } else {
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&cNo rings to remove`)
    }
}

const triggeredNodes = new Set()

function checkProximity() {
    const [px, py, pz] = [Player.getX(), Player.getY(), Player.getZ()]

    if (editMode || !inBoss && !config().DisregardBossCheck) return

    Object.values(nodes).forEach(node => {
        const xzRadius = node.radius * 1
        const yRadius = 1.5
        const inNode = Math.abs(px - node.x) <= xzRadius &&
                       Math.abs(pz - node.z) <= xzRadius &&
                       Math.abs(py - node.y) <= yRadius

        if (inNode && !triggeredNodes.has(node.id)) {
            handleRoute(node)
            triggeredNodes.add(node.id)
        } else if (!inNode && triggeredNodes.has(node.id)) {
            triggeredNodes.delete(node.id)
        }
    })
}

function renderNodes() {
    const autoP3Colors = {
        "rotate": config().AutoP3RotateColor.map(c => c / 255),
        "motion": config().AutoP3MotionColor.map(c => c / 255),
        "wait": config().AutoP3WaitColor.map(c => c / 255),
        "coord": config().AutoP3CoordSnapColor.map(c => c / 255),
        "hclip": config().AutoP3HClipColor.map(c => c / 255),
        "key": config().AutoP3KeyColor.map(c => c / 255),
        "cmd": config().AutoP3CmdColor.map(c => c / 255),
        "blink": config().AutoP3BlinkColor.map(c => c / 255)
    }

    Object.values(nodes).forEach(node => {
        if ([node.x, node.y, node.z].every(coord => typeof coord === "number")) {
            const radius = node.radius * 1.4 || 1
            let rgb = triggeredNodes.has(node.id) ? [1, 0, 0, 1] : autoP3Colors[node.type]
            RenderLib.drawCyl(node.x, node.y + 0.01, node.z, radius, radius, 0.1, 4, 1, 270, 45, 0, rgb[0], rgb[1], rgb[2], rgb[3], config().RenderRingsThroughWalls, true)
            if (node.type === "blink" && node.data.blinkroute) Tessellator.drawString(`Blink: ${node.data.blinkroute}`, node.x, node.y + 0.65, node.z, 16777215, false, 0.02, false)
        } else {
            if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&cInvalid node data: ${JSON.stringify(node)}`)
        }
    })
}

function saveRoutes() {
    try {
        FileLib.write(module, path, JSON.stringify(nodes, null, 4))
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Route &6${routeName} &7saved`)
    } catch (error) {
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&cError saving route &6${routeName}&c: ${error}`)
    }
}

function loadRoutes() {
    try {
        const data = FileLib.read(module, path)
        if (!data) return
        nodes = JSON.parse(data)
        if (config().Autoroute && config().AutorouteDebug) sendMsg(`&7Route &6${routeName} &7loaded`)
    } catch (error) {
        if (config().Autoroute && config().AutorouteDebug) sendMsg(`&cError loading route &6${routeName}&c: ${error}`)
    }
}

function toggleEditMode() {
    editMode = !editMode
    sendMsg(`&7Edit Mode ${editMode ? "&aenabled" : "&cdisabled"}`)
}

function toggleExactMode() {
    exactMode = !exactMode
    sendMsg(`&7Exact Mode ${exactMode ? "&aenabled" : "&cdisabled"}`)
}

// route switching stuff
function loadCurrentRoute() {
    const currentRoutePath = `${basePath}CurrentRoute.json`
    try {
        const data = FileLib.read(module, currentRoutePath)
        routeName = data ? JSON.parse(data).CurrentRoute : "DefaultRoute"
    } catch (error) {
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&cError loading current route: ${error}`)
        routeName = "DefaultRoute"
    }
    path = `${basePath}${routeName}.json`
    loadRoutes()
}

function saveCurrentRoute() {
    const currentRoutePath = `${basePath}CurrentRoute.json`
    try {
        FileLib.write(module, currentRoutePath, JSON.stringify({ CurrentRoute: routeName }))
    } catch (error) {
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&cError saving current route: ${error}`)
    }
}

function createRoute(route) {
    const routePath = `${basePath}${route}.json`
    try {
        if (FileLib.exists(module, routePath)) if (config().AutoP3 && config().AutoP3Debug) return sendMsg(`&cRoute &6${route} &calready exists`)
        FileLib.write(module, routePath, JSON.stringify([]))
        routeName = route
        path = routePath
        saveCurrentRoute()
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Created route &6${route}`)
    } catch (error) {
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&cError creating route &6${route}&c: ${error}`)
    }
}

function switchRoute(route) {
    const routePath = `${basePath}${route}.json`
    try {
        if (!FileLib.exists(module, routePath)) if (config().AutoP3 && config().AutoP3Debug) return sendMsg(`&7Route &6${route} &7does not exist`)
        routeName = route
        path = routePath
        loadRoutes()
        saveCurrentRoute()
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Switched to route &6${route}`)
    } catch (error) {
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&cError switching route to &6${route}&c: ${error}`)
    }
}

function deleteRoute(route) {
    const routePath = `${basePath}${route}.json`
    try {
        if (routeName === route) {
            routeName = "DefaultRoute"
            path = `${basePath}${routeName}.json`
            loadRoutes()
            saveCurrentRoute()
        }
        FileLib.delete(module, routePath)
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&7Route &6${route} &7deleted`)
    } catch (error) {
        if (config().AutoP3 && config().AutoP3Debug) sendMsg(`&cError deleting route &6${route}&c: ${error}`)
    }
}