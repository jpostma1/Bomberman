import { clone, isEqual } from "lodash";
import { Container, Sprite } from "pixi.js";
import { Coord, forAll, removeItem } from "../HelperFunctions";
import { IDPool } from "../Misc/idPool";
import { getBombSprite, getTileHeight, getTileWidth } from "../Rendering/DrawFunctions";
import { Game } from "./Game";
import { Level, SideViewStage } from "./Level";
import { Player, PlayerSkills } from "./Player/Player";











export class BombManager {
    
    idPool = new IDPool()

    bombs:Bomb[] = []
    bombSprites:Sprite[] = []
    stage:SideViewStage

    handleExplosion:(bomb:Bomb) => void
    constructor (handleExplosion:(bomb:Bomb) => void, stage:SideViewStage) {
        this.handleExplosion = handleExplosion
        this.stage = stage
    }


    placeBomb(player:Player) {
        player.state.lastBombPlanted = performance.now()
        player.state.bombs--
        
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
