//import { C03PacketPlayer, sendPlayerLook, sendPlayerPosLook, EntityPlayer } from "./Utils"

export const C06PacketPlayerPosLook = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C06PacketPlayerPosLook")
export const C05PacketPlayerLook = Java.type("net.minecraft.network.play.client.C03PacketPlayer$C05PacketPlayerLook")
export const C03PacketPlayer = Java.type("net.minecraft.network.play.client.C03PacketPlayer")
export const EntityPlayer = Java.type("net.minecraft.entity.player.EntityPlayer")
export const sendPlayerLook = (yaw, pitch, onGround) => Client.sendPacket(new C05PacketPlayerLook(yaw, pitch, onGround))
export const sendPlayerPosLook = (yaw, pitch, onGround) => Client.sendPacket(new C06PacketPlayerPosLook(Player.getX(), Player.getPlayer().func_174813_aQ().field_72338_b, Player.getZ(), yaw, pitch, onGround))

export default new class ServerRotations {
    constructor() {
        this.yaw = null
        this.pitch = null
        this.inProgress = false
        this.shouldRotate = false

        register("packetSent", (packet, event) => {
            if (!this.shouldRotate) return
            if (this.inProgress) return
            if (!this.yaw || !this.pitch || Player.getPlayer().field_70154_o) return
            if (this.yaw == packet.func_149462_g() && this.pitch == packet.func_149470_h()) return

            cancel(event)
            this.inProgress = true

            const onGround = packet.func_149465_i()
            const simpleName = packet.class.getSimpleName()

            if (simpleName == "C05PacketPlayerLook") {
                sendPlayerLook(this.yaw, this.pitch, onGround)
            } else {
                sendPlayerPosLook(this.yaw, this.pitch, onGround)
            }
            this.inProgress = false
        }).setFilteredClasses([C03PacketPlayer])

        register("renderEntity", (entity) => {
            if (!this.shouldRotate) return
            if (entity.getEntity() != Player.getPlayer() || !this.yaw || !this.pitch || Player.getPlayer().field_70154_o) return

            Player.getPlayer().field_70761_aq = this.yaw
            Player.getPlayer().field_70759_as = this.yaw
        }).setFilteredClass(EntityPlayer)
    }

    setRotation(yaw, pitch) {
        if (pitch < -90 || pitch > 90 || isNaN(yaw) || isNaN(pitch)) return
        
        this.yaw = yaw
        this.pitch = pitch
        this.shouldRotate = true
    }

    resetRotation() {
        this.setRotation(Player.getYaw(), Player.getPitch())
        this.shouldRotate = false
    }
}