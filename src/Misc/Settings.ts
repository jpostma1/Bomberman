
import { PlayerSkills } from "../GameLogic/Player/Player"


// =============== begin settings ================




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

    // item variable
    speedBoost              : number
    minBombPower            : number

    // should be within 0 and 1
    itemDropChance          : number
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
    placeBomb : 'ctrl',
}

export let wasdControls:ControlSettings = {
    keyLeft   : 'a',
    keyRight  : 'd',
    keyUp     : 'w',
    keyDown   : 's',
    placeBomb : 'space',
}

export let startSkills:PlayerSkills = {
    speed           : 0.05,
    maxBombs        : 20,
    bombPower       : 2,
    reloadTime      : 10, // in seconds
    detonationTime  : 3, // in seconds
}

export interface GameSettings {
    gameDuration        : number
    explosionDuration   : number
    inviAfterHitDuration: number
}

export let gameSettings:GameSettings = {
    // all duration is in seconds
    gameDuration: 60, //3*60 
    explosionDuration: 2,
    inviAfterHitDuration: 2,
}

export let itemSettings:ItemSettings = {
    // the chances are relative to each other
    extraBombChance       : 10,
    extraSpeedChance      : 10,
    extraFirePowerChance  : 10,
    extraLifeChance       : 10,
    lessBombChance        : 10,
    lessSpeedChance       : 10,
    lessFirePowerChance   : 10,
    lessLifeChance        : 10,

    speedBoost      : startSkills.speed/4,
    minBombPower    : 2,

    
    itemDropChance  : 1, //0.2,
}
// =============== end settings ================