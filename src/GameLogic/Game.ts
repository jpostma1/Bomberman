import { addCoord, Coord, forAll, getFraction, maximumBy, removeItem } from "../HelperFunctions"
import { logRed, logYellow, verboseLog } from "../Misc/Logging"
import { Level } from './Level';
import { ControlSettings, Player, PlayerSkills } from './Player/Player';
import { CollisionMap } from './CollisionMap';
import { Bomb, BombManager } from './BombManager';
import { keyJustPressed, keyJustPressedListener } from '../Input/KeyboardInput';
import { adjacentTiles, ClaimedTerritory } from './ClaimedTerritory';
import { ItemManager, ItemSettings } from './ItemManager';
import { Application } from 'pixi.js';


// =============== begin settings ================
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
    bombPower       : 2,
    reloadTime      : 10*3000, // in ms
    detonationTime  : 3*1000, // in ms
}

export interface GameSettings {
    lengthInSeconds     : number
}
let gameSettings:GameSettings = {
    lengthInSeconds: 60 //3*60 
}

let itemSettings:ItemSettings = {
    // the chances are relative to each other
    extraBombChance       : 10,
    extraSpeedChance      : 10,
    extraFirePowerChance  : 10,
    extraLifeChance       : 10,
    lessBombChance        : 10,
    lessSpeedChance       : 10,
    lessFirePowerChance   : 10,
    lessLifeChance        : 10,

    speedBoost      : standardPlayerSpeed/4,
    minBombPower    : 2,

    
    itemDropChance  : 0.2,
    // itemDropChance  : 0.1
}
// =============== end settings ================


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
    itemManager:ItemManager
    collisionMap:CollisionMap
    claimedTerritory:ClaimedTerritory
    bombFirePositions:Coord[] = []


    gameOver:boolean = false
    unaccountedDeltaTime:number = 0
    startingTime:number = performance.now()
    constructor(app:Application, levelString:string[]) {
        this.tileColumns = levelString.length
        this.tileRows = levelString[0].length

        
        this.level = new Level(levelString)
        this.bombManager = new BombManager((bomb) => this.handleExplosion(bomb), this.level.stage)
        app.stage.addChild(this.level.stage.container)
        this.itemManager = new ItemManager(this.level.stage, itemSettings)
        this.claimedTerritory = new ClaimedTerritory(this.tileColumns, this.tileRows)

        this.addPlayers()
        this.setupCollisionMap(levelString)
    }

    getWinnerMessage() {
        let alivePlayers = this.players.filter(p => p.alive)

        
        if (alivePlayers.length > 0) {
            // TODO: fix: rare case of a draw on claimed tiles will appoint first player ':)
            let winner = maximumBy(alivePlayers, (player:Player) => this.claimedTerritory.countClaimedTiles(player.id))
            return winner.name
        }

        return "No winner!"
    }

    runMechanics(newDelta:number) {
        if (this.isGameOver()) {
            if (!this.gameOver)
                this.reactComponent.gameOver(this.getWinnerMessage())
            this.gameOver = true
            return
        }

        this.clearBombFire()
            
        // NOTE: probably better if this has a max, compensating a lagg spike of > 1 sec would only mess up the game
        let currentDelta = this.unaccountedDeltaTime+newDelta
        
        forAll(this.players, (player:Player) => {
            // to pass a member function requires a lambda, otherwise 'this' isn't bound correctly 
            player.prepForUpdate((pos:Coord) => this.collides(pos))
        })

        // update
        for (let i = 0; i < currentDelta; i++) {
            forAll(this.players, (player:Player) => {
                this.checkPlayerCollision(player)
                this.claimTile(player)
            })
        }
        
        this.itemManager.pickupItems(this.players)
        
            
        this.readyForRender()
        this.unaccountedDeltaTime = getFraction(currentDelta)
    }

    claimTile(player:Player) {
        let currentTile = player.currentTile
        this.claimedTerritory.setTileXY(currentTile.x, currentTile.y, player.id)
        let outlineBonusTerritory:Coord[] = this.claimedTerritory.outlineMakesNewClosedTerritory(currentTile, player.id)
        outlineBonusTerritory.push(currentTile)
        forAll(outlineBonusTerritory, (pos:Coord) => this.level.tiles[pos.x][pos.y].tint = player.tint)
    }

    isGameOver() {
        return this.getSecondsLeft() <= 0 || this.playersAlive() <= 1
    }

    addPlayers() {
        let player = new Player("P1", 0xFF0000, 
            Math.floor(this.tileColumns/2), 
            Math.floor(this.tileRows/2), 
            wasdControls,
            startSkills,  
            this.level.stage)

        let otherPlayer = new Player("P2", 0x0000FF, 
            Math.floor(this.tileColumns/2+10), 
            Math.floor(this.tileRows/2), 
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
        player.takeLife()
        if (!player.alive)
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
                if (player.isInReach(pos)) {
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
        this.itemManager.maybeSpawnItem(pos)
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

    playersAlive() {
        let output = 0
        forAll(this.players, (player:Player) => {
            if (player.alive) 
                output++
        })

        return output
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

    getSecondsLeft() {
        return gameSettings.lengthInSeconds - (performance.now() - this.startingTime) / 1000
    }

    readyForRender() {
        // update clock
        this.reactComponent.updateClock(this.getSecondsLeft())

        forAll(this.players, (player:Player) => player.updateSpritePos())
    }
}


