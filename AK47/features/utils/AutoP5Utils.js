import config from "../../config"
import { KeyBinding, getDistance } from "./Utils"

export const dragonData = new Set ([
    ["Purple", 56, 126],
    ["Red", 26, 59],
    ["Orange", 86, 56],
    ["Green", 26, 94],
    ["Blue", 85, 94]
])

export const dragonColors = {
    Blue: "&b",
    Orange: "&6",
    Red: "&c",
    Purple: "&d",
    Green: "&a",
    Middle: "&f"
}

export const dragDeathMessages = [
    "[BOSS] Wither King: Oh, this one hurts!",
    "[BOSS] Wither King: My soul is disposable.",
    "[BOSS] Wither King: I have more of those.",
    // dragon killed outside of statue
    "[BOSS] Wither King: Futile.",
    "[BOSS] Wither King: You just made a terrible mistake!",
    "[BOSS] Wither King: I am not impressed.",
    "[BOSS] Wither King: Your skills have faded humans."
]

export const dragonDelays = {
    Purple: config().PurpleDelay,
    Red: config().RedDelay,
    Orange: config().OrangeDelay,
    Green: config().GreenDelay,
    Blue: config().BlueDelay
}

export const closestColor = () => {
    let closestColor = null
    let minDistance = Infinity
    dragonData.forEach(drag => {
        const [dragon, x1, y1] = drag
        const distance = getDistance(x1, y1)
        if (distance < minDistance) {
            minDistance = distance
            closestColor = dragon
        }
    }) 
    return closestColor
}

let jumping = false
export function jumper() {
    const block = Player.lookingAt()
    if (block instanceof Block) {
        if (!jumping) {
            jumping = true
            KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74314_A.func_151463_i(), true)
        }
    } else if (jumping) {
        jumping = false
        KeyBinding.func_74510_a(Client.getMinecraft().field_71474_y.field_74314_A.func_151463_i(), false)
    }
}