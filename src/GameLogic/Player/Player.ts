import * as PIXI from 'pixi.js';
import { BaseTexture } from "pixi.js"
import { CollisionMap } from "../../GameLogic/CollisionMap"
import { Coord, isNumber, leftDir, rightDir, upDir, downDir, sign, addCoord, getFraction, magnitude, subtractCoord, centerCoord, center } from "../../HelperFunctions"
import { keyPressed } from "../../Input/KeyboardInput"
import { getAnimationFrameRectangle } from "../../Rendering/LoadAssets"
import { SideViewStage } from '../Level'


// TODO: put and its related logic in the LevelStage Class
let yDistortion = 2


export interface ControlSettings {
    keyLeft  :string
    keyRight :string
    keyUp    :string
    keyDown  :string
}

export class Player {

    x:number
    y:number

    currentTile:Coord
    targetTile?:Coord
    movingDirection?:Coord
    secondaryMovingDirection?:Coord
    tabuDirection?:Coord

    speed:number

    lvlStage:SideViewStage

    targetSprite:PIXI.Sprite
    sprite:PIXI.Sprite

    controls:ControlSettings

    constructor(x:number, y:number, lvlStage:SideViewStage, controls:ControlSettings, zIndex = 0, speed = 1) {
        this.x = x
        this.y = y
        if (!isNumber(this.x)) {
            // logError("ExamplePlayer: x is not a number:")
            // logError(this.x)
        }
        if (!isNumber(this.y)) {
            // logError("ExamplePlayer: y is not a number:")
            // logError(this.y)
        }

        this.controls = controls

        this.speed = speed

        // These values can be 'unset' instead of using a seperate boolean for each I've used undefined to check if they are set. 
        this.targetTile = undefined
        this.movingDirection = undefined
        this.secondaryMovingDirection = undefined
        this.tabuDirection = undefined


        this.lvlStage = lvlStage

        this.updateCurrentTile()
        this.setupSprite(zIndex)
    }

    setupSprite(zIndex:number) {
        // hardcoded tile sheet info
        const allTilesTexture:PIXI.BaseTexture = PIXI.BaseTexture.from('tilesFromSide')
        let sheetWidth = 7
        let sheetHeight = 1
        // ===========  ==============
        const targetSpriteTexture = new PIXI.Texture(allTilesTexture,
                    getAnimationFrameRectangle(allTilesTexture, 
                        sheetWidth, 
                        sheetHeight*2, 
                        //tile column
                        1,
                        //tile row
                        0
                        ))
        this.targetSprite = new PIXI.Sprite(targetSpriteTexture)
        this.targetSprite.scale.set(0.5,0.5)
        // =========================



        const texture = new PIXI.Texture(allTilesTexture,
                    getAnimationFrameRectangle(allTilesTexture, 
                        sheetWidth, 
                        sheetHeight, 
                        //tile column
                        4,
                        //tile row
                        0
                        ))
        // const texture = PIXI.Texture.from('bunny')
        this.sprite = new PIXI.Sprite(texture)


        this.sprite.scale.set(0.5,0.5)
        // this.sprite.scale.set(1,0.65)



        this.sprite.zIndex = zIndex
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
            if (Math.abs(this.x - this.targetTile.x) < this.speed) {
                this.setX(this.targetTile.x)
                this.targetTile = undefined
            } else {
                this.moveX(sign(this.targetTile.x - this.x)*this.speed)
            }
        } else if (this.targetTile.y != this.y) {
            // TODO: put and its related logic in the LevelStage Class
            if (Math.abs(this.y - this.targetTile.y) < this.speed*yDistortion) {
                this.setY(this.targetTile.y)
                this.targetTile = undefined
            } else {
                // TODO: put and its related logic in the LevelStage Class
                this.moveY(sign(this.targetTile.y - this.y)*this.speed*yDistortion)
            }
        } else 
            this.targetTile = undefined
        
    }



    updateSpritePos() {
        this.sprite.x = this.lvlStage.toScreenCoordX(this.x)
        this.sprite.y = this.lvlStage.toScreenCoordY(this.y)
        this.sprite.zIndex = this.lvlStage.getZIndexFromY(this.y)
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
        // TODO: put and its related logic in the LevelStage Class
        return Math.abs(this.x - tile.x) < this.speed || Math.abs(this.y - tile.y) < this.speed * yDistortion
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

