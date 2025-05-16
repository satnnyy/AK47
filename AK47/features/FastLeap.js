import config from "../config"
import { isPlayerInBox, Wither, MouseEvent, getHeldItemID, sendBlockPlacement } from "./utils/Utils"
import FastLeapHandler from "./utils/FastLeapUtils"

let lastOpener

register("chat", (player) => lastOpener = player).setCriteria(/^(\w+) opened a WITHER door!$/)

export function getLeap() {
    let leapString = ""

    if (config().FastLeapDoorOpener) leapString = lastOpener

    if (config().FastLeap && config().FastLeapTarget) leapString = FastLeapHandler.getUserName(config().FastLeapTarget)

    if (config().TerminalFastLeap) {
        if (isPlayerInBox(113, 160, 48, 89, 100, 122)) leapString = FastLeapHandler.getUserName(config().S1Target)
        if (isPlayerInBox(91, 160, 145, 19, 100, 121)) leapString = FastLeapHandler.getUserName(config().S2Target)
        if (isPlayerInBox(-6, 160, 123, 19, 100, 50)) leapString = FastLeapHandler.getUserName(config().S3Target)
        if (isPlayerInBox(17, 160, 27, 90, 100, 50)) leapString = FastLeapHandler.getUserName(config().S4Target)
    }

    return leapString
}

register(MouseEvent, (event) => {
    if (!config().FastLeap) return

    const button = event.button
    const state = event.buttonstate

    if (!state) return
    if (button !== 0) return

    if (getHeldItemID() !== "INFINITE_SPIRIT_LEAP") return
    cancel(event)

    sendBlockPlacement()

    let leapTo = getLeap()
    if (!leapTo || !leapTo.length) return
    FastLeapHandler.queueLeap(leapTo)
})

//autoleap
register("chat", () => {
    let padLeap = ""
    if (config().GreenPadAutoLeap && isPlayerInBox(41, 170, 21, 24, 172, 4)) {
        World.getAllEntitiesOfType(Wither.class).forEach(entity => {
            if (entity.getX() < 42 || entity.getX() > 51 || entity.getY() < 168 || entity.getY() > 195 || entity.getZ() < 37 || entity.getZ() > 46) return
            padLeap = FastLeapHandler.getUserName(config().GreenPadTarget)
            FastLeapHandler.autoLeap(padLeap)
        })
    }
    if (config().YellowPadAutoLeap && isPlayerInBox(41, 170, 86, 24, 172, 103)) {
        World.getAllEntitiesOfType(Wither.class).forEach(entity => {
            if (entity.getX() < 42 || entity.getX() > 51 || entity.getY() < 168 || entity.getY() > 195 || entity.getZ() < 61 || entity.getZ() > 70) return
            padLeap = FastLeapHandler.getUserName(config().YellowPadTarget)
            FastLeapHandler.autoLeap(padLeap)
        })
    }
}).setCriteria(/\[BOSS\] Storm: (Oof|Ouch, that hurt!)/)

register("chat", () => {
    let enrageLeap = ""
    if (config().PurplePadAutoLeap && isPlayerInBox(123, 164, 103, 95, 172, 86)) {
        World.getAllEntitiesOfType(Wither.class).forEach(entity => {
            if (entity.getX() < 96 || entity.getX() > 105 || entity.getY() < 168 || entity.getY() > 195 || entity.getZ() < 61 || entity.getZ() > 70) return
            enrageLeap = FastLeapHandler.getUserName(config().PurplePadTarget)
            FastLeapHandler.autoLeap(enrageLeap)
        })
    }
}).setCriteria("⚠ Storm is enraged! ⚠")

let s1 = false
register("worldUnload", () => s1 = false)
register("chat", (event) => {
    const message = ChatLib.removeFormatting(ChatLib.getChatMessage(event))
    
    if (message.startsWith("[BOSS] Goldor: Who dares trespass into my domain?")) s1 = true
    if (message.startsWith("[BOSS] Goldor: The little ants have a brain it seems.")) s1 = false
})
register("chat", (name) => {
    let pre4Leap = ""
    if (config().Pre4AutoLeap && isPlayerInBox(65, 127, 37, 62, 129, 34) && s1 && name == Player.getName()) {
        pre4Leap = FastLeapHandler.getUserName(config().Pre4Target)
        FastLeapHandler.autoLeap(pre4Leap)
    }
}).setCriteria(/(\w+) completed a device! \(\d\/\d\)/)