import { Coord, forAll, getFraction, getSecondsElapsed, maximumBy, removeItem } from "../Misc/HelperFunctions"
import { Level } from './Level';
import { Player } from './Player/Player';
import { CollisionMap } from './CollisionMap';
import { keyJustPressed, keyJustPressedListener } from '../Input/KeyboardInput';
import { ClaimedTerritory } from './ClaimedTerritory';
import { Application } from 'pixi.js';
import { BombAndItemLogic } from "./BombAndItemLogic";
import { arrowControls, gameSettings, startSkills, wasdControls } from "../Misc/Settings";
import { PlayerStateHeader } from "../Rendering/UI/PlayerStateHeader";





export let collisionIds = {
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
    ui:PlayerStateHeader

    tileColumns:number
    tileRows:number

    level:Level
    players:Player[] = []
    bombManager:BombAndItemLogic
    
    collisionMap:CollisionMap
    claimedTerritory:ClaimedTerritory

    gameOver:boolean = false
    unaccountedDeltaTime:number = 0
    startingTime:number = performance.now()
    constructor(app:Application, levelString:string[]) {
        this.tileColumns = levelString.length
        this.tileRows = levelString[0].length

        this.level = new Level(levelString)
        app.stage.addChild(this.level.stage.container)

        this.collisionMap = new CollisionMap(this.tileColumns, this.tileRows)
        this.setupCollisionMap(levelString)

        this.bombManager = new BombAndItemLogic(this.players, this.collisionMap, this.level, gameSettings.explosionDuration)
        this.claimedTerritory = new ClaimedTerritory(this.tileColumns, this.tileRows)

        this.addPlayers()
        this.ui = new PlayerStateHeader(this.players, app.stage, this.level.stage.container)
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

        this.bombManager.update()
        
        this.readyForRender()
        this.unaccountedDeltaTime = getFraction(currentDelta)
    }

    claimTile(player:Player) {
        let currentTile = player.currentTile
        this.claimedTerritory.setTileXY(currentTile.x, currentTile.y, player.id)
        let outlineBonusTerritory:Coord[] = this.claimedTerritory.outlineMakesNewClosedTerritory(currentTile, player.id)
        outlineBonusTerritory.push(currentTile)
        forAll(outlineBonusTerritory, (pos:Coord) => this.level.tiles[pos.x][pos.y].tint = player.tint)
        player.state.tilesClaimed = this.claimedTerritory.getClaimedTiles(player.id)
    }

    isGameOver() {
        return this.getSecondsLeft() <= 0 || this.playersAlive() <= 1
    }

    addPlayers() {
        let player = new Player("P1", 0x0000FF, 
            Math.floor(this.tileColumns/2), 
            Math.floor(this.tileRows/2), 
            wasdControls,
            startSkills,  
            this.level.stage)

        let otherPlayer = new Player("P2", 0xFF0000, 
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
                    this.bombManager.maybePlaceBomb(player)
                }
            })
        })
    }

    playersAlive() {
        let output = 0
        for (let i = 0; i < this.players.length; i++) {
            let player = this.players[i]
            if (player.alive) 
                output++
            else {
                i--
                removeItem(this.players, player)
            }       
        }

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

    setupCollisionMap(levelString:string[]) {
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

    getSecondsLeft() {
        return gameSettings.gameDuration - getSecondsElapsed(this.startingTime)
    }

    readyForRender() {
        // update clock
        this.reactComponent.updateClock(this.getSecondsLeft())

        forAll(this.players, (player:Player) => player.updateSpritePos())
    }
}


