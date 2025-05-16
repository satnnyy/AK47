import { startWalk, stopWalk, calcYawPitch, getDistance2D, snapTo, setMotion } from "./Utils"
import { jumper } from "./AutoP5Utils"

export default new class Pathfinder {
    constructor() {
        this.pathFind = false
        this.pathQueue = []
        this.currentPath = []
        this.motion = register("renderWorld", () => {
            const speed = Player.getPlayer().field_71075_bZ.func_75094_b() * (Player.isSneaking() ? 0.3 : 1)
            const radians = (Player.getYaw() * Math.PI) / 180
            const [x, z] = [-Math.sin(radians) * speed * 1.527, Math.cos(radians) * speed * 1.527]
            if (Player.asPlayerMP().isOnGround()) setMotion(x, z)
        }).unregister()

        register("step", () => {
            if (!this._inQueue()) return
            let [yaw, apitch] = calcYawPitch({ x: this.currentPath[0], y: this.currentPath[1], z: this.currentPath[2] })
            let pitch = Player.getPitch()
            if (!this.currentPath[6]) pitch = apitch
            if (this.currentPath[3]) pitch = 18
            snapTo(yaw, pitch)
        })

        register("tick", () => {
            if (!this._inQueue()) return
            if (getDistance2D(Player.getX(), Player.getZ(), this.currentPath[0], this.currentPath[2]) < 1) {
                this.finishPath()
                return
            }
            startWalk()
            this.motion.register()
            if (this.currentPath[3]) jumper()
        })
    }

    _inQueue() {
        return this.pathQueue.length > 0
    }

    _handlePath() {
        this.currentPath = this.pathQueue[0]
    }

    finishPath() {
        if (this.currentPath && this.currentPath.length >= 3) {
            if (this.currentPath[4]) snapTo(this.currentPath[5][0], this.currentPath[5][1])
            if (this.currentPath[7]) snapTo(Player.getYaw(), -90)
            if (this.currentPath[8]) setMotion(0, 0)
            if (this.currentPath[9]) {
                const [x, , z] = this.currentPath
                Player.getPlayer().func_70107_b(x, Player.getY(), z) // sets position to exact debuff coords instead of just setmotion
            }
    
            this.pathQueue.shift()
            this._handlePath()
            stopWalk()
            this.motion.unregister()
        }
    }

    cancelPath() {
        this.pathQueue = []
        this.currentPath = []
        this.motion.unregister()
        stopWalk()
        setMotion(0, 0)
        this.pathFind = false
    }

    addPath(x, y, z, shouldJump = false, shouldSnap = false, yawPitch = [0, 0], ignoreY = true, setPitch = false, setMotion = false, setPosition = false, cancelPath = false) {
        if (this.currentPath && this.currentPath.length > 10 && this.currentPath[10]) this.cancelPath()
        this.pathQueue.push([x, y, z, shouldJump, shouldSnap, yawPitch, ignoreY, setPitch, setMotion, setPosition, cancelPath])
        this._handlePath()
    }
}