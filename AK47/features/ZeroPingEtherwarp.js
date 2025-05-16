import config from "../config"
import { C06PacketPlayerPosLook, C08PacketPlayerBlockPlacement, S08PacketPlayerPosLook, C0BPacketEntityAction, sendMsg } from "./utils/Utils"
import { getEtherwarpBlock, getLastSentLook, getSkyblockItemID } from "../../BloomCore/utils/Utils"

const recentlySentC06s = []
let ether
let enoughMana = true
let enoughSoulflow = true
let mana = "0/0"

const validEtherwarpItems = new Set([
    "ASPECT_OF_THE_END",
    "ASPECT_OF_THE_VOID",
    "ETHERWARP_CONDUIT",
])

const isHoldingEtherwarpItem = () => {
    const held = Player.getHeldItem()
    const sbId = getSkyblockItemID(held)
    if (!validEtherwarpItems.has(sbId)) return false
    return held.getNBT()?.toObject()?.tag?.ExtraAttributes?.ethermerge == 1 || sbId == "ETHERWARP_CONDUIT"
}

const getTunerBonusDistance = () => {
    return Player.getHeldItem()?.getNBT()?.toObject()?.tag?.ExtraAttributes?.tuned_transmission || 0
}

const doZeroPingEtherwarp = () => {
    if (!enoughMana || !enoughSoulflow) return

    const rt = getEtherwarpBlock(true, 57 + getTunerBonusDistance() - 1)
    if (!rt) return

    let [pitch, yaw] = getLastSentLook()
    yaw %= 360
    if (yaw < 0) yaw += 360

    let [x, y, z] = rt
    x += 0.5
    y += 1.05
    z += 0.5
    
    recentlySentC06s.push({ pitch, yaw, x, y, z, sentAt: Date.now() })
    Client.scheduleTask(0, () => {
        Client.sendPacket(new C06PacketPlayerPosLook(x, y, z, yaw, pitch, Player.asPlayerMP().isOnGround()))
        Player.getPlayer().func_70107_b(x, y, z)
        Player.getPlayer().func_70016_h(0, 0, 0)
    })
}

const blacklistedIds = [54, 146]

register("packetSent", (packet) => {
    if (!config().ZeroPingEtherwarp) return

    const dir = packet.func_149568_f()
    if (dir !== 255) return

    const held = Player.getHeldItem()
    const item = getSkyblockItemID(held)
    const blockID = Player.lookingAt()?.getType()?.getID()
    if (!ether || !getLastSentLook() || !isHoldingEtherwarpItem() && item !== "ETHERWARP_CONDUIT" || blacklistedIds.includes(blockID)) return
    doZeroPingEtherwarp()
}).setFilteredClass(C08PacketPlayerBlockPlacement)

const isWithinTolerence = (n1, n2) => Math.abs(n1 - n2) < 1e-4

register("packetReceived", (packet, event) => {
    if (!config().ZeroPingEtherwarp || !recentlySentC06s.length) return

    const { pitch, yaw, x, y, z, sentAt } = recentlySentC06s.shift()
    const newPitch = packet.func_148930_g()
    const newYaw = packet.func_148931_f()
    const newX = packet.func_148932_c()
    const newY = packet.func_148928_d()
    const newZ = packet.func_148933_e()
    const lastPresetPacketComparison = {
        pitch: isWithinTolerence(pitch, newPitch) || newPitch == 0,
        yaw: isWithinTolerence(yaw, newYaw) || newYaw == 0,
        x: x == newX,
        y: y == newY,
        z: z == newZ
    }

    const wasPredictionCorrect = Object.values(lastPresetPacketComparison).every(a => a == true)

    if (wasPredictionCorrect) { 
        if (config().ZpewSuccessSound) setTimeout(() => World.playSound("random.orb", 0.35, 2), 1)
        return cancel(event)
    }
    while (recentlySentC06s.length) recentlySentC06s.shift()
}).setFilteredClass(S08PacketPlayerPosLook)

register("packetSent", packet => {
	const action = packet.func_180764_b()
	if (action == C0BPacketEntityAction.Action.START_SNEAKING) ether = true
	if (action == C0BPacketEntityAction.Action.STOP_SNEAKING) ether = false
}).setFilteredClass(C0BPacketEntityAction)

//mana & soulflow check
register("actionBar", () => {
    sendMsg(`&7Not enough mana`)
    enoughMana = false
    if (!enoughMana) Client.scheduleTask(100, () => enoughMana = true)
}).setCriteria("NOT ENOUGH MANA").setContains()

register("actionBar", (m) => {
    mana = m.replace(/,/g, "")

    const [currentManaStr, maxManaStr] = mana.split("/")
    const currentMana = parseInt(currentManaStr, 10)
    const maxMana = parseInt(maxManaStr, 10)

    if (isNaN(currentMana) || isNaN(maxMana)) return

    enoughMana = currentMana >= maxMana * 0.1
}).setCriteria("${*}     ${m}✎ Mana").setContains()

register("chat", () => enoughSoulflow = false).setCriteria("Not enough soulflow!")
register("chat", () => enoughSoulflow = false).setCriteria("nOt EnOuGh SoUlFlOw!")
register("worldLoad", () => enoughSoulflow = true)