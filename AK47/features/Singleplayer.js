import config from "../config"
import { sendMsg, C08PacketPlayerBlockPlacement, inSingleplayer, holdingAOTV, C02PacketUseEntity } from "./utils/Utils"
import { getEtherwarpBlock } from "../../BloomCore/utils/Utils"

register("packetSent", (packet) => {
    if (!config().SingleplayerEtherwarp || !inSingleplayer() || !holdingAOTV() || !Player.isSneaking()) return

    const dir = packet.func_149568_f()
    if (dir !== 255) return

    const target = getEtherwarpBlock()
    if (!target) return
    const [x, y, z] = target

    World.playSound("mob.enderdragon.hit", 1, 0.5396825671195984)

    Client.scheduleTask(0, () => {
        Player.getPlayer().func_70107_b(x+0.5, y+1.05, z+0.5)
        Player.getPlayer().func_70016_h(0, 0, 0)
    })
}).setFilteredClass(C08PacketPlayerBlockPlacement)

register("tick", () => {
    if (!inSingleplayer()) return
    const { field_70159_w: motionX, field_70179_y: motionZ } = Player.getPlayer()
    const block = World.getBlockAt(Player.getX(), Player.getY(), Player.getZ()).type.getRegistryName()

    if (config().SingleplayerLavaBounce && Player.getPlayer().func_180799_ab()) {
        sendMsg(`&7Simulating Lava Bounce`)
        Client.scheduleTask(() => Player.getPlayer().func_70016_h(motionX, 1.83, motionZ))
    } else if (config().SingleplayerSuperbounce && block.includes("rail")/*Player.getPlayer().func_70090_H()*/) {
        sendMsg(`&7Simulating Super Bounce`)
        Client.scheduleTask(() => Player.getPlayer().func_70016_h(motionX, 3.44, motionZ))
    }
})

register("tick", () => {
    if (!config().SingleplayerSpeed || !inSingleplayer()) return
    Player.getPlayer().func_110148_a(net.minecraft.entity.SharedMonsterAttributes.field_111263_d).func_111128_a(0.50000000745)
    Player.getPlayer().field_71075_bZ.func_82877_b(0.50000000745)
})