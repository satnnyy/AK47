import config from "../config"
import { sendMsg, S1BPacketEntityAttach, setSneakKey, isPlayerInBox } from "./utils/Utils"
import { scheduleTask } from "./utils/S32ScheduleTask"

const sneak = register("packetReceived", () => {
	if (!config().InstamidSneak || Player.getPlayer().func_70115_ae()) return
	scheduleTask(() => {
		setSneakKey(false)
		sneak.unregister()
	}, 10)
}).setFilteredClass(S1BPacketEntityAttach).unregister()

register("chat", () => {
	if (!config().InstamidSneak || !isPlayerInBox(46, 64, 68, 63, 100, 85)) return
	sendMsg(`&7Sneaking`)
    setSneakKey(true)
	sneak.register()
}).setCriteria("[BOSS] Necron: You went further than any human before, congratulations.")

register("worldUnload", () => sneak.unregister())