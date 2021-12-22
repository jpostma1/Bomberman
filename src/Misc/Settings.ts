

export interface BombermanSettings {
    gameSettings:GameSettings
    startSkills:PlayerSkills
    itemSettings:ItemSettings
    levelString:string[]
}

export let levelString = [
    "wwwwwwwwwwwwwwwwwwwwwwww",
    "wcwcwcwcwcwcwcwcwcwcwccw",
    "wc....p1...c.c.c.c.c.ccw",
    "wc.cwcwcwc.cwcwcwcwcwccw",
    "w..cwcwcwc.cwcwcwcwcwccw",
    "wc.c.c.c.c.c.c.c.c.c.ccw",
    "wc.c.c.cwc.cwcwcwcwcwccw",
    "wc.........c.c.c.c.c.ccw",
    "wc.cwcwcwc.cwcwcwcwcwccw",
    "wc.c.c.....c.c.c.c.c.ccw",
    "wcwcwc.cwcwc.cwcwcwcwccw",
    "wc.c.c.....c.c.c.c.c.ccw",
    "wc.cwcwcwc.cwcwcwcwcwccw",
    "w..cwcwcwc.cwcwcwcwcwccw",
    "wc.c.c.c.c.c.c.c.c.c.ccw",
    "wc.c.c.cwc.cwcwcwcwcwccw",
    "wc.........c.c.c.c.c.ccw",
    "wc.cwcwcwc.cwcwcwcwcwccw",
    "wc.c.c.....c.c.c.c.c.ccw",
    "wcwcwc.cwcwc.cwcwcwcwccw",
    "wc.c.c.....c.c.c.c.c.ccw",
    "wcwcwc.cwc.c.cwcwcwcwccw",
    "w......c.c.c.c.c.c.c.ccw",
    "wc.cwc.cwc.c.cwcwcwcwccw",
    "w......c.c.c.c.c.c.c.ccw",
    "wc.cwc.cwc.c.cwcwcwcwccw",
    "w.....p2...............w",
    "wwwwwwwwwwwwwwwwwwwwwwww"
]


export interface PlayerSkills {
    lives               : number
    speed               : number
    // in seconds
    inviAfterHitDuration: number

    // bomb related
    maxBombs            : number
    bombPower           : number
    reloadTime          : number
    detonationTime      : number
}
export let startSkills:PlayerSkills = {
    lives               : 1,
    speed               : 0.035,
    inviAfterHitDuration: 2,

    maxBombs            : 2,
    bombPower           : 2,
    reloadTime          : 5, 
    detonationTime      : 3, 
    
}


export interface ItemSettings {
    // item drop chance (may be zero)
    extraBombChance         : number
    extraSpeedChance        : number
    extraFirePowerChance    : number
    extraLifeChance         : number
    
    lessBombChance          : number
    lessSpeedChance         : number
    lessFirePowerChance     : number
    lessLifeChance          : number

    // item effect variables
    speedBoost              : number
    minBombPower            : number

    // should be within 0 and 1
    itemDropChance          : number
}

export let itemSettings:ItemSettings = {
    // the chances are relative to each other
    extraBombChance     : 30,
    extraSpeedChance    : 20,
    extraFirePowerChance: 20,
    extraLifeChance     : 10,
    lessBombChance      : 5,
    lessSpeedChance     : 5,
    lessFirePowerChance : 5,
    lessLifeChance      : 5,

    speedBoost          : startSkills.speed/4,
    minBombPower        : 2,
    
    itemDropChance      : 0.15,
}


export interface GameSettings {
    // both in seconds
    gameDuration        : number
    explosionDuration   : number
}

export let gameSettings:GameSettings = {
    // all in seconds
    gameDuration: 3*60,
    explosionDuration: 2,
}




export interface ControlSettings {
    keyLeft  :string
    keyRight :string
    keyUp    :string
    keyDown  :string
    placeBomb:string
}

export let arrowControls:ControlSettings = {
    keyLeft   : 'left',
    keyRight  : 'right',
    keyUp     : 'up',
    keyDown   : 'down',
    placeBomb : 'enter',
}

export let wasdControls:ControlSettings = {
    keyLeft   : 'a',
    keyRight  : 'd',
    keyUp     : 'w',
    keyDown   : 's',
    placeBomb : 'space',
}


export let viewPortWidth:number = 1000