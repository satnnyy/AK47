import config from "../config"
import { sendMsg, S12PacketEntityVelocity, KeyBinding, keys, isPlayerInBox, isWithinTolerance } from "./utils/Utils"
import { renderBoxOutline } from "../../BloomCore/RenderUtils"

const clipCoords = {
    P2ToCore: [60.5, 162, 78.5, -49],
    CoreToP4: [47.5, 111, 75.5, -46]
}

let lastClipTime = 0
let inBoss = false

register("step", () => inBoss = isPlayerInBox(-8, 0, 148, 135, 255, -8)).setFps(10)

register("renderWorld", () => {
    if (!config().LavaClip || !inBoss || Date.now() - lastClipTime < 1000) return

    Object.values(clipCoords).forEach(([x, y, z, distance]) => {
        renderBoxOutline(x, y, z, 1, 1, 1, 1, 1, 1, 2, config().RenderLavaClipThroughWalls)
        if (isPlayerInBox(x - 0.5, y - 0.5, z - 0.5, x + 0.5, y + 0.65, z + 0.5)) {
            velocity.register()
            Player.getPlayer().func_70107_b(Player.getX(), Player.getY() + distance, Player.getZ())
            sendMsg(`&7Clipped &6${distance}`)
            lastClipTime = Date.now()
        }
    })
})

const velocity = register("packetReceived", (packet, event) => {
    if (packet.func_149410_e() === 28000 && Player.getPlayer().func_145782_y() === packet.func_149412_c()) cancel(event)
    Client.scheduleTask(15, () => velocity.unregister())
}).setFilteredClass(S12PacketEntityVelocity)

register("chat", () => {
    if (!config().StormClip) return
    Player.getPlayer().func_70107_b(Player.getX(), Player.getY() - 40, Player.getZ())
    sendMsg(`&7Clipped`)
}).setCriteria("[BOSS] Maxor: WELL! WELL! WELL! LOOK WHO'S HERE!")

register("tick", () => {
    if (!config().CoreClip) return
    const [x, y, z] = [Player.getX(), Player.getY(), Player.getZ()]
    if (y !== 115 || x < 52 || x > 57) return
    const coreClip = (clip1, clip2) => {
        Player.getPlayer().func_70107_b(x, y, clip1)
        Client.scheduleTask(() => Player.getPlayer().func_70107_b(x, y, clip2))
        keys.forEach(keybind => KeyBinding.func_74510_a(keybind, false))
        Client.scheduleTask(() => keys.forEach(keybind => KeyBinding.func_74510_a(keybind, Keyboard.isKeyDown(keybind))))
        sendMsg(`&7Phased`)
    }
    if (isWithinTolerance(z, 53.7)) coreClip(53.7624, 55.301)
    if (isWithinTolerance(z, 55.3)) coreClip(55.2376, 53.699)
})