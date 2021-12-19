import * as PIXI from 'pixi.js';
import { addCoord, Coord, forAll, getFraction, magnitude, subtractCoord } from "../HelperFunctions"
import { logYellow, verboseLog } from "../Misc/Logging"
import { Level } from './Level';
import { ControlSettings, Player, PlayerSkills } from './Player/Player';
import { CollisionMap } from './CollisionMap';
import { clone } from 'lodash';
import { Bomb, BombManager } from './BombManager';
import { keyJustPressed, keyJustPressedListener } from '../Input/KeyboardInput';
import { Container } from 'pixi.js';
import { adjacentTiles } from './ClaimedTerritory';

let standardPlayerSpeed = 0.05
let arrowControls:ControlSettings = {
    keyLeft   : 'left',
    keyRight  : 'right',
    keyUp     : 'up',
    keyDown   : 'down',
    placeBomb : 'ctrl',
}

let wasdControls:ControlSettings = {
    keyLeft   : 'a',
    keyRight  : 'd',
    keyUp     : 'w',
    keyDown   : 's',
    placeBomb : 'space',
}

export let startSkills:PlayerSkills = {
    speed           : standardPlayerSpeed,
    maxBombs        : 20,
    bombPower       : 3,
    reloadTime      : 10*3000, // in ms
    detonationTime  : 3*1000, // in ms
}

export class Game {

    // NOTE: hacky coupling with React, for simple user interface updates
    setReactComponent(reactComponent:any) {
        this.reactComponent = reactComponent    
    }

    reactComponent:any 

    tileColumns:number
    tileRows:number

    level:Level
    players:Player[] = []
    bombManager:BombManager
    collisionMap:CollisionMap

    unaccountedDeltaTime:number
    constructor(app:PIXI.Application, levelString:string[]) {
        this.tileColumns = levelString.length
        this.tileRows = levelString[0].length

        
        this.level = new Level(levelString)
        this.bombManager = new BombManager((bomb) => this.handleExplosion(bomb), this.level.stage)
        app.stage.addChild(this.level.stage.container)
        
        
        this.addPlayers()

        this.setupCollisionMap(levelString)

        this.initializeVars()
    }

    addPlayers() {
        let player = new Player(this.tileColumns/2, this.tileRows/2, 
            wasdControls,
            startSkills,  
            this.level.stage)

        let otherPlayer = new Player(this.tileColumns/2+10, this.tileRows/2, 
            arrowControls, 
            startSkills,  
            this.level.stage)

        this.players.push(player, otherPlayer)


        forAll(this.players, (player:Player) => {
            this.level.addChild(player.sprite)
            // ===== debug =========
            this.level.addChild(player.targetSprite)
            // ===== debug =========
        })

        keyJustPressedListener.addKeyJustPressedFunction((event:KeyboardEvent) => {
            forAll(this.players, (player:Player) => {
                if (keyJustPressed(event, player.controls.placeBomb)) {
                    if (player.canPlaceBomb()) {
                        this.bombManager.placeBomb(player)
                    }
                }
            })
        })
    }

    killPlayer(player:Player) {
        logYellow("player killed!!", player)
    }

    handleExplosion(bomb:Bomb) {
        let hitTiles:Coord[] = [bomb.pos]

        forAll(adjacentTiles, (dir:Coord) => {
            this.scanLine(hitTiles, addCoord(bomb.pos, dir), dir, bomb.skills.bombPower)
        })

        // TODO: remove items in the line of fire
        forAll(hitTiles, (pos:Coord) => {
            forAll(this.players, (player:Player) => {
                if (magnitude(subtractCoord(pos, { x:player.x, y:player.y })) < 1)
                    this.killPlayer(player)
            })

            if (this.collisionMap.getCoordValue(pos) == 1) {
                    this.removeCrate(pos)
            }
        })

    }

    removeCrate(pos:Coord) {
        this.collisionMap.setCoord(pos, 0)
        this.level.removeCrate(pos)
    }

    scanLine(accumulator:Coord[], pos:Coord, direction:Coord, distance:number) :Coord[] {
        if (distance == 0)
            return accumulator

        let tileId = this.collisionMap.getCoordValue(pos)
        if (tileId > 0) {
            if (tileId == 1)
                accumulator.push(pos)

            return accumulator
        } else {
            // path in direction is free, so move forward
            return this.scanLine(accumulator, addCoord(pos, direction), direction, distance - 1)
        }
    }


    initializeVars () {
        this.unaccountedDeltaTime = 0
    }

    setupCollisionMap(levelString:string[]) {
        this.collisionMap = new CollisionMap(this.tileColumns, this.tileRows)
        for (let x = 0; x < levelString.length; x++) {
            for (let y = 0; y < levelString[x].length; y++) {
                switch (levelString[x][y]) {

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
        let currentDelta = this.unaccountedDeltaTime+newDelta
        
        forAll(this.players, (player:Player) => {
            player.fourDirectionMovement()
            // to pass a member function requires a lambda, otherwise 'this' isn't bound correctly 

            // TODO: when player presses 'other direction key', he should move that next free tile, currently he has to hold the key until he is centered on the current tile.
            // thus; lifting the 'other direction key' before centering results in ignored input
            player.calcTargetTile((pos:Coord) => this.collides(pos))

            // if (player.targetTile && this.collides(player.targetTile) != 0)
            //     player.targetTile = undefined

            for (let i = 0; i < currentDelta; i++)
                this.checkPlayerCollision(player)

        })
        

        
            
        this.readyForRender()
        this.unaccountedDeltaTime = getFraction(currentDelta)
    }

    readyForRender() {
        forAll(this.players, (player:Player) => player.updateSpritePos())
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

