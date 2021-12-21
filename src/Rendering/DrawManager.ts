import { Sprite } from "pixi.js"
import { SideViewStage } from "../GameLogic/SideViewStage"
import { Coord, removeItem } from "../Misc/HelperFunctions"
import { IDPool } from "../Misc/idPool"
import { getTileHeight, getTileWidth } from "./GetSpriteFunctions"



export interface Drawable {
    id:number,
    pos:Coord,
}

export class DrawManager<T extends Drawable, S extends Sprite> {
    idPool = new IDPool()

    drawables:T[] = []
    sprites:S[] = []
    
    constructor(
        private stage:SideViewStage,
        private getZIndexFromY:(y:number) => number,
        private getDrawable:() => S,

        ) {

    }

    placeDrawable(makeDrawable:(id:number) => T):S {
        let id = this.idPool.newId()

        let drawable = makeDrawable(id)

        let sprite = this.sprites[id]
        if (!sprite) {
            this.sprites[id] = this.getDrawable()
            sprite = this.sprites[id]
            this.stage.addChild(sprite)
        }

        sprite.visible = true

        sprite.position.set(
            drawable.pos.x * getTileWidth(), 
            drawable.pos.y * getTileHeight())
        sprite.zIndex = this.getZIndexFromY(sprite.y)

        this.drawables.push(drawable)

        return sprite
    }

    setIdle(drawable:T) {
        this.sprites[drawable.id].visible = false
        this.idPool.setIdle(drawable.id)

        removeItem(this.drawables, drawable)
    }
}