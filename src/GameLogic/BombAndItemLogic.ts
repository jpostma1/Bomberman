import { Coord, forAll, addCoord, hashCoord } from "../Misc/HelperFunctions"
import { ItemSettings } from "../Misc/Settings"
import { getFloorTexture } from "../Rendering/GetSpriteFunctions"
import { Bomb, BombManager } from "./BombManager"
import { adjacentTiles } from "./ClaimedTerritory"
import { CollisionMap } from "./CollisionMap"
import { ExplosionManager } from "./ExplosionManager"
import { collisionIds } from "./Game"
import { ItemManager } from "./ItemManager"
import { Level } from "./Level"
import { Player } from "./Player/Player"


// basically an extension of Game / partial class of Game 
export class BombAndItemLogic {
    
    explosionManager:ExplosionManager
    
    bombManager:BombManager
    itemManager:ItemManager
    bombFirePositions:Coord[] = []

    // used as dictionary, so any type
    newFireDictionary:any = {}

    constructor (
        itemSettings:ItemSettings,
        public players:Player[], 
        public collisionMap:CollisionMap, 
        public level:Level, 
        explosionDuration:number) {

        this.players = players
        this.collisionMap = collisionMap
        this.level = level

        this.bombManager = new BombManager((bomb:Bomb) => this.handleExplosion(bomb), this.level.stage)
        this.itemManager = new ItemManager(this.level.stage, itemSettings)
        this.explosionManager = new ExplosionManager(level.stage, explosionDuration)
    }

    update() {
        this.handleBombFire()
        this.itemManager.pickupItems(this.players)
    }

    maybePlaceBomb(player:Player) {    
        if (player.canPlaceBomb())
            this.placeBomb(player)
    }

    placeBomb(player:Player) {
        player.state.lastBombPlanted = performance.now()
        player.state.bombs--
        
        this.collisionMap.setCoord(player.currentTile, collisionIds.bomb)

        this.bombManager.placeBomb(player)
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
                    player.takeLife()
                }
            })

            this.newFireDictionary[hashCoord(pos)] = pos
            this.bombManager.chainReaction(pos)

            if (this.collisionMap.getCoordValue(pos) == 1) {
                this.removeCrate(pos)
            }
        })
    }

    removeCrate(pos:Coord) {
        // can't erase crate collision yet, since a chainreaction could then penetrate multiple crates. Among other artifacts
        this.collisionMap.setCoord(pos, collisionIds.bombFire)
        let tile = this.level.tiles[pos.x][pos.y]
        
        // adding a new tile to the container messed up PIXI's tracking of the zIndex
        // setting the texture to floor didn't trigger this issue. 
        tile.texture = getFloorTexture()
        tile.alpha = 0.2
        tile.anchor.y = -1

        this.itemManager.maybeSpawnItem(pos)
    }

    handleBombFire() {
        forAll(this.newFireDictionary, (pos:Coord) => {
            if (pos.x != undefined && pos.y != undefined) {
                this.explosionManager.addExplosion(pos)
                
                // remove bomb fire 
                this.collisionMap.setCoord(pos, collisionIds.empty)
            }
        })

        this.explosionManager.damagePlayerInFire(this.players)
        
        this.newFireDictionary = {}
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
}