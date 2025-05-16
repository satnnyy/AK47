import Settings from "../Amaterasu/core/Settings"
import DefaultConfig from "../Amaterasu/core/DefaultConfig"

const AK47Config = new DefaultConfig("AK47", "data/settings.json")

AK47Config

/* Blink | Toggle */
.addSwitch({
    category: "Blink",
    subcategory: "Toggle",
    configName: "Blink",
    title: "Toggle Blink",
    description: "",
})

.addSwitch({
    category: "Blink",
    subcategory: "Toggle",
    configName: "RenderBlinkStartEnd",
    title: "➤ Render Blink Start/End",
    description: "",
    shouldShow: data => data.Blink
})

.addSwitch({
    category: "Blink",
    subcategory: "Toggle",
    configName: "RenderBlinkLine",
    title: "➤ Render Blink Line",
    description: "",
    shouldShow: data => data.Blink
})

/* Autoroutes | Toggle */
.addSwitch({
    category: "Autoroute",
    subcategory: "Toggle",
    configName: "Autoroute",
    title: "Toggle Autoroutes",
    description: "",
})

.addKeybind({
    category: "Autoroute",
    subcategory: "Toggle",
    configName: "AutorouteDisabler",
    title: "➤ Autoroute Disabler Keybind",
    description: "Autoroutes will not work if this key is held",
    shouldShow: data => data.Autoroute
})

.addDropDown({
    category: "Autoroute",
    subcategory: "Toggle",
    configName: "RenderMode",
    title: "➤ Render Mode",
    description: "",
    options: ["Ring", "Flat Outline", "Flat Filled"],
    value: 0,
    shouldShow: data => data.Autoroute
})

.addMultiCheckbox({
    category: "Autoroute",
    subcategory: "Toggle",
    configName: "AutorouteToggle",
    title: "➤ Other",
    description: "",
    options: [
        {
            title: "Debug",
            configName: "AutorouteDebug",
            value: false
        },
        {
            title: "Render Through Walls",
            configName: "RenderAutorouteThroughWalls",
            value: false
        },
        {
            title: "Disable Rendering",
            configName: "AutorouteDisableRendering",
            value: false
        },
    ],
    shouldShow: data => data.Autoroute,
})

.addButton({
    category: "Autoroute",
    subcategory: "Toggle",
    configName: "AutorouteCommands",
    title: "➤ Autoroute Commands",
    description: "",
    shouldShow: data => data.Autoroute,
    onClick() {
        const AutorouteCommands = [
            `&8&m${ChatLib.getChatBreak(" ")}`,
            `&0&l[&6&lAutoroute&0&l] &7&l- &6&lHelp`,
            ``,
            `&6/autoroute add ether <stopmotion> <center> &8- &7Etherwarps! wow!`,
            `&6/autoroute add awaitsecret <stopmotion> <center> &8- &7ONLY WORKS FOR ETHERAWRP!!!!!!`,
            `&6/autoroute add batspawn <stopmotion> <center> &8- &7Swaps to hyperion and right clicks when bat spawns`,
            `&6/autoroute add startwalk <stopmotion> <center> &8- &7Walks! wow!`,
            `&6/autoroute add pearlclip <distance> &8- &7Pearlclips! wow!`,
            `&6/autoroute add use <item> <leftclick> &8- &7Uses specified item (if leftclick isnt true it will rightclick)`,
            `&6/autoroute add rotate <stopmotion> <center> &8- &7Rotates! wow!`,
            ``,
            `&6/autoroute em &8- &7Toggles edit mode, disables autoroutes while configging`,
            `&6/autoroute remove &8- &7Removes the closest autoroute within 2 blocks`,
            `&6/autoroute chain &8- &7Enables chain on the closest autoroute within 2 blocks, allowing you to walk over it`,
            ``,
            `&7Only use stopmotion/center on autoroutes you would typically walk into`,
            `&7<stopmotion>, <center>, <leftclick> e.g: &6/ar add ether false true&7, &6/ar add use infinityboom true`,
            `&7You can also use the command alias &6/ar &7for placing autoroutes`,
            `&8&m${ChatLib.getChatBreak(" ")}`
        ]
        ChatLib.chat(AutorouteCommands.join("\n"))
    }
})

/* Autoroute | Colors */
.addColorPicker({
    category: "Autoroute",
    subcategory: "Colors",
    configName: "AutorouteEtherColor",
    title: "Ether",
    description: "",
    value: [85, 255, 255, 255]
})

.addColorPicker({
    category: "Autoroute",
    subcategory: "Colors",
    configName: "AutorouteAwaitSecretColor",
    title: "Await Secret",
    description: "",
    value: [255, 85, 85, 255]
})

.addColorPicker({
    category: "Autoroute",
    subcategory: "Colors",
    configName: "AutorouteBatSpawnColor",
    title: "Bat Spawn",
    description: "",
    value: [170, 170, 170, 255]
})

.addColorPicker({
    category: "Autoroute",
    subcategory: "Colors",
    configName: "AutorouteStartWalkColor",
    title: "Start Walk",
    description: "",
    value: [85, 255, 85, 255]
})

.addColorPicker({
    category: "Autoroute",
    subcategory: "Colors",
    configName: "AutoroutePearlClipColor",
    title: "Pearl Clip",
    description: "",
    value: [255, 85, 255, 255]
})

.addColorPicker({
    category: "Autoroute",
    subcategory: "Colors",
    configName: "AutorouteUseColor",
    title: "Use",
    description: "",
    value: [255, 255, 255, 255]
})

.addColorPicker({
    category: "Autoroute",
    subcategory: "Colors",
    configName: "AutorouteWallClipColor",
    title: "Wall Clip",
    description: "",
    value: [170, 0, 0, 255]
})

.addColorPicker({
    category: "Autoroute",
    subcategory: "Colors",
    configName: "AutorouteRotateColor",
    title: "Rotate",
    description: "",
    value: [255, 255, 85, 255]
})

/* Auto P3 | Toggle */
.addSwitch({
    category: "Auto P3",
    subcategory: "Toggle",
    configName: "AutoP3",
    title: "Toggle Auto P3",
    description: "",
})

.addMultiCheckbox({
    category: "Auto P3",
    subcategory: "Toggle",
    configName: "AutoP3Toggle",
    title: "➤ Other",
    description: "",
    options: [
        {
            title: "Debug",
            configName: "AutoP3Debug",
            value: false
        },
        {
            title: "Disregard Boss Check",
            configName: "DisregardBossCheck",
            value: false
        },
        {
            title: "Render Through Walls",
            configName: "RenderRingsThroughWalls",
            value: false
        },
        {
            title: "Disable Rendering",
            configName: "DisableRingRendering",
            value: false
        },
        {
            title: "Toggle Boss Entry Switch Route",
            configName: "ToggleBossEntryRoute",
            value: false
        },
        {
            title: "Toggle P3 Start Switch Route",
            configName: "ToggleP3StartRoute",
            value: false
        },
    ],
    shouldShow: data => data.AutoP3,
})

.addTextInput({
    category: "Auto P3",
    subcategory: "Toggle",
    configName: "BossEntryRoute",
    title: "➤ Boss Entry Route",
    description: "",
    shouldShow: data => data.ToggleBossEntryRoute,
})

.addTextInput({
    category: "Auto P3",
    subcategory: "Toggle",
    configName: "P3StartRoute",
    title: "➤ P3 Start Route",
    description: "",
    shouldShow: data => data.ToggleP3StartRoute,
})

.addButton({
    category: "Auto P3",
    subcategory: "Toggle",
    configName: "AutoP3Commands",
    title: "➤ Auto P3 Commands",
    description: "",
    shouldShow: data => data.AutoP3,
    onClick() {
        const AutoP3Commands = [
            `&8&m${ChatLib.getChatBreak(" ")}`,
            `&0&l[&6&lAuto P3&0&l] &7&l- &6Help`,
            ``,
            `&6/p3 add rotate <yaw> <pitch> walk stop term motion center jump edge <radius>`,
            `&6/p3 add motion <yaw> rotate motion center jump edge <radius>`,
            `&6/p3 add wait <ticks> <yaw> <pitch> motion center jump edge <radius>`,
            `&6/p3 add coord <x> <y> <z> walk stop term motion center jump edge <radius>`,
            `&6/p3 add hclip <yaw> rotate motion center <radius>`,
            `&6/p3 add cmd <cmd> <radius>`,
            ``,
            `&6/p3 em &8- &7Toggles edit mode, disabling nodes while configging`,
            `&6/p3 exact &8- &7Toggles exact mode, placing nodes on your exact coordinate`,
            `&6/p3 remove &8- &7Removes the closest node`,
            `&6/p3 current &8- &7Says the current selected config`,
            `&6/p3 create <name> &8- &7Creates a config with the specified name`,
            `&6/p3 delete <name> &8- &7Deletes the specified config`,
            `&6/p3 switch <name> &8- &7Switches to the specified config`,
            `&8&m${ChatLib.getChatBreak(" ")}`
        ]
        ChatLib.chat(AutoP3Commands.join("\n"))
    }
})

/* Auto P3 | Colors */
.addColorPicker({
    category: "Auto P3",
    subcategory: "Colors",
    configName: "AutoP3RotateColor",
    title: "Rotate",
    description: "",
    value: [255, 170, 0, 255]
})

.addColorPicker({
    category: "Auto P3",
    subcategory: "Colors",
    configName: "AutoP3MotionColor",
    title: "Motion",
    description: "",
    value: [170, 170, 170, 255]
})

.addColorPicker({
    category: "Auto P3",
    subcategory: "Colors",
    configName: "AutoP3WaitColor",
    title: "Wait",
    description: "",
    value: [0, 0, 170, 255]
})

.addColorPicker({
    category: "Auto P3",
    subcategory: "Colors",
    configName: "AutoP3CoordSnapColor",
    title: "Coord",
    description: "",
    value: [0, 0, 0, 255]
})

.addColorPicker({
    category: "Auto P3",
    subcategory: "Colors",
    configName: "AutoP3HClipColor",
    title: "HClip",
    description: "",
    value: [255, 85, 255, 255]
})

.addColorPicker({
    category: "Auto P3",
    subcategory: "Colors",
    configName: "AutoP3KeyColor",
    title: "Key",
    description: "",
    value: [255, 255, 255, 255]
})

.addColorPicker({
    category: "Auto P3",
    subcategory: "Colors",
    configName: "AutoP3CmdColor",
    title: "Cmd",
    description: "",
    value: [255, 255, 255, 255]
})

.addColorPicker({
    category: "Auto P3",
    subcategory: "Colors",
    configName: "AutoP3BlinkColor",
    title: "Blink",
    description: "",
    value: [255, 255, 85, 255]
})

/* Auto P5 | Relics */
.addSwitch({
    category: "Auto P5",
    subcategory: "Relics",
    configName: "BlinkRelics",
    title: "Blink Relics",
    description: "Only red/orange",
})

.addMultiCheckbox({
    category: "Auto P5",
    subcategory: "Relics",
    configName: "RelicQoL",
    title: "Relic QoL",
    description: "",
    options: [
        {
            title: "Relic Aura",
            configName: "RelicAura",
            value: false
        },
        {
            title: "Auto Run To Relic - After Leap",
            configName: "AutoRunToRelic",
            value: false
        },
        {
            title: "Auto Equip Black Cat - After Leap",
            configName: "AutoEquipBlackCat",
            value: false
        }
    ],
})

.addDropDown({
    category: "Auto P5",
    subcategory: "Relics",
    configName: "RelicToRunTo",
    title: "➤ Relic To Run To",
    description: "Purple relic will trigger once 3+ players are in p5",
    options: ["Red", "Orange", "Blue", "Green", "Purple"],
    value: 0,
    shouldShow: data => data.AutoRunToRelic
})

/* Auto P5 | Toggle */
.addSwitch({
    category: "Auto P5",
    subcategory: "Toggle",
    configName: "AutoP5",
    title: "Toggle Auto P5",
    description: "",
})

.addSwitch({
    category: "Auto P5",
    subcategory: "Toggle",
    configName: "AutoP5Debug",
    title: "➤ Auto P5 Debug",
    description: "",
    shouldShow: data => data.AutoP5,
})

.addDropDown({
    category: "Auto P5",
    subcategory: "Toggle",
    configName: "HealerTeam",
    title: "➤ Healer Debuff Team",
    description: "",
    options: ["Arch Team", "Bers Team"],
    value: 0,
    shouldShow: data => data.AutoP5,
})

/* Auto P5 | Last Breath */
.addSwitch({
    category: "Auto P5",
    subcategory: "Last Breath",
    configName: "AutoLastBreath",
    title: "Toggle Auto Last Breath",
    description: "",
})

.addSlider({
    category: "Auto P5",
    subcategory: "Last Breath",
    configName: "PurpleDelay",
    title: "➤ Purple Last Breath Delay",
    description: "",
    options: [1, 15],
    value: 8,
    shouldShow: data => data.AutoLastBreath,
})

.addSlider({
    category: "Auto P5",
    subcategory: "Last Breath",
    configName: "BlueDelay",
    title: "➤ Blue Last Breath Delay",
    description: "",
    options: [1, 15],
    value: 8,
    shouldShow: data => data.AutoLastBreath,
})

.addSlider({
    category: "Auto P5",
    subcategory: "Last Breath",
    configName: "OrangeDelay",
    title: "➤ Orange Last Breath Delay",
    description: "",
    options: [1, 15],
    value: 8,
    shouldShow: data => data.AutoLastBreath,
})

.addSlider({
    category: "Auto P5",
    subcategory: "Last Breath",
    configName: "RedDelay",
    title: "➤ Red Last Breath Delay",
    description: "",
    options: [1, 15],
    value: 8,
    shouldShow: data => data.AutoLastBreath,
})

.addSlider({
    category: "Auto P5",
    subcategory: "Last Breath",
    configName: "GreenDelay",
    title: "➤ Green Last Breath Delay",
    description: "",
    options: [1, 15],
    value: 8,
    shouldShow: data => data.AutoLastBreath,
})

/* Auto P5 | Spray/Leth */
.addSwitch({
    category: "Auto P5",
    subcategory: "Spray/Leth",
    configName: "AutoIceSpray",
    title: "Toggle Auto Ice Spray",
    description: "",
})

.addSlider({
    category: "Auto P5",
    subcategory: "Spray/Leth",
    configName: "AutoIceSprayTick",
    title: "➤ Auto Ice Spray Tick",
    description: "",
    options: [1, 10],
    value: 1,
    shouldShow: data => data.AutoIceSpray,
})

.addSwitch({
    category: "Auto P5",
    subcategory: "Spray/Leth",
    configName: "AutoSoulWhip",
    title: "➤ Toggle Auto Soul Whip",
    description: "",
    shouldShow: data => data.AutoIceSpray,
})

.addSlider({
    category: "Auto P5",
    subcategory: "Spray/Leth",
    configName: "AutoSoulWhipTick",
    title: "➤ Auto Soul Whip Ticks",
    description: "",
    options: [15, 50],
    value: 15,
    shouldShow: data => data.AutoIceSpray,
})

/* Fast Leap | Fast Leap */
.addSwitch({
    category: "Fast Leap",
    subcategory: "Fast Leap",
    configName: "FastLeap",
    title: "Toggle Fast Leap",
    description: "",
})

.addTextInput({
    category: "Fast Leap",
    subcategory: "Fast Leap",
    configName: "FastLeapTarget",
    title: "➤ Fast Leap Target",
    description: "",
    shouldShow: data => data.FastLeap,
})

.addSwitch({
    category: "Fast Leap",
    subcategory: "Fast Leap",
    configName: "FastLeapDoorOpener",
    title: "Door Opener Fast Leap",
    description: "",
})

/* Fast Leap | Auto Leap */
.addMultiCheckbox({
    category: "Fast Leap",
    subcategory: "Auto Leap",
    configName: "Auto",
    title: "Auto Leap",
    description: "Green/Yellow Pad - leaps after storm is crushed\nPurple Pad - leaps after storm is enraged\nPre4 - leaps after pre4 is finished",
    options: [
        {
            title: "Green Pad",
            configName: "GreenPadAutoLeap",
            value: false
        },
        {
            title: "Yellow Pad",
            configName: "YellowPadAutoLeap",
            value: false
        },
        {
            title: "Purple Pad",
            configName: "PurplePadAutoLeap",
            value: false
        },
        {
            title: "Pre4",
            configName: "Pre4AutoLeap",
            value: false
        }
    ]
})

.addTextInput({
    category: "Fast Leap",
    subcategory: "Auto Leap",
    configName: "GreenPadTarget",
    title: "➤ Green Pad Target",
    description: "",
    shouldShow: data => data.GreenPadAutoLeap,
})

.addTextInput({
    category: "Fast Leap",
    subcategory: "Fast Leap",
    configName: "YellowPadTarget",
    title: "➤ Yellow Pad Target",
    description: "",
    shouldShow: data => data.YellowPadAutoLeap,
})

.addTextInput({
    category: "Fast Leap",
    subcategory: "Fast Leap",
    configName: "PurplePadTarget",
    title: "➤ Purple Pad Target",
    description: "",
    shouldShow: data => data.PurplePadAutoLeap,
})

.addTextInput({
    category: "Fast Leap",
    subcategory: "Fast Leap",
    configName: "Pre4Target",
    title: "➤ Pre4 Target",
    description: "",
    shouldShow: data => data.Pre4AutoLeap,
})

/* Fast Leap | Terminal Fast Leap */
.addSwitch({
    category: "Fast Leap",
    subcategory: "Terminal Fast Leap",
    configName: "TerminalFastLeap",
    title: "Toggle Terminal Fast Leap",
    description: "",
})

.addTextInput({
    category: "Fast Leap",
    subcategory: "Terminal Fast Leap",
    configName: "S1Target",
    title: "➤ EE2 Target",
    description: "",
    shouldShow: data => data.TerminalFastLeap,
})

.addTextInput({
    category: "Fast Leap",
    subcategory: "Terminal Fast Leap",
    configName: "S2Target",
    title: "➤ EE3 Target",
    description: "",
    shouldShow: data => data.TerminalFastLeap,
})

.addTextInput({
    category: "Fast Leap",
    subcategory: "Terminal Fast Leap",
    configName: "S3Target",
    title: "➤ Core Target",
    description: "",
    shouldShow: data => data.TerminalFastLeap,
})

.addTextInput({
    category: "Fast Leap",
    subcategory: "Terminal Fast Leap",
    configName: "S4Target",
    title: "➤ Tunnel Target",
    description: "",
    shouldShow: data => data.TerminalFastLeap,
})

/* Other | Auto Clip */
.addSwitch({
    category: "Other",
    subcategory: "Auto Clip",
    configName: "LavaClip",
    title: "Toggle Lava Clip Boxes",
    description: "",
})

.addSwitch({
    category: "Other",
    subcategory: "Auto Clip",
    configName: "RenderLavaClipThroughWalls",
    title: "➤ Render Lava Clip Through Walls",
    description: "",
    shouldShow: data => data.LavaClip,
})

.addMultiCheckbox({
    category: "Other",
    subcategory: "Auto Clip",
    configName: "Clip",
    title: "Other",
    description: "",
    options: [
        {
            title: "Storm Clip",
            configName: "StormClip",
            value: false
        },
        {
            title: "Core Clip",
            configName: "CoreClip",
            value: false
        },
    ]
})

/* Other | Packets */
.addMultiCheckbox({
    category: "Other",
    subcategory: "Packets",
    configName: "Packets",
    title: "Packets",
    description: "",
    options: [
        {
            title: "Packets Sent",
            configName: "PacketsSent",
            value: false
        },
        {
            title: "Packets Received",
            configName: "PacketsReceived",
            value: false
        },
    ]
})

/* Other | Simulate */
.addMultiCheckbox({
    category: "Other",
    subcategory: "Simulate",
    configName: "Simulate",
    title: "Singleplayer Simulations",
    description: "",
    options: [
        {
            title: "Etherwarp",
            configName: "SingleplayerEtherwarp",
            value: false
        },
        {
            title: "500 Speed",
            configName: "SingleplayerSpeed",
            value: false
        },
        {
            title: "Lava Bounce",
            configName: "SingleplayerLavaBounce",
            value: false
        },
        {
            title: "Superbounce - Water",
            configName: "SingleplayerSuperbounce",
            value: false
        },
    ]
})

/* Other | Other */
.addSwitch({
    category: "Other",
    subcategory: "Other",
    configName: "ZeroPingEtherwarp",
    title: "Zero Ping Etherwarp",
    description: "&cRecommended for autoroutes",
})
.addSwitch({
    category: "Other",
    subcategory: "Other",
    configName: "ZpewSuccessSound",
    title: "Success Sound",
    description: "",
    shouldShow: data => data.ZeroPingEtherwarp
})

.addSwitch({
    category: "Other",
    subcategory: "Other",
    configName: "InstamidSneak",
    title: "Instamid Sneak",
    description: "",
})

.addSwitch({
    category: "Other",
    subcategory: "Other",
    configName: "Doorless",
    title: "Doorless",
    description: "",
})

.addSwitch({
    category: "Other",
    subcategory: "Other",
    configName: "DoorlessClip",
    title: "Doorless Clip",
    description: "",
})

.addSwitch({
    category: "Other",
    subcategory: "Other",
    configName: "DarkMode",
    title: "Dark Mode",
    description: "",
})

.addSlider({
    category: "Other",
    subcategory: "Other",
    configName: "DarkModeOpacity",
    title: "➤ Dark Mode Opacity",
    description: "",
    options: [1, 200],
    value: 1,
    shouldShow: data => data.DarkMode,
})

const config = new Settings("AK47", AK47Config, "data/ColorScheme.json", "§0§l[§6§lAK§0§l-§6§l47§0§l] §7§lBy §6§lSnowyy")
.setPos(15, 15)
.setSize(70, 70)
.apply()
export default () => config.settings