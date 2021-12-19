import { clone } from "lodash";
import { Container, Sprite } from "pixi.js";
import { Coord } from "../HelperFunctions";
import { IDPool } from "../Misc/idPool";
import { getBombSprite, getTileHeight, getTileWidth } from "../Rendering/DrawFunctions";
import { Game } from "./Game";
import { Level, SideViewStage } from "./Level";
import { Player, PlayerSkills } from "./Player/Player";











export class BombManager {

    idPool = new IDPool()

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
        


        new Bomb(this, player.currentTile, player.skills, id)
    }

    explode(bomb:Bomb) {
        this.bombSprites[bomb.id].visible = false
        this.idPool.setIdle(bomb.id)

        this.handleExplosion(bomb)
    }
}

export class Bomb {

    pos:Coord
    skills:PlayerSkills

    id:number

    manager:BombManager
    constructor (manager:BombManager, pos:Coord, skills:PlayerSkills, id:number) {
        this.manager = manager
        console.log("id:", id)
        this.pos = pos
        // incase player picksup an item before the bomb explodes
        this.skills = clone(skills)
        this.id = id

        // NOTE: gets corrupted when game is paused!!
        setTimeout(() => this.explode(), skills.detonationTime)
    }

    explode() {
        console.warn("explode!!")

        this.manager.explode(this)
    }
}
