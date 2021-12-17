import * as PIXI from 'pixi.js';
import { Coord, getFraction } from "../HelperFunctions"
import { verboseLog } from "../Misc/Logging"
import { Level } from './Level';
import { ControlSettings, Player } from './Player/Player';
import { CollisionMap } from './CollisionMap';

let standardPlayerSpeed = 0.05
let arrowControls:ControlSettings = {
    keyLeft   : 'left',
    keyRight  : 'right',
    keyUp     : 'up',
    keyDown   : 'down',
}

export class Game {
    setReactComponent(reactComponent:any) {
        this.reactComponent = reactComponent    
    }

    reactComponent:any 

    tileColumns:number
    tileRows:number

    level:Level
    player:Player
    collisionMap:CollisionMap

    unaccountedDeltaTime:number
    constructor(app:PIXI.Application, levelString:string[]) {
        this.tileColumns = levelString.length
        this.tileRows = levelString[0].length

        // console.log(this.tileColumns, this.tileRows)

        this.level = new Level(levelString)
        app.stage.addChild(this.level.container)
        this.player = new Player(this.tileColumns/2, this.tileRows/2, this.level.stage, arrowControls, 10000, standardPlayerSpeed)
        // console.log('player', this.player.sprite)
        this.level.addChild(this.player.sprite)
        // ===== debug =========
        this.level.addChild(this.player.targetSprite)
        // ===== debug =========

        this.setupCollisionMap(levelString)

        this.initializeVars()
    }

    initializeVars () {
        this.unaccountedDeltaTime = 0
    }

    setupCollisionMap(levelString:string[]) {
        this.collisionMap = new CollisionMap(this.tileColumns, this.tileRows)
        for(let x = 0; x < levelString.length; x++) {
            for(let y = 0; y < levelString[x].length; y++) {
                switch(levelString[x][y]) {

                    case '.':
                        this.collisionMap.setValue(x, y, 0)
                    break;

                    case 'c':
                        this.collisionMap.setValue(x, y, 1)
                    break;

                    case 'C':
                        this.collisionMap.setValue(x, y, 2)
                    break;

                    case 'w':
                        this.collisionMap.setValue(x, y, 5)
                    break;
                }
            }
        }
    }

    runMechanics(newDelta:number) {
        this.player.fourDirectionMovement()
        // to pass a member function requires a lambda, otherwise 'this' isn't bound correctly 

        // TODO: when player presses 'other direction key', he should move that next free tile, currently he has to hold the key until he is centered on the current tile.
        // lifting the 'other direction key' before centering currently results in ignored input
        this.player.calcTargetTile((pos:Coord) => this.collides(pos))

        // if(this.player.targetTile && this.collides(this.player.targetTile) != 0)
        //     this.player.targetTile = undefined


        let currentDelta = this.unaccountedDeltaTime+newDelta

        for(let i = 0; i < currentDelta; i++)
            this.checkPlayerCollision(this.player)

        this.unaccountedDeltaTime = getFraction(currentDelta)
            
        this.readyForRender()
    }

    readyForRender() {
        this.player.updateSpritePos()
    }

    collides(cornerPlusSpeedOffset:Coord) {
        let tileValue = this.collisionMap.checkValue(cornerPlusSpeedOffset.x, cornerPlusSpeedOffset.y)
        if (tileValue > 0)
            return true

        return false
    }


    checkPlayerCollision(player:Player) {

        if (player.targetTile != undefined) {
            player.moveToTargetTile()
            

            this.reactComponent.gamePokes()
        }

        this.keepPlayerInLevel(player)
    }


    keepPlayerInLevel(player:Player) {
        let tileMarge = 1
        if (player.x + tileMarge >= this.tileColumns)
            player.x = this.tileColumns - tileMarge
        if (player.x - tileMarge <= 0)
            player.x = 0 + tileMarge

        if (player.y + tileMarge >= this.tileRows)
            player.y = this.tileRows - tileMarge
        if (player.y - tileMarge <= 0)
            player.y = 0 + tileMarge
    }
}

