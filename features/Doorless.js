import config from "../config"
import { C03PacketPlayer, S08PacketPlayerPosLook, sendBlockPlacement, isWithinTolerance, snapTo, MCBlock } from "./utils/Utils"

const validBlocks = [173, 159]
let inDoor = false

register("packetSent", (packet, event) => {
    const [x, y, z] = [packet.func_149464_c(), packet.func_149467_d(), packet.func_149472_e()]
    const fx = x - Math.floor(x)
    const fz = z - Math.floor(z)
    const moving = packet.func_149466_j()
    const onGround = packet.func_149465_i()

    if (!config().Doorless || inDoor || Player.getHeldItem()?.getID() !== 368 || !moving || y !== 69 || x > 0 || z > 0 || x < -200 || z < -200) return

    let yaw = -1
    let pitch = -1
    let xOffset = 0
    let zOffset = 0

    if (isWithinTolerance(fz, 0.7) && fx > 0.3 && fx < 0.7 && (validBlocks.includes(getBlockFloor(x + 1, y, z + 2).type.getID()) || validBlocks.includes(getBlockFloor(x - 1, y, z + 2).type.getID()))) {
		yaw = 0
		pitch = 77
		++zOffset
	} else if (isWithinTolerance(fx, 0.3) && fz > 0.3 && fz < 0.7 && (validBlocks.includes(getBlockFloor(x - 2, y, z + 1).type.getID()) || validBlocks.includes(getBlockFloor(x - 2, y, z - 1).type.getID()))) {
		yaw = 90
		pitch = 77
		--xOffset
	} else if (isWithinTolerance(fz, 0.3) && fx > 0.3 && fx < 0.7 && (validBlocks.includes(getBlockFloor(x - 1, y, z - 2).type.getID()) || validBlocks.includes(getBlockFloor(x + 1, y, z - 2).type.getID()))) {
		yaw = 180
		pitch = 77
		--zOffset
	} else if (isWithinTolerance(fx, 0.7) && fz > 0.3 && fz < 0.7 && (validBlocks.includes(getBlockFloor(x + 2, y, z - 1).type.getID()) || validBlocks.includes(getBlockFloor(x + 2, y, z + 1).type.getID()))) {
		yaw = 270
		pitch = 77
		++xOffset
	} else if (isWithinTolerance(fz, 0.95) && fx > 0.3 && fx < 0.7 && (validBlocks.includes(getBlockFloor(x + 1, y, z + 2).type.getID()) || validBlocks.includes(getBlockFloor(x - 1, y, z + 2).type.getID()))) {
		yaw = 0
		pitch = 84
		++zOffset
	} else if (isWithinTolerance(fx, 0.05) && fz > 0.3 && fz < 0.7 && (validBlocks.includes(getBlockFloor(x - 2, y, z + 1).type.getID()) || validBlocks.includes(getBlockFloor(x - 2, y, z - 1).type.getID()))) {
		yaw = 90
		pitch = 84
		--xOffset
	} else if (isWithinTolerance(fz, 0.05) && fx > 0.3 && fx < 0.7 && (validBlocks.includes(getBlockFloor(x - 1, y, z - 2).type.getID()) || validBlocks.includes(getBlockFloor(x + 1, y, z - 2).type.getID()))) {
		yaw = 180
		pitch = 84
		--zOffset
	} else if (isWithinTolerance(fx, 0.95) && fz > 0.3 && fz < 0.7 && (validBlocks.includes(getBlockFloor(x + 2, y, z - 1).type.getID()) || validBlocks.includes(getBlockFloor(x + 2, y, z + 1).type.getID()))) {
		yaw = 270
		pitch = 84
		++xOffset
	}

    if (yaw < 0 || pitch < 0) return
    const tileEntity = World.getWorld().func_175625_s(getBlockPosFloor(x + xOffset, y + 1, z + zOffset).toMCBlock())
    if (!tileEntity || !tileEntity.func_152108_a()) return
    const skullId = tileEntity.func_152108_a().getProperties().get("textures")[0].getValue()
	if (!["eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvM2JjYmJmOTRkNjAzNzQzYTFlNzE0NzAyNmUxYzEyNDBiZDk4ZmU4N2NjNGVmMDRkY2FiNTFhMzFjMzA5MTRmZCJ9fX0=", "eyJ0ZXh0dXJlcyI6eyJTS0lOIjp7InVybCI6Imh0dHA6Ly90ZXh0dXJlcy5taW5lY3JhZnQubmV0L3RleHR1cmUvOWQ5ZDgwYjc5NDQyY2YxYTNhZmVhYTIzN2JkNmFkYWFhY2FiMGMyODgzMGZiMzZiNTcwNGNmNGQ5ZjU5MzdjNCJ9fX0="].includes(skullId)) return
	inDoor = true
    Client.sendPacket(new C03PacketPlayer.C06PacketPlayerPosLook(x, y, z, yaw, pitch, onGround))
    sendBlockPlacement()
    const clip = register("packetReceived", (packet) => {
		const [initialYaw, initialPitch] = [Player.getYaw(), Player.getPitch()]
		const [x, y, z] = [packet.func_148932_c(), packet.func_148928_d(), packet.func_148933_e()]
		inDoor = false
		clip.unregister()
		if (y !== 70) return
		Client.scheduleTask(() => {
			snapTo(initialYaw, initialPitch)
			if (config().DoorlessClip && getBlockFloor(x, y - 1, z).type.getID() !== 139) Player.getPlayer().func_70107_b(x + xOffset * 3.4, y, z + zOffset * 3.4)
		})
        // air
		setBlockAt(x + xOffset, y, z + zOffset, 0)
		setBlockAt(x + xOffset, y + 1, z + zOffset, 0)
		setBlockAt(x + xOffset * 2, y, z + zOffset * 2, 0)
		setBlockAt(x + xOffset * 2, y + 1, z + zOffset * 2, 0)
		setBlockAt(x + xOffset * 3, y, z + zOffset * 3, 0)
		setBlockAt(x + xOffset * 3, y + 1, z + zOffset * 3, 0)
		
		setBlockAt(x + xOffset * 4, y, z + zOffset * 4, 0)
        setBlockAt(x + xOffset * 4, y + 1, z + zOffset * 4, 0)

        // stained glass
        setBlockAt(x + xOffset * 2 - (zOffset ? 1 : 0), y, z + zOffset * 2 - (xOffset ? 1 : 0), 95)
		setBlockAt(x + xOffset * 2 - (zOffset ? 1 : 0), y + 1, z + zOffset * 2 - (xOffset ? 1 : 0), 95)
		setBlockAt(x + xOffset * 2 - (zOffset ? 1 : 0), y - 1, z + zOffset * 2 - (xOffset ? 1 : 0), 95)
        setBlockAt(x + xOffset * 2 - (zOffset ? 1 : 0), y, z + zOffset * 2 - (xOffset ? 1 : 0), 95)
		setBlockAt(x + xOffset * 2 - (zOffset ? 1 : 0), y + 1, z + zOffset * 2 - (xOffset ? 1 : 0), 95)
		setBlockAt(x + xOffset * 2 - (zOffset ? 1 : 0), y - 1, z + zOffset * 2 - (xOffset ? 1 : 0), 95)
		if (getBlockFloor(x, y - 1, z).type.getID() === 139) {
		    setBlockAt(x + xOffset * 4, y, z + zOffset * 4, 0)
		    setBlockAt(x + xOffset * 4, y + 1, z + zOffset * 4, 0)
			setBlockAt(x + xOffset, y - 1, z + zOffset, 0)
			setBlockAt(x + xOffset * 2, y - 1, z + zOffset * 2, 0)
			setBlockAt(x + xOffset * 3, y - 1, z + zOffset * 3, 0)
			setBlockAt(x + xOffset * 4, y - 1, z + zOffset * 4, 0)
        }
	}).setFilteredClass(S08PacketPlayerPosLook)
    cancel(event)
}).setFilteredClass(C03PacketPlayer)

function setBlockAt(x, y, z, id) {
	const world = World.getWorld();
	const blockPos = getBlockPosFloor(x, y, z).toMCBlock();
	world.func_175656_a(blockPos, MCBlock.func_176220_d(id));
	world.func_175689_h(blockPos);
}

function getBlockPosFloor(x, y, z) {
	return new BlockPos(Math.floor(x), Math.floor(y), Math.floor(z))
}

function getBlockFloor(x, y, z) {
	return World.getBlockAt(Math.floor(x), Math.floor(y), Math.floor(z))
}