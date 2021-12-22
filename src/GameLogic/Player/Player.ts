import { clone } from 'lodash';
import { Sprite } from 'pixi.js';
import { Coord, leftDir, rightDir, upDir, downDir, sign, addCoord, magnitude, subtractCoord, getSecondsElapsed } from "../../Misc/HelperFunctions"
import { keyPressed } from "../../Input/KeyboardInput"
import { getTileSprite } from '../../Rendering/GetSpriteFunctions';
import { SideViewStage } from '../SideViewStage';
import { ControlSettings, PlayerSkills } from '../../Misc/Settings';

// TODO: put and its related logic in the LevelStage Class
let yDistortion = 2



export interface PlayerState {
    bombs           : number
    lastBombPlanted : number
    tilesClaimed    : number
}

// important to set at 1 ! (or higher)
// since id is used to claim tiles (and the territory is initialized to 0)
let currentPlayerId:number = 1

export class Player {

    name:string

    currentTile:Coord = {x:0, y:0}

    // These values can be 'unset' instead of using a seperate boolean for each I've used undefined to check if they are set.
    targetTile?:Coord
    movingDirection?:Coord
    secondaryMovingDirection?:Coord
    tabuDirection?:Coord

    targetSprite:Sprite

    skills:PlayerSkills
    state:PlayerState

    inviAfterHitDuration:number

    lastHit:number = Number.MIN_VALUE
    alive:boolean = true
    constructor(
        startSkills:PlayerSkills,
        public id:number,
        public sprite:Sprite,
        public tint:number, 
        public x:number, 
        public y:number, 
        public controls:ControlSettings,
        public lvlStage:SideViewStage) {
        
        
        this.name = "P" + this.id
        
        this.inviAfterHitDuration = startSkills.inviAfterHitDuration
        this.skills = clone(startSkills)
        this.state = { 
            bombs: this.skills.maxBombs,
            lastBombPlanted: 0,
            tilesClaimed: 0,
        }

        this.updateCurrentTile()

        this.targetSprite = getTileSprite(1, 0, true)
    }

    prepForUpdate(collidesFunc:(pos:Coord) => boolean) {
        this.fourDirectionMovement()
        this.reloadBomb()
        this.blinkIfInvincible()

        // TODO: when player presses 'other direction key', he should move that next free tile, currently he has to hold the key until he is centered on the current tile.
        // thus; lifting the 'other direction key' before centering results in ignored input
        this.calcTargetTile(collidesFunc)
    }

    private blinkIfInvincible() {
        let secondsSinceHit = getSecondsElapsed(this.lastHit)
        if (secondsSinceHit < this.inviAfterHitDuration) {
            this.sprite.visible = this.shouldBlinkFunc(secondsSinceHit)
        } else 
            this.sprite.visible = true

    }
    private shouldBlinkFunc(secondsSinceHit:number) :boolean {
        return Math.floor(secondsSinceHit / this.inviAfterHitDuration * 15) % 2 == 0
    }


    private reloadBomb() {
        if (this.state.bombs < this.skills.maxBombs 
            && getSecondsElapsed(this.state.lastBombPlanted) > this.skills.reloadTime) {
                // incase more bombs need to be reloaded, reset lastBombPlanted
                this.state.lastBombPlanted = performance.now()
                this.state.bombs++
            }
    }

    takeLife() {
        if (getSecondsElapsed(this.lastHit) < this.inviAfterHitDuration)
            return

        this.skills.lives--
        this.lastHit = performance.now()

        if (this.skills.lives < 0) {
            this.alive = false
            this.sprite.visible = false
            this.targetSprite.visible = false
        }
    }

    canPlaceBomb() {
        // potentially put a timer between bomb placements
        return this.state.bombs > 0
    }

    isInReach(pos:Coord) : boolean {
        // TODO: instead of "-player.speed" round the player pos to the exact tile when aligned
        // "-player.speed" currently prevents faulty hits but is not a very clean solution
        return magnitude(subtractCoord(pos, { x:this.x, y:this.y })) < 1-this.speed
    }

    public get speed() {
        return this.skills.speed
    }

    public lives() {
        return this.skills.lives
    }

    public bombs() {
        return this.state.bombs
    }

    public bombPower() {
        return this.skills.bombPower
    }

    public tilesClaimed() {
        return this.state.tilesClaimed
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
            // targetSprite is half a normal tile, so we have to compensate with y + 1
            this.targetSprite.y = this.lvlStage.toScreenCoordY(this.targetTile.y+1)
        } else {
            this.targetSprite.x = -100000
            this.targetSprite.y = -100000
        }

    }

    private fourDirectionMovement() {

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


    private pathFreeInDir(collidesFunc:any, direction?:Coord) {

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

    private calcTargetTile(collidesFunc:any) {
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

    private alingedWith(tile:Coord) {
        let dx = Math.abs(this.x - tile.x)
        let dy = Math.abs(this.y - tile.y)

        return dx < this.speed || dy < this.speed * yDistortion
    }

    private updateCurrentTile() {
        this.currentTile = { x:Math.round(this.x), y:Math.round(this.y) }
    }

    private resetMovingDirection() {
        this.movingDirection = this.secondaryMovingDirection
        this.secondaryMovingDirection = undefined
        this.tabuDirection = undefined
    }

    private maybeResetMovingDirection(direction:Coord) {
        if (this.movingDirection == direction)

            this.resetMovingDirection()

        else if (this.secondaryMovingDirection == direction) {
            this.secondaryMovingDirection = undefined
            this.tabuDirection = undefined
        }
        
    }

    private setTabuSecondaryDirection() {
        let temp = this.secondaryMovingDirection
        this.secondaryMovingDirection = this.movingDirection
        this.movingDirection = temp
        this.tabuDirection = this.secondaryMovingDirection
    }
}


