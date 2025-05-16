import { sendMsg, S2DPacketOpenWindow, S2FPacketSetSlot, getPetItem, sendWindowClick } from "./Utils"

export default new class PetHelper {
    constructor() {
        this.petQueue = []
        this.currentPet = ""
        this.menuOpened = false
        this.inProgress = false
        this.WindowID = null
        
        register("packetReceived", (packet, event) => {
            if (!this._inQueue() || !this.menuOpened) return

            const itemStack = packet.func_149174_e()
            const slot = packet.func_149173_d()
            const windowID = packet.func_149175_c()

            if (!windowID || !itemStack || !slot) return

            if (windowID !== this.WindowID) return

            const item = new Item(itemStack)
            const itemName = item.getName()
            const petInfo = this._currentPet()
            
            if (itemName.removeFormatting() == "Sort") {
                this._reloadGUI()
                return
            }
            cancel(event)

            if (!petInfo) return

            const targetName = petInfo[0]
            if (!itemName.removeFormatting().toLowerCase().includes(targetName)) return
            const petItem = getPetItem(item)

            if (!petItem) return

            if (petInfo[1] && !petItem.toLowerCase().includes(petInfo[1].toLowerCase())) return

            sendWindowClick(windowID, slot, 0, 0)
            sendMsg(`&7Selecting &6` + itemName)

            this._reloadGUI()

        }).setFilteredClass(S2FPacketSetSlot)

        register("packetReceived", (packet, event) => {
            if (!this._inQueue()) return
            
            const title = ChatLib.removeFormatting(packet.func_179840_c().func_150254_d())
            this.WindowID = packet.func_148901_c()

            if (!title.startsWith("Pets")) return
            this.menuOpened = true
            cancel(event)
        }).setFilteredClass(S2DPacketOpenWindow)
    }

    _inQueue() {
        return this.petQueue.length > 0
    }

    _reloadGUI() {
        this.menuOpened = false
        this.petQueue.shift()
        this.inProgress = false
        this._updateStatus()
    }

    _currentPet() {
        return this.petQueue[0]
    }

    _updateStatus() {
        if (this.inProgress) return
        if (this._inQueue()) {
            this.inProgress = true
            ChatLib.command("pets")
            
        }
    }

    queuePet(name, item = null) {
        this.petQueue.push([name, item])
        this._updateStatus()
    }
}
