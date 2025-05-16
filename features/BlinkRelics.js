import config from "../config"
import { sendMsg, ArmorStand, C04PacketPlayerPosition, C02PacketUseEntity, Vec3, C03PacketPlayer, setBlockTo, snapTo, leftClick } from "./utils/Utils"
import { getDistanceToCoord, getDistanceToEntity } from "../../BloomCore/utils/Utils"
import PetHelper from "./utils/PetUtils"
import Pathfinder from "./utils/PathfinderUtils"

const standStillTicks = 28
let ticksStill = 0
let inP5 = false
let snap = false
let count = 0
let enoughPlayers = false

const orangePackets = [ 
    [89.48818552494049, 6, 55.45217406749725, true],
    [88.58097032771286, 6.0625, 55.06903517856081, true],
    [87.498816309353, 6.0625, 54.612015400321276, true],
    [86.32114568356045, 6, 54.11465665183678, true],
    [85.09132298405203, 6, 53.59527282304026, true],
    [83.8330252489873, 6, 53.063863298996566, true],
    [82.55918014270298, 6, 52.52588774458525, true],
    [81.27684617074672, 6, 51.98432713717679, true],
    [79.98987727759527, 6, 51.44080909060454, true],
    [78.70037771717725, 6, 50.89622228212472, true],
    [77.40949641227124, 6, 50.35105192957558, true],
    [76.11786067478712, 6, 49.80556296192759, true],
    [74.82581301706753, 6, 49.259900030415416, true],
    [73.53354045087323, 6, 48.71414211462237, true],
    [72.24114508463751, 6, 48.16833233740594, true],
    [70.94868266957135, 6, 47.622494243849054, true],
    [69.65618364583952, 6, 47.076640689568485, true],
    [68.36366463377394, 6, 46.530778693731804, true],
    [67.07113470807684, 6, 45.98491208880495, true],
    [65.77859882353624, 6, 45.43904296731456, true],
    [64.48605968546673, 6, 44.89317247178034, true],
    [63.1935187709702, 6, 44.34730122601809, true],
    [61.90097688654443, 6, 43.801429570631285, true],
    [60.60843447253722, 6, 43.25555769158945, true],
    [59.31589176937851, 6.0625, 42.70968569043196, true]
]
const redPackets = [
    [23.485512018203735, 6, 57.397353172302246, true],
    [24.352063615464257, 6, 56.92946117591761, true],
    [25.38571284880744, 6, 56.37134530044137, true],
    [26.51059740204898, 6, 55.763967181259176, true],
    [27.685296445741105, 6, 55.12969187388936, true],
    [28.887194204378453, 6, 54.48073070006328, true],
    [30.103942463100815, 5.921599998474121, 53.823751042220735, false],
    [30.790707572238603, 5.766367993957519, 53.45293423265625, false],
    [31.438084322275124, 5.535840625044555, 53.10338505151027, false],
    [32.049617664496495, 5.231523797587011, 52.773189412782905, false],
    [32.628533504666045, 5, 52.46060549816404, true],
    [33.71585894068581, 5, 51.873507311886215, true],
    [34.870050703992874, 5, 51.250304849168316, true],
    [36.06075148623942, 5, 50.60738944922443, true],
    [37.2713861951423, 5, 49.95371078430497, true],
    [38.492904829263736, 5, 49.29415537602625, true],
    [39.720366087244756, 5, 48.63139126550067, true],
    [40.951072018229986, 5, 47.96687520334481, true],
    [42.18354954088129, 5, 47.30140257548772, true],
    [43.416994352694616, 5, 46.63540766269709, true],
    [44.65096730445176, 5, 45.96912758229962, true],
    [45.88522862065172, 5, 45.30269180037073, true],
    [47.11964738385575, 5, 44.636171005395816, true]
]
const relicBrushLocations = [
    // red
    [22, 6, 58, "stained_glass"],
    [23, 6, 58, "stained_glass"],
    [22, 6, 57, "birch_fence"],
    [22, 6, 56, "birch_fence"],
    // orange
    [90, 6, 56, "stained_glass"],
    [89, 6, 56, "stained_glass"],
    [90, 6, 54, "birch_fence"],
    [90, 6, 55, "birch_fence"]
]
const relicLocations = [
    {
        relic: "Red",
        paths: [
            { x: 25, y: 5, z: 56, shouldJump: true, shouldSnap: false, yawPitch: [0, 0], ignoreY: true, setPitch: false, setMotion: true, setPosition: false, cancelPath: false },
            { x: 22.925, y: 5, z: 57.7, shouldJump: false, shouldSnap: true, yawPitch: [41.5, 13.5], ignoreY: true, setPitch: false, setMotion: true, setPosition: true, cancelPath: false }
        ]
    },
    {
        relic: "Orange",
        paths: [
            { x: 88, y: 5, z: 54, shouldJump: true, shouldSnap: false, yawPitch: [0, 0], ignoreY: true, setPitch: false, setMotion: true, setPosition: false, cancelPath: false },
            { x: 90.075, y: 5, z: 55.7, shouldJump: false, shouldSnap: true, yawPitch: [-66, 13.5], ignoreY: true, setPitch: false, setMotion: true, setPosition: true, cancelPath: false }
        ]
    },
    {
        relic: "Blue",
        paths: [
            { x: 85.5, y: 5, z: 92.5, shouldJump: true, shouldSnap: false, yawPitch: [0, 0], ignoreY: true, setPitch: false, setMotion: true, setPosition: false, cancelPath: false },
            { x: 89.5, y: 5, z: 94.5, shouldJump: false, shouldSnap: true, yawPitch: [-78.5, 15], ignoreY: true, setPitch: false, setMotion: true, setPosition: true, cancelPath: false }
        ]
    },
    {
        relic: "Green",
        paths: [
            { x: 26.5, y: 5, z: 91.5, shouldJump: true, shouldSnap: false, yawPitch: [0, 0], ignoreY: true, setPitch: false, setMotion: true, setPosition: false, cancelPath: false },
            { x: 22.5, y: 5, z: 93.5, shouldJump: false, shouldSnap: true, yawPitch: [47, 18.5], ignoreY: true, setPitch: false, setMotion: true, setPosition: true, cancelPath: false }
        ]
    },
    {
        relic: "Purple",
        paths: [
            { x: 55.5, y: 5, z: 125.5, shouldJump: true, shouldSnap: false, yawPitch: [0, 0], ignoreY: true, setPitch: false, setMotion: true, setPosition: false, cancelPath: false },
            { x: 56.5, y: 5, z: 130.5, shouldJump: false, shouldSnap: true, yawPitch: [-10.5, 15], ignoreY: true, setPitch: false, setMotion: true, setPosition: true, cancelPath: false }
        ]
    }
]

function addPath(relic) {
    const location = relicLocations.find(loc => loc.relic === relic)
    if (location) location.paths.forEach(path => Pathfinder.addPath(path.x, path.y, path.z, path.shouldJump, path.shouldSnap, path.yawPitch, path.ignoreY, path.setPitch, path.setMotion, path.setPosition, path.cancelPath))
}

register("worldLoad", () => {
    relicClickListener.unregister()
    blinkRelicRegister.unregister()
    renderText.unregister()
    packetCollector.unregister()
    relicAura.unregister()
    ticksStill = 0
    inP5 = false
    snap = false
    count = 0
    enoughPlayers = false
})

const playersInP5 = register("renderWorld", () => {
    count = World.getAllPlayers().filter(entity =>
        entity.getX() >= 2 && entity.getX() <= 108 &&
        entity.getY() >= 1 && entity.getY() <= 20 &&
        entity.getZ() >= 23 && entity.getZ() <= 131
    ).length
    
    enoughPlayers = count >= 4

    if (!enoughPlayers) return
    if (config().AutoP5Debug) sendMsg(`&74+ players in p5`)
    if (config().AutoRunToRelic && config().RelicToRunTo === 4) {
        addPath("Purple")
        count = 0
        enoughPlayers = false
        playersInP5.unregister()
    }
}).unregister()

register("chat", () => {
    inP5 = true
    snap = true
    playersInP5.register()
}).setCriteria("[BOSS] Necron: ARGH!")

register("chat", () => {
    if (!snap) return
    if (config().AutoEquipBlackCat) PetHelper.queuePet("cat")

    if (config().AutoRunToRelic) {
        if (config().RelicToRunTo === 0) addPath("Red")
        else if (config().RelicToRunTo === 1) addPath("Orange")
        else if (config().RelicToRunTo === 2) addPath("Blue")
        else if (config().RelicToRunTo === 3) addPath("Green")
    }
    snap = false
}).setCriteria(/^You have teleported to (\w+)!$/)

register("chat", () => {
    if (!config().BlinkRelics) return
    blinkRelicRegister.register()
    renderText.register()
    packetCollector.register()
    relicClickListener.register()
    relicAura.register()
}).setCriteria("[BOSS] Necron: All this, for nothing...")

register("tick", () => {
    if (!config().BlinkRelics || !inP5) return
    for (let location of relicBrushLocations) {
        let [x, y, z, blockType] = location
        setBlockTo(x, y, z, blockType)
    }
})

const blinkRelicRegister = register("tick", () => {
    if (!Player.getPlayer().field_70124_G || Player.getPlayer().field_70159_w !== 0 || Player.getPlayer().field_70179_y !== 0) ticksStill = 0
    else if (ticksStill < standStillTicks) ticksStill++
}).unregister()

const packetCollector = register("packetSent", (packet, event) => {
    if (getDistanceToCoord(90.075, 6, 55.700) < 0.01 || getDistanceToCoord(22.925, 6, 57.700) < 0.01) if (ticksStill !== 0) cancel(event)
}).setFilteredClasses([C03PacketPlayer]).unregister()

const renderText = register("renderOverlay", () => {
    const scale = 1
    Renderer.scale(scale)
    const text = `&7Blink ready in &6${standStillTicks - ticksStill} &7ticks`
    Renderer.drawStringWithShadow(text, (Renderer.screen.getWidth() / scale - Renderer.getStringWidth(text)) / 2, Renderer.screen.getHeight() / scale / 2 + 15)
}).unregister()

const relicClickListener = register("packetSent", (packet) => {
    const entity = packet.func_149564_a(World.getWorld())
    if (!entity instanceof ArmorStand) return
    const entityWornHelmet = entity.func_82169_q(3)
    if (!entityWornHelmet) return
    const helmetName = ChatLib.removeFormatting(new Item(entityWornHelmet).getName())
    if (!helmetName.includes("Relic")) return

    relicClickListener.unregister()
    blinkRelicRegister.unregister()
    packetCollector.unregister()
    renderText.unregister()

    if (helmetName === "Corrupted Orange Relic") {
        if (config().BlinkRelics && ticksStill >= standStillTicks && getDistanceToCoord(90.075, 6, 55.700) < 0.1 && Player.getPlayer().func_110148_a(net.minecraft.entity.SharedMonsterAttributes.field_111263_d).func_111126_e() > 0.49) {
            snapTo(90, 0)
            Client.scheduleTask(0, () => {
                orangePackets.forEach(packet => Client.sendPacket(new C04PacketPlayerPosition(...packet)))
                const finalPacketPos = [orangePackets[orangePackets.length - 1][0], orangePackets[orangePackets.length - 1][1], orangePackets[orangePackets.length - 1][2],]
                Player.getPlayer().func_70107_b(...finalPacketPos)
            })
            Client.scheduleTask(2, () => leftClick())
        }
    } else if (helmetName === "Corrupted Red Relic") {
        if (config().BlinkRelics && ticksStill >= standStillTicks && getDistanceToCoord(22.925, 6, 57.700) < 0.1 && Player.getPlayer().func_110148_a(net.minecraft.entity.SharedMonsterAttributes.field_111263_d).func_111126_e() > 0.49) {
            snapTo(-118, 0)
            Client.scheduleTask(0, () => {
                redPackets.forEach(packet => Client.sendPacket(new C04PacketPlayerPosition(...packet)))
                const finalPacketPos = [redPackets[redPackets.length - 1][0], redPackets[redPackets.length - 1][1], redPackets[redPackets.length - 1][2],]
                Player.getPlayer().func_70107_b(...finalPacketPos)
            })
            Client.scheduleTask(2, () => leftClick())
        }
    }
    ticksStill = 0
}).setFilteredClass(C02PacketUseEntity).unregister()

const interactWithEntity = (entity) => {
    const objectMouseOver = Client.getMinecraft().field_71476_x.field_72307_f
    const dx = objectMouseOver.xCoord - entity.field_70165_t
    const dy = objectMouseOver.yCoord - entity.field_70163_u
    const dz = objectMouseOver.zCoord - entity.field_70161_v
    const packet = new net.minecraft.network.play.client.C02PacketUseEntity(entity, new Vec3(dx, dy, dz))
    Client.sendPacket(packet)
}

const relicAura = register("tick", () => {
    const armorStands = World.getAllEntitiesOfType(ArmorStand)
    const entity = armorStands.find(e => new EntityLivingBase(e?.getEntity()).getItemInSlot(4)?.getNBT()?.toString()?.includes("Relic") && getDistanceToEntity(e) < 4)
    if (!config().RelicAura || !entity) return
    sendMsg(`&6${getDistanceToEntity(entity)}`)
    interactWithEntity(entity.getEntity())
    Client.scheduleTask(1, () => relicAura.unregister())
}).unregister()