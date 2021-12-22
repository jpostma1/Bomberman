import { clone, isEqual } from "lodash";
import { Sprite } from "pixi.js";
import { Coord } from "../Misc/HelperFunctions";
import { getBombSprite } from "../Rendering/GetSpriteFunctions";
import { Drawable, DrawManager } from "../Rendering/DrawManager";
import { SideViewStage } from "./SideViewStage";
import { Player } from "./Player/Player";
import { PlayerSkills } from "../Misc/Settings";




export class BombManager extends DrawManager<Bomb, Sprite> {
    
    constructor(public handleExplosion:(bomb:Bomb) => void,
        stage:SideViewStage,
        ) {
        super(stage, stage.getBombZIndexFromY, getBombSprite)

    }

    placeBomb(player:Player) {
        this.placeDrawable((id:number) => new Bomb(this, player.currentTile, player.skills, id))
    }

    chainReaction(pos: Coord) {
        for(let i = 0; i < this.drawables.length; i++) {
            let bomb = this.drawables[i]
            if (isEqual(bomb.pos, pos)) {
                // since bomb is removed after explode
                i--;
                bomb.explode()
            }
        }
                
    }

    explode(bomb:Bomb) {
        this.setIdle(bomb)
        this.handleExplosion(bomb)
    }
}

export class Bomb implements Drawable {

    skills:PlayerSkills

    // "Timeout" type won't give, for now, any instead
    callBack:any
    constructor (
        public manager:BombManager, 
        public pos:Coord, 
        skills:PlayerSkills, 
        public id:number) {
        // incase player picks up an item before the bomb explodes
        this.skills = clone(skills)

        // NOTE: gets corrupted when game is paused!!
        this.callBack = setTimeout(() => this.explode(), skills.detonationTime*1000)
    }

    explode() {
        // incase the bomb is triggered by a chain reaction
        clearTimeout(this.callBack)

        this.manager.explode(this)
    }
}
