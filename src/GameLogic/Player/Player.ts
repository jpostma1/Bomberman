import { clone } from 'lodash';
import { Sprite } from 'pixi.js';
import { Coord, leftDir, rightDir, upDir, downDir, sign, addCoord } from "../../HelperFunctions"
import { keyPressed } from "../../Input/KeyboardInput"
import { getTileSprite, getWallSprite } from '../../Rendering/DrawFunctions';
import { SideViewStage } from '../Level'


// TODO: put and its related logic in the LevelStage Class
let yDistortion = 2


export interface PlayerSkills {
    speed           : number

    // bomb related
    maxBombs        : number
    bombPower       : number
    reloadTime      : number
    detonationTime  : number
}

export interface PlayerState {
    bombs           : number
    lastBombPlanted : number
}

export interface ControlSettings {
    keyLeft  :string
    keyRight :string
    keyUp    :string
    keyDown  :string
    placeBomb:string
}

export class Player {

    x:number
    y:number

    currentTile:Coord
    targetTile?:Coord
    movingDirection?:Coord
    secondaryMovingDirection?:Coord
    tabuDirection?:Coord

    lvlStage:SideViewStage

    targetSprite:Sprite
    sprite:Sprite

    controls:ControlSettings

    skills:PlayerSkills
    state:PlayerState

    constructor(x:number, y:number, controls:ControlSettings, skills:PlayerSkills, lvlStage:SideViewStage) {
        this.x = x
        this.y = y

        this.skills = clone(skills)
        this.resetState()

        this.controls = controls


        // These values can be 'unset' instead of using a seperate boolean for each I've used undefined to check if they are set. 
        this.targetTile = undefined
        this.movingDirection = undefined
        this.secondaryMovingDirection = undefined
        this.tabuDirection = undefined


        this.lvlStage = lvlStage

        this.updateCurrentTile()
        this.setupSprite()

    }

    canPlaceBomb() {
        // potentially put a timer between bomb placements
        return this.state.bombs > 0
    }

    public get speed() {
        return this.skills.speed
    }
    
    resetState() {
        this.state = { 
            bombs: this.skills.maxBombs,
            lastBombPlanted: 0,
        }
    }

    setupSprite() {
        // =========== debug ==============
        this.targetSprite = getTileSprite(1, 0, true)
        // =========================

        this.sprite = getWallSprite()
    }

    setX(x:number) {
        this.x = x
    }
    setY(y:number) {
        this.y = y
    }

    moveX(x:number) {
        this.x +=  x
    }
    moveY(y:number) {
        this.y += y
    }

    moveToTargetTile() {
        if (this.targetTile == undefined)
            return

        if (this.targetTile.x != this.x) {
            const targetDX = this.targetTile.x - this.x

            if (Math.abs(targetDX) < this.speed) {
                this.setX(this.targetTile.x)
                this.targetTile = undefined
            } else {
                this.moveX(sign(targetDX) * this.speed)
            }

        } else if (this.targetTile.y != this.y) {
            const targetDY = this.targetTile.y - this.y

            if (Math.abs(targetDY) < this.speed*yDistortion) {
                this.setY(this.targetTile.y)
                this.targetTile = undefined
            } else {
                this.moveY(sign(targetDY) * this.speed*yDistortion)
            }

        } else 
            this.targetTile = undefined
        
    }



    updateSpritePos() {
        this.sprite.x = this.lvlStage.toScreenCoordX(this.x)
        this.sprite.y = this.lvlStage.toScreenCoordY(this.y)
        this.sprite.zIndex = this.lvlStage.getPlayerZIndexFromY(this.y)
        this.targetSprite.zIndex = this.sprite.zIndex-1

        if(this.targetTile != undefined) {
            this.targetSprite.x = this.lvlStage.toScreenCoordX(this.targetTile.x)
            this.targetSprite.y = this.lvlStage.toScreenCoordY(this.targetTile.y)
        } else {
            this.targetSprite.x = -100000
            this.targetSprite.y = -100000
        }

    }

    fourDirectionMovement() {

        if (keyPressed(this.controls.keyLeft)) {

            if (this.movingDirection == undefined) 
                this.movingDirection = leftDir
            else if (this.movingDirection != leftDir)
                this.secondaryMovingDirection = leftDir

        } else {
            this.maybeResetMovingDirection(leftDir)
        }

        if (keyPressed(this.controls.keyRight)) {

            if (this.movingDirection == undefined) 
                this.movingDirection = rightDir
            else if (this.movingDirection != rightDir)
                this.secondaryMovingDirection = rightDir

        } else {
            this.maybeResetMovingDirection(rightDir)
        }

        if (keyPressed(this.controls.keyDown)) {
            
            if (this.movingDirection == undefined) 
                this.movingDirection = upDir
            else if (this.movingDirection != upDir)
                this.secondaryMovingDirection = upDir

        } else {
            this.maybeResetMovingDirection(upDir)
        }

        if (keyPressed(this.controls.keyUp)) {
            
            if (this.movingDirection == undefined) 
                this.movingDirection = downDir
            else if (this.movingDirection != downDir)
                this.secondaryMovingDirection = downDir

        } else {
            this.maybeResetMovingDirection(downDir)
        }

    }


    pathFreeInDir(collidesFunc:any, direction?:Coord) {

        if(direction != undefined) {

            let potentialTargetTile = addCoord(direction, this.currentTile)
            if (!collidesFunc(potentialTargetTile)) {

                if (this.alingedWith(potentialTargetTile)) {
                    return potentialTargetTile
                } else if(this.targetTile != undefined) {
                    
                    let secondaryCornerTile = addCoord(direction, this.targetTile)
                    if (collidesFunc(secondaryCornerTile)) {
                        // move backwards to prevent sticking to corner
                        return this.currentTile
                    }
                }
            }
        }

        return undefined
    }

    calcTargetTile(collidesFunc:any) {
        this.updateCurrentTile()

        if (this.movingDirection != undefined) {

            if (this.tabuDirection != this.secondaryMovingDirection) {
            
                let newTargetTile = this.pathFreeInDir(collidesFunc, this.secondaryMovingDirection)
                if (newTargetTile != undefined) {
                    this.targetTile = newTargetTile
                    this.setTabuSecondaryDirection()
                    return
                }
            }

            let potentialTargetTile = this.pathFreeInDir(collidesFunc, this.movingDirection)
            if (potentialTargetTile != undefined) {
                this.targetTile = potentialTargetTile
            } 
        }
    }

    alingedWith(tile:Coord) {
        let dx = Math.abs(this.x - tile.x)
        let dy = Math.abs(this.y - tile.y)

        return dx < this.speed || dy < this.speed * yDistortion
    }

    updateCurrentTile() {
        this.currentTile = { x:Math.round(this.x), y:Math.round(this.y) }
    }

    resetMovingDirection() {
        this.movingDirection = this.secondaryMovingDirection
        this.secondaryMovingDirection = undefined
        this.tabuDirection = undefined
    }

    maybeResetMovingDirection(direction:Coord) {
        if (this.movingDirection == direction)

            this.resetMovingDirection()

        else if (this.secondaryMovingDirection == direction) {
            this.secondaryMovingDirection = undefined
            this.tabuDirection = undefined
        }
        
    }

    setTabuSecondaryDirection() {
        let temp = this.secondaryMovingDirection
        this.secondaryMovingDirection = this.movingDirection
        this.movingDirection = temp
        this.tabuDirection = this.secondaryMovingDirection
    }
}

