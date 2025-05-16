import { sendMsg, S2DPacketOpenWindow, S2FPacketSetSlot, sendWindowClick, rightClick, swapItem } from "./Utils"
import Dungeon from "../../../BloomCore/dungeons/Dungeon"

export default new class FastLeapHandler {
    constructor() {
        this.leapQueue = []
        this.menuOpened = false
        this.shouldLeap = false
        this.inProgress = false
        this.clickedLeap = false
        this.classNames = ["archer", "berserk", "healer", "mage", "tank"]

        register("packetReceived", (packet, event) => {
            if (!this._inQueue() || !this.menuOpened ) return

            const itemStack = packet.func_149174_e()
            const slot = packet.func_149173_d()
            const windowID = packet.func_149175_c()

            if (!windowID || !itemStack || !slot) return
            if (slot > 35) {
                this._reloadGUI()
                sendMsg(`&7Couldn't find &c` + this._currentLeap())
                return
            } 
            
            cancel(event)
            
            const item = new Item(itemStack)
            const itemName = item.getName().removeFormatting().toLowerCase()
            if (itemName !== this._currentLeap().toLowerCase()) return
            sendWindowClick(windowID, slot, 0, 0)
            sendMsg(`&7Leaping to &6` + this._currentLeap())
            this._reloadGUI()
        }).setFilteredClass(S2FPacketSetSlot)

        register("packetReceived", (packet, event) => {
            if (!this._inQueue()) return

            const title = ChatLib.removeFormatting(packet.func_179840_c().func_150254_d())
            this.WindowID = packet.func_148901_c()
    
            if (title !== "Spirit Leap") return
            this.menuOpened = true
            this.clickedLeap = false
            cancel(event)
        }).setFilteredClass(S2DPacketOpenWindow)

        register("chat", () => {
            this.clickedLeap = false
            this.inProgress = false
            this.leapQueue.pop()
        }).setChatCriteria(/^This ability is on cooldown for (\d+)s\.$/)
    }
    
    _inQueue() {
        return this.leapQueue.length > 0
    }

    _currentLeap() {
        return this.leapQueue[0]
    }

    _reloadGUI () {
        this.menuOpened = false
        this.leapQueue.shift()
        this.inProgress = false
    }

    getClassUser(className) {
        const party = Dungeon.playerClasses
        for (let playerName in party) {
            let playerClass = party[playerName].class
            if (className.toLowerCase() === playerClass.toLowerCase()) {
                return playerName
            }
        }
        sendMsg(`&cNo player found with class &6${className}&c!`)
        return false
    }
    
    getUserName(name = "empty") {
        if (this.classNames.includes(name.toLowerCase())) {
            return this.getClassUser(name)
        }
        return name
    }

    queueLeap(name) {
        this.leapQueue.push(name)
    }

    autoLeap(name) {
        if (this.clickedLeap) return
        if (this.inProgress) return

        this.inProgress = true

        swapItem("infinileap")
        Client.scheduleTask(0, () => {
            rightClick()
            this.clickedLeap = true
        })

        this.leapQueue.push(name)
    }
}