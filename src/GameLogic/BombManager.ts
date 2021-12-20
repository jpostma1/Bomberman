import { clone, isEqual } from "lodash";
import { Container, Sprite } from "pixi.js";
import { addCoord, Coord, forAll, removeItem } from "../HelperFunctions";
import { IDPool } from "../Misc/idPool";
import { getBombSprite, getTileHeight, getTileWidth } from "../Rendering/DrawFunctions";
import { adjacentTiles } from "./ClaimedTerritory";
import { CollisionMap } from "./CollisionMap";
import { collisionIds, Game, itemSettings } from "./Game";
import { ItemManager } from "./ItemManager";
import { Level, SideViewStage } from "./Level";
import { Player, PlayerSkills } from "./Player/Player";











export class BombManager {
    
    idPool = new IDPool()

    bombs:Bomb[] = []
    // explosionManager:ExplosionManager
    bombSprites:Sprite[] = []
    stage:SideViewStage

    collisionMap:CollisionMap
    itemManager:ItemManager
    bombFirePositions:Coord[] = []
    players:Player[]
    level:Level

    constructor (players:Player[], collisionMap:CollisionMap, level:Level, explosionDuration:number) {
        this.players = players
        this.collisionMap = collisionMap
        this.level = level
        this.stage = level.stage
        
        this.itemManager = new ItemManager(this.level.stage, itemSettings)
        // this.explosionManager = new ExplosionManager(level.stage, explosionDuration)
    }

    update() {
        this.clearBombFire()
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

        let id = this.idPool.newId()
        
        let sprite = this.bombSprites[id]
        if (!sprite) {
            console.log("new bombSprite", id)
            this.bombSprites[id] = getBombSprite()
            sprite = this.bombSprites[id]
            this.stage.addChild(sprite)
        }

        sprite.visible = true

        sprite.position.set(
            player.currentTile.x * getTileWidth(), 
            player.currentTile.y * getTileHeight())
        sprite.zIndex = this.stage.getBombZIndexFromY(sprite.y)

        this.bombs.push(new Bomb(this, player.currentTile, player.skills, id))
        
    }

    chainReaction(pos: Coord) {
        for(let i = 0; i < this.bombs.length; i++) {
            let bomb = this.bombs[i]
            if (isEqual(bomb.pos, pos)) {
                // since bomb is removed
                i--;   
                bomb.explode()
            }
        }
                
    }

    explode(bomb:Bomb) {
        this.bombSprites[bomb.id].visible = false
        this.idPool.setIdle(bomb.id)
        removeItem(this.bombs, bomb)

        this.handleExplosion(bomb)
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
            
            this.chainReaction(pos)

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
}

export class Bomb {

    pos:Coord
    skills:PlayerSkills

    id:number

    // Timeout type won't give, for now, any instead
    callBack:any
    manager:BombManager
    constructor (manager:BombManager, pos:Coord, skills:PlayerSkills, id:number) {
        this.manager = manager
        console.log("id:", id)
        this.pos = pos
        // incase player picksup an item before the bomb explodes
        this.skills = clone(skills)
        this.id = id

        // NOTE: gets corrupted when game is paused!!
        this.callBack = setTimeout(() => this.explode(), skills.detonationTime)
    }

    explode() {
        // incase the bomb is triggered by a chain reaction
        clearTimeout(this.callBack)

        this.manager.explode(this)
    }
}
