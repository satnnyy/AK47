import { setMotion, KeyBinding, doJump, keys } from "./utils/Utils"

export function slingshot(dir = Player.getYaw()) {
    const speed = Player.getPlayer().field_71075_bZ.func_75094_b() * 2.806
    const radians = dir * (Math.PI / 180)

    if (Player.asPlayerMP().isOnGround()) doJump()
    keys.forEach(keybind => KeyBinding.func_74510_a(keybind, false))
    setMotion(0, 0)

    Client.scheduleTask(1, () => {
        setMotion(-Math.sin(radians) * speed, Math.cos(radians) * speed)
        keys.forEach(keybind => KeyBinding.func_74510_a(keybind, Keyboard.isKeyDown(keybind)))
    })
}

export const clip = () => {
    const speed = Player.getPlayer().field_71075_bZ.func_75094_b() * 2.806
    const radians = Player.getYaw() * (Math.PI / 180)

    if (Player.asPlayerMP().isOnGround()) doJump()
    keys.forEach(keybind => KeyBinding.func_74510_a(keybind, false))
    setMotion(0, 0)

    Client.scheduleTask(() => {
        setMotion(-Math.sin(radians) * speed, Math.cos(radians) * speed)
        keys.forEach(keybind => KeyBinding.func_74510_a(keybind, Keyboard.isKeyDown(keybind)))
    })
}

new KeyBind("Slingshot", Keyboard.KEY_NONE, "AK-47").registerKeyPress(() => clip())
register("command", () => clip()).setName("slingshot")