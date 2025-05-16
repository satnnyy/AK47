import config from "../config"
import { sendMsg, center, pearlClip, autoTNT } from "./utils/Utils"
import request from "requestV2"

register("command", () => config().getConfig().openGui()).setName("ak").setAliases(["ak-47", "ak47"])
register("command", () => sendMsg(`&7X: &6${Player.getX()}&7, Y: &6${Player.getY()}&7, Z: &6${Player.getZ()}`)).setName("getposition").setAliases(["getxyz", "position"])
register("command", () => ChatLib.chat(Player.getHeldItem().getNBT().getCompoundTag("tag").getCompoundTag("ExtraAttributes").getTag("uuid"))).setName("getuuid")
register("command", () => sendMsg(`&7Yaw: &6${Player.getYaw()}&7, Pitch: &6${Player.getPitch()}`)).setName("getyawpitch").setAliases(["yawpitch"])
register("command", (x, y, z) => Player.asPlayerMP().setPosition(x, y, z)).setName("tpto")
register("command", (y) => pearlClip(y)).setName("pearlclip")
register("command", () => autoTNT()).setName("autotnt")
register("command", () => center()).setName("center")
register("command", (name) => {
    request({
        url: `https://soopy.dev/api/guildBot/runCommand?user=${name}&cmd=currdungeon`,
        json: true,
        method: "GET"
    }).then(
        response => sendMsg(`&6${response.raw}`)
    ).catch(error => sendMsg(`&7Error getting current dungeon &6${error.stringify()}`))
}).setName("currdung").setAliases(["currdungeon", "currentdungeon"])