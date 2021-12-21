import { AnimatedSprite } from "pixi.js";
import { Coord, forAll, getSecondsElapsed, hashCoord } from "../Misc/HelperFunctions";
import { getExplosion } from "../Rendering/GetSpriteFunctions";
import { DrawManager } from "../Rendering/DrawManager";
import { SideViewStage } from "./SideViewStage";
import { Player } from "./Player/Player";











export class ExplosionManager extends DrawManager<Explosion, AnimatedSprite> {
    
    
    explosionDuration:number

    // used as dictionary so type any
    timeFireStartedDictionary:any = {}
    
    constructor (stage:SideViewStage, explosionDuration:number) {
        super(stage, stage.getPlayerZIndexFromY, getExplosion)
        this.explosionDuration = explosionDuration 

    }

    damagePlayerInFire(players: Player[]) {
        forAll(players, (player:Player) => {
            if(this.inFlame(player.currentTile) || this.inFlame(player.targetTile))
                player.takeLife()
        })
    }

    inFlame(pos:Coord | undefined) :boolean {
        let timeFlameOnTile = pos ? this.timeFireStartedDictionary[hashCoord(pos)] : undefined
        return timeFlameOnTile ? this.flameIsStillOn(timeFlameOnTile) : false
    }

    flameIsStillOn(timeStarted:number) : boolean {
        return getSecondsElapsed(timeStarted) < this.explosionDuration
    }

    addExplosion(pos:Coord) {
        let explosion = this.placeDrawable((id) => new Explosion(this, pos, this.explosionDuration, id))
        explosion.gotoAndPlay(0)
        explosion.loop = true
        explosion.animationSpeed = 1
        
        this.timeFireStartedDictionary[hashCoord(pos)] = performance.now()
    }


}

export class Explosion {


    // Timeout type won't give, for now, any instead
    callBack:any
    constructor (
        private manager:ExplosionManager,
        public pos:Coord,
        private duration:number,
        public id:number) {

        setTimeout(() => {
            let now = performance.now()
            this.manager.setIdle(this)
        }, this.duration * 1000)
    }
}
