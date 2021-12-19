import * as PIXI from 'pixi.js';
import { addCoord, Coord, forAll, getFraction, magnitude, removeItem, subtractCoord } from "../HelperFunctions"
import { logRed, logYellow, verboseLog } from "../Misc/Logging"
import { Level } from './Level';
import { ControlSettings, Player, PlayerSkills } from './Player/Player';
import { CollisionMap } from './CollisionMap';
import { Bomb, BombManager } from './BombManager';
import { keyJustPressed, keyJustPressedListener } from '../Input/KeyboardInput';
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

let collisionIds = {
    empty: 0,
    crate: 1,
    bomb: 2,
    bombFire:3, 
    wall: 5,
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
    bombFirePositions:Coord[] = []

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
        let player = new Player("P1", this.tileColumns/2, this.tileRows/2, 
            wasdControls,
            startSkills,  
            this.level.stage)

        let otherPlayer = new Player("P2", this.tileColumns/2+10, this.tileRows/2, 
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
                        this.placeBomb(player)
                    }
                }
            })
        })
    }

    placeBomb(player:Player) {
        this.collisionMap.setCoord(player.currentTile, collisionIds.bomb)
        this.bombManager.placeBomb(player)
    }

    killPlayer(player:Player) {
        player.kill()
        removeItem(this.players, player)
    }

    handleExplosion(bomb:Bomb) {
        let hitTiles:Coord[] = [bomb.pos]

        forAll(adjacentTiles, (dir:Coord) => {
            this.scanLine(hitTiles, addCoord(bomb.pos, dir), dir, bomb.skills.bombPower)
        })

        // TODO: remove items in the line of fire
        
        forAll(hitTiles, (pos:Coord) => {
            forAll(this.players, (player:Player) => {
                console.log(magnitude(subtractCoord(pos, { x:player.x, y:player.y })), pos, subtractCoord(pos, { x:player.x, y:player.y }))

                if (magnitude(subtractCoord(pos, { x:player.x, y:player.y })) < 1-player.speed) {
                    this.killPlayer(player)
                }
            })
            
            this.bombManager.chainReaction(pos)

            if (this.collisionMap.getCoordValue(pos) == 1) {
                this.removeCrate(pos)
            }
            
            this.bombFirePositions.push(pos)
        })
    }

    removeCrate(pos:Coord) {
        // can't erase crate collision yet, since a chainreaction could then penetrate multiple crates. Among other artifacts
        this.collisionMap.setCoord(pos, collisionIds.bombFire)
        this.level.removeCrate(pos)
    }

    clearBombFire() {
        // remove bomb fire
        forAll(this.bombFirePositions, (pos:Coord) => {
            this.collisionMap.setCoord(pos, collisionIds.empty)
        })
        
        this.bombFirePositions.length = 0
    }

    scanLine(accumulator:Coord[], pos:Coord, direction:Coord, distance:number) :Coord[] {
        if (distance == 0)
            return accumulator

        let tileId = this.collisionMap.getCoordValue(pos)
        if (tileId > 0) {
            if (tileId < collisionIds.wall)
                accumulator.push(pos)

            return accumulator
        } else {
            accumulator.push(pos)
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
                        this.collisionMap.setValue(x, y, collisionIds.crate)
                    break;

                    case 'w':
                        this.collisionMap.setValue(x, y, collisionIds.wall)
                    break;
                }
            }
        }
    }

    runMechanics(newDelta:number) {
        if (this.players.length <= 1) {
            this.reactComponent.gameOver(this.players)
            return
        }

        this.clearBombFire() 
            

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

