import Dungeon from "../../../../BloomCore/dungeons/Dungeon"
import { clampAndMap } from "../../../../BloomCore/utils/Utils"
import { Checkmark, defaultMapSize, DoorTypes, findAllConnected, roomsJson, RoomTypes } from "./MapUtils"
import Room from "./Room"
import Door from "./Door"
import DungeonMap from "./DungeonMap"

/**
 * Class which stores and processed most of the data for the whole module.
 * 
 * The Rooms and Doors are all stored in the dungeonMap field (A DungeonMap class).
 */
export default new class DmapDungeon {
    constructor() {

        this.reset()

        this.playerRoomEnterListeners = []
        this.playerRoomExitListeners = []
        this.dungeonFullyScannedListeners = []
        
        register("step", () => {
            if (!Dungeon.inDungeon || this.dungeonMap.fullyScanned) return
            this.dungeonMap.scan()

            if (this.dungeonMap.fullyScanned) {
                this.dungeonFullyScannedListeners.forEach(func => func(this))
            }

        }).setFps(4)

        register("step", () => {
            this.dungeonMap.checkRoomRotations()
            if ([...this.dungeonMap.rooms].some(a => a.rotation == null)) return
        }).setFps(1)

        // Singleplayer debug stuff
        let lastRoom = null
        register("tick", () => {
            if (!Client.getMinecraft().func_71356_B() || !Dungeon.inDungeon) return
            let room = this.getCurrentRoom()
            if (room == lastRoom) return
            if (lastRoom) this.playerRoomExitListeners.forEach(f => f(null, lastRoom))
            lastRoom = room
            if (!room) return
            this.playerRoomEnterListeners.forEach(f => f(null, room))
        })

        Dungeon.onMapData((mapData) => {
            // Check for checkmarks, new rooms etc
            if (!mapData || !Dungeon.mapCorner) return

            this.scanHotbarMap(mapData)

            // Update the player icons
            for (let i of Object.keys(Dungeon.icons)) {
                let icon = Dungeon.icons[i]
                let player = this.players.find(a => a?.player == icon?.player)
                if (!player || player.inRender) continue
                // SO I DONT FORGET NEXT TIME:
                // ICON.X / 2 BECAUSE THEY ARE NORMALLY 256 MAX INSTEAD OF 128 (MAP SIZE)
                // OFFSET BY MAP CORNER
                // MAKE VALUE ALWAYS MAP AS IF THE DUNGEON WAS 6 ROOMS WIDE, EVEN IF MAX NUMBER IS LARGER THAN 128
                player.iconX = clampAndMap(icon.x/2 - Dungeon.mapCorner[0], 0, Dungeon.mapRoomSize * 6 + 20, 0, defaultMapSize[0])
                player.iconY = clampAndMap(icon.y/2 - Dungeon.mapCorner[1], 0, Dungeon.mapRoomSize * 6 + 20, 0, defaultMapSize[1])
                player.realX = clampAndMap(player.iconX, 0, 125, -200, -10)
                player.realZ = clampAndMap(player.iconY, 0, 125, -200, -10)
                player.rotation = icon.rotation
            }
        })

        register("tick", () => {
            if (!Dungeon.inDungeon) return
            this.dungeonMap.checkDoorsOpened()
        })

        register("step", () => {
            if ((!Dungeon.inDungeon)) return

            let secretsForMax = Math.ceil(this.dungeonMap.secrets * Dungeon.secretsPercentNeeded)
            let ms = Math.ceil(secretsForMax*((40 - (Dungeon.isPaul ? 10 : 0) - (Dungeon.mimicKilled ? 2 : 0) - (Dungeon.crypts > 5 ? 5 : Dungeon.crypts) + (Dungeon.deathPenalty))/40))

            let totalSecrets = Dungeon.totalSecrets || this.dungeonMap.secrets

            this.mapLine1 = ``
            this.mapLine2 = ``
        }).setFps(4)

        // Update player visited rooms
        register("tick", () => {
            if (!Dungeon.inDungeon || !this.players.length || !Dungeon.time || Dungeon.bossEntry) return
            for (let p of this.players) {
                let currentRoom = this.getPlayerRoom(p)
                if (!currentRoom) continue

                // Room enter/exit event
                if (currentRoom !== p.lastRoom) {
                    if (p.lastRoom) this.playerRoomExitListeners.forEach(func => func(p, p.lastRoom))
                    this.playerRoomEnterListeners.forEach(func => func(p, currentRoom))
                }
                if (!p.visitedRooms.has(currentRoom)) p.visitedRooms.set(currentRoom, 0)
                if (p.lastRoomCheck) p.visitedRooms.set(currentRoom, p.visitedRooms.get(currentRoom) + Date.now() - p.lastRoomCheck)
                p.lastRoomCheck = Date.now()
                p.lastRoom = currentRoom
            }
        })

        const printPlayerStats = () => this.players.forEach(p => p.printClearStats())

        register("chat", (player) => {
            if (player == "You") player = Player.getName()
            let player = this.players.find(a => a.player == player)
            if (!player) return
            player.deaths++
        }).setCriteria(/^ ☠ (\w+) .+$/)

        register("worldUnload", () => this.reset())

        register("command", () => {
            this.dungeonMap.rooms.forEach(r => {
                ChatLib.chat(r.toString())
            })
        }).setName("/rooms")

        register("command", () => {
            this.dungeonMap.doors.forEach(r => {
                ChatLib.chat(r.toString())
            })
        }).setName("/doors")

        register("chat", (keyType) => {
            if (keyType == "Wither") this.witherKeys++
            if (keyType == "Blood") this.bloodKey = true
        }).setCriteria(/^(?:\[[^\]]+\] )*\w+ has obtained (\w+) Key!$/)
        
        register("chat", () => this.witherKeys--).setCriteria(/^(?:\[[^\]]+\] )*\w+ opened a WITHER door!/)
        register("chat", () => this.bloodKey = false).setCriteria(/^The BLOOD DOOR has been opened!$/)

        

    }
    reset() {
        this.dungeon = Dungeon
        this.dungeonMap = new DungeonMap()

        this.players = []

        this.witherKeys = 0
        this.bloodKey = false
    }

    /**
     * @callback DungeonFullyScanned
     * @param {DmapDungeon} dungeon
    */

    /**
     * 
     * @param {DungeonFullyScanned} func 
     */
    onDungeonAllScanned(func) {
        this.dungeonFullyScannedListeners.push(func)
    }

    /**
     * Scans each room's spot on the hotbar map to check for a checkmark or if it's explored.
     * @returns 
     */
    scanHotbarMap(mapData) {
        const colors = mapData.field_76198_e
        if (!colors || colors.length < 16384 || !Dungeon.mapCorner) return

        // Update rooms
        for (let room of this.dungeonMap.rooms) {
            if (!room.components.length) continue
            let [x, y] = room.components[0]

            let mapX = Dungeon.mapCorner[0] + Math.floor(Dungeon.mapRoomSize/2) + Dungeon.mapGapSize * x
            let mapY = Dungeon.mapCorner[1] + Math.floor(Dungeon.mapRoomSize/2)+1 + Dungeon.mapGapSize * y
            let index = mapX + mapY * 128

            let center = colors[index-1]
            let roomColor = colors[index+5 + 128*4]

            if ([0, 85].includes(roomColor)) {
                room.explored = false
                continue
            }
            room.explored = true

            if (room.type == RoomTypes.UNKNOWN && !room.roofHeight) room.loadFromRoomMapColor(roomColor)
            
            if (center == 30 && roomColor !== 30) {
                if (!room.checkmark) this.handleRoomCleared(room)
                room.checkmark = Checkmark.GREEN
            }
            else if (center == 34) {
                if (!room.checkmark) this.handleRoomCleared(room)
                room.checkmark = Checkmark.WHITE
            }
            else if (center == 18 && roomColor !== 18) room.checkmark = Checkmark.FAILED
        }

        // Update doors
        for (let door of this.dungeonMap.doors) {
            let mapX = Dungeon.mapCorner[0] + Math.floor(Dungeon.mapRoomSize/2) + Math.floor(Dungeon.mapGapSize/2) * door.gx
            let mapY = Dungeon.mapCorner[1] + Math.floor(Dungeon.mapRoomSize/2) + Math.floor(Dungeon.mapGapSize/2) * door.gz
            let index = mapX + mapY * 128
            
            let color = colors[index]
            if ([0, 85].includes(color)) {
                door.explored = false
                continue
            }
            door.explored = true
        }

        // Load rooms which haven't been scanned but are loaded on the hotbar map
        for (let entry of this.dungeonMap.scanCoords) {
            let [v, k] = entry
            let [gx, gz] = k
            let [x, z] = v

            let mapX = Dungeon.mapCorner[0] + Math.floor(Dungeon.mapRoomSize/2) + Math.floor(Dungeon.mapGapSize/2) * gx
            let mapY = Dungeon.mapCorner[1] + Math.floor(Dungeon.mapRoomSize/2) + Math.floor(Dungeon.mapGapSize/2) * gz
            let index = mapX + mapY * 128

            let color = colors[index]
            if (!color) continue
            let roomColor = colors[index+5 + 128*4]

            // Rooms
            if (!(gx%2) && !(gz%2)) {
                let existingRoom = this.getRoomWithComponent([gx/2, gz/2])
                if (existingRoom) continue

                if (color == 119) {
                    // ChatLib.chat(`Room at ${gx/2}, ${gz/2}`)
                    let room = new Room([[gx/2, gz/2]])
                    room.checkmark = Checkmark.UNEXPLORED
                    this.dungeonMap.rooms.add(room)
                    // ChatLib.chat(`Added unknown room ${gx/2}, ${gz/2}`)
                    continue
                }
                
                let components = findAllConnected(colors, [mapX, mapY])
                // ChatLib.chat(`Components: ${JSON.stringify(components)}`)
                // continue
                for (let component of components) {
                    // Started scanning different component of already partially scanned room
                    let existing = this.getRoomWithComponent(component)
                    if (!existing) continue
                    existing.addComponents(components)
                    // Don't scan here again
                    if (existing.name) this.dungeonMap.scanCoords.delete(k)
                    
                    continue
                }
                let newRoom = new Room(components)
                newRoom.loadFromRoomMapColor(roomColor)
                this.dungeonMap.rooms.add(newRoom)
                // ChatLib.chat(`New colored room ${color} - ${gx/2}, ${gz/2}`)
                continue
            }

            // Doors
            if (!color) continue
            let existingDoor = this.getDoorWithComponent([gx, gz])
            if (existingDoor) continue

            if (gx%2 && (colors[index-128*5] || colors[index*128*3])) continue
            if (gz%2 && (colors[index-128-4] || colors[index-128+4])) continue

            let door = new Door(x, z, gx, gz)
            if (color == 85 || color == 63) door.type = DoorTypes.NORMAL
            else if (color == 119) door.type = DoorTypes.WITHER
            else if (color == 18) door.type = DoorTypes.BLOOD

            this.dungeonMap.doors.add(door)
        }

        // this.updateMapImage()
    }

    /**
     * Called when a room gets cleared (No checkmark -> checkmark)
     * Updates the player's cleared rooms if they are in there.
     * @param {Room} room 
     */
    handleRoomCleared(room) {
        let players = this.getPlayersInRoom(room)

        for (let player of players) {
            if (players.length == 1) player.clearedRooms.solo++
            else player.clearedRooms.stacked++
        }
    }

    /**
     * 
     * @param {[Number, Number]} component - 0-10 component 
     * @returns {Door}
     */
    getDoorWithComponent(component) {
        return this.dungeonMap.getDoorWithComponent(component)
    }
    
    /**
     * 
     * @param {[Number, Number]} component - An array of two numbers from 0-5 
     * @returns {Room}
     */
    getRoomWithComponent(component) {
        return this.dungeonMap.getRoomWithComponent(component)
    }

    /**
     * 
     * @param {Number} x - Real world coordinate
     * @param {Number} z - Real world coordinate
     * @returns {Room}
     */
    getRoomAt(x, z, mustBeFullyLoaded=false) {
        return this.dungeonMap.getRoomAt(x, z)
    }

    /**
     * 
     * @param {String} roomName 
     * @returns {Room}
     */
    getRoomFromName(roomName) {
        return this.dungeonMap.getRoomFromName(roomName)
    }

    getDoorBetweenRooms(childRoom, parentRoom) {
        return this.dungeonMap.getDoorBetweenRooms(childRoom, parentRoom)
    }

    /**
     * Gets the room at your current location. Returns null if you are not in a room.
     * @param {Boolean} mustHaveCorner - The corner and rotation of the room must be loaded, otherwise return null.
     * @returns {Room | null}
     */
    getCurrentRoom(mustHaveCorner=false) {
        const room = this.getRoomAt(Player.getX(), Player.getZ())
        if (!room || (mustHaveCorner && !room.corner)) return null
        return room
    }

    /**
     * 
     * @param {String | Room} room 
     */
    getPlayersInRoom(room) {
        if (!(room instanceof Room)) room = this.getRoomFromName(room)
        if (!room) return []

        return this.players.filter(a => this.getPlayerRoom(a) == room)
    }

    /**
     * Highlights rooms on the map
     * @param {Room[]} rooms 
     */
    highlightRooms(rooms) {
        this.dungeonMap.rooms.forEach(r => r.highlighted = false)
        rooms.forEach(room => room.highlighted = true)
        this.updateMapImage()
    }

    /**
     * Returns the rooms (and doors if includeDoors=true) in order to go from the start room to the end room.
     * The returned array will include both the start and end rooms.
     * @param {Room} startRoom - The room to start at. 
     * @param {Room} endRoom - The room to end at.
     * @param {Boolean} includeDoors 
     */
    getRoomsTo(startRoom, endRoom, includeDoors=false) {
        if (!startRoom) startRoom = this.getCurrentRoom()
        return this.dungeonMap.getRoomsTo(startRoom, endRoom, includeDoors)
    }
    
}