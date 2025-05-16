import { KeyBinding } from "./features/utils/Utils"
import { scheduleTask } from "./features/utils/S32ScheduleTask"

let doing = false
let toggled = false

new KeyBind("5k Prestige", Keyboard.KEY_NONE, "Prestige").registerKeyPress(() => toggle())
const getScoreboard = () => World.getWorld() ? Scoreboard.getLines().map(line => ChatLib.removeFormatting(line.getName())) : null
function toggle() {
    toggled = !toggled
    if (toggled) {
        enable.register()
        KeyBinding.func_74510_a(-100, true)
        ChatLib.chat("enabled")
    } else {
        enable.unregister()
        KeyBinding.func_74510_a(-100, false)
        ChatLib.chat("disabled")
    }
}

const enable = register("step", () => {
    const scoreboard = getScoreboard()
    if (!scoreboard) return

    const isLevel140 = scoreboard.some(line => line.includes("Level:") && parseInt((line.match(/\d+/g) || []).join("").slice(0, -2)) === 140)

    ChatLib.chat(isLevel140)

    if (!isLevel140 || doing) return

    doing = true
    KeyBinding.func_74510_a(-100, false)
    Player.asPlayerMP().setPosition(43.5, 174, 55.5)
    scheduleTask(() => Player.asPlayerMP().setPosition(40.5, 172, 62.2), 3)
    scheduleTask(() => ChatLib.command("best"), 9)
    scheduleTask(() => {
        KeyBinding.func_74510_a(-100, true)
        doing = false
    }, 12)
}).unregister()