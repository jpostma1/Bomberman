import { Coord, forAll, getFraction, getSecondsElapsed, maximumBy, minimumBy, removeItem } from "../Misc/HelperFunctions"
import { Level } from './Level';
import { Player } from './Player/Player';
import { CollisionMap } from './CollisionMap';
import { keyJustPressed, keyJustPressedListener } from '../Input/KeyboardInput';
import { ClaimedTerritory } from './ClaimedTerritory';
import { Application } from 'pixi.js';
import { BombAndItemLogic } from "./BombAndItemLogic";
import { arrowControls, BombermanSettings, wasdControls } from "../Misc/Settings";
import { SimpleUI } from "../Rendering/SimpleUI";
import { logError } from "../Misc/Logging";
import { getPlayerSprite } from "../Rendering/GetSpriteFunctions";





export let collisionIds = {
    empty: 0,
    crate: 1,
    bomb: 2,
    bombFire:3, 
    wall: 5,
}


export class Game {

    ui:SimpleUI

    tileColumns:number
    tileRows:number

    level:Level
    players:Player[] = []
    bombAndItemLogic:BombAndItemLogic
    
    collisionMap:CollisionMap
    claimedTerritory:ClaimedTerritory

    unaccountedDeltaTime:number = 0

    gameOver:boolean = false
    gameDuration:number
    startingTime:number = performance.now()
    constructor(app:Application, settings:BombermanSettings) {
        this.tileColumns = settings.levelString.length
        this.tileRows = settings.levelString[0].length

        this.gameDuration = settings.gameSettings.gameDuration

        this.level = new Level(settings.levelString)
        app.stage.addChild(this.level.stage.container)
        

        this.collisionMap = new CollisionMap(this.tileColumns, this.tileRows)
        // side effect: parses player position
        let playerPositions = this.setupCollisionMap(settings.levelString)

        this.bombAndItemLogic = new BombAndItemLogic(settings.itemSettings, this.players, this.collisionMap, this.level, settings.gameSettings.explosionDuration)
        this.claimedTerritory = new ClaimedTerritory(this.tileColumns, this.tileRows)

        this.addPlayers(settings, playerPositions)
        this.ui = new SimpleUI(this.players, app.stage, this.level.stage.container)
    }
    
    getWinnerInfo() {
        let alivePlayers = this.players.filter(p => p.alive)

        
        if (alivePlayers.length > 0) {
            let winner = maximumBy(alivePlayers, (player:Player) => this.claimedTerritory.getClaimedTiles(player.id))

            let loser = minimumBy(alivePlayers, (player:Player) => this.claimedTerritory.getClaimedTiles(player.id))
            if (alivePlayers.length > 1 && loser != winner) {
                return { message: winner.name + " won the game!!", tint: winner.tint }
            }
        }

        return { message: "No winner!", tint: 0x000000 }
    }

    
    runMechanics(newDelta:number) {
        if (this.isGameOver()) {
            if (!this.gameOver) {
                let winnerInfo = this.getWinnerInfo()
                this.ui.gameOver(winnerInfo.message, winnerInfo.tint)
            }
                
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

        this.bombAndItemLogic.update()
        
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

    addPlayers(settings:BombermanSettings, playerPositions:any) {
        if (playerPositions[1] == undefined) {
            logError("player 1 is not present in level config file!")
            playerPositions[1] = {x:1, y: 1}
        }
        if (playerPositions[2] == undefined) {
            logError("player 2 is not present in level config file!")
            playerPositions[2] = {x:this.tileColumns-2, y: this.tileRows-2}
        }


        // NOTE: player id should be > 0 since claimed tiles are initialized with 0
        let player = new Player(settings.startSkills, 
            1, getPlayerSprite(0, 0), 0x5555FF, 
            Math.floor(playerPositions[1].x), 
            Math.floor(playerPositions[1].y), 
            wasdControls,
            this.level.stage)

        let otherPlayer = new Player(settings.startSkills, 
            2, getPlayerSprite(0, 16), 0xFF5555, 
            Math.floor(playerPositions[2].x), 
            Math.floor(playerPositions[2].y), 
            arrowControls, 
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
                    this.bombAndItemLogic.maybePlaceBomb(player)
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

    setupCollisionMap(levelString:string[]):any {
        let initialPlayerPositions:any = {}
        for (let x = 0; x < levelString.length; x++) {
            for (let y = 0; y < levelString[x].length; y++) {
                switch (levelString[x][y]) {
                    case 'p':
                        initialPlayerPositions[levelString[x][y+1]] = {x:x, y:y}
                    break
                    case '.':
                        this.collisionMap.setValue(x, y, 0)
                    break

                    case 'c':
                        this.collisionMap.setValue(x, y, collisionIds.crate)
                    break

                    case 'w':
                        this.collisionMap.setValue(x, y, collisionIds.wall)
                    break
                }
            }
        }

        return initialPlayerPositions
    }

    getSecondsLeft() {
        return this.gameDuration - getSecondsElapsed(this.startingTime)
    }

    readyForRender() {
        forAll(this.players, (player:Player) => player.updateSpritePos())
    }

}


