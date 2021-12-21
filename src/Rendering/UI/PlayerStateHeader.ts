import { Text, Container, Sprite } from "pixi.js"
import { Player } from "../../GameLogic/Player/Player"
import { getFloorSprite, getItemExtraBombSprite, getItemExtraFirePowerSprite, getItemExtraLifeSprite, getTileHeight } from "../GetSpriteFunctions"





export class PlayerStateHeader {
    container:Container = new Container()
    uiHeight:number
    itemBars:ItemBar[] = []
    constructor(players:Player[], mainStage:Container, levelContainer:Container) {
        this.uiHeight = getTileHeight() * players.length * 2
        levelContainer.y = this.uiHeight


        mainStage.addChild(this.container)

        for (var i = 0; i < players.length; i++)
            this.itemBars.push(new ItemBar(this.container, players[i], i*getTileHeight()*2, getTileHeight() * 2))

    }

    update() {
        for (var i = 0; i < this.itemBars.length; i++)
            this.itemBars[i].update()
    }
}

class ItemBar {
    items:ItemUI[] = []
    constructor(container:Container, player:Player, y:number, height:number) {
        // accumulate x while placing items
        let accX = 0
        

        let extraLifeSprite = getItemExtraLifeSprite()
        this.items.push(new ItemUI(container, extraLifeSprite, () => player.lives(), accX, y, height))
        
        let itemUIWidth = extraLifeSprite.width * 4
        accX += itemUIWidth

        
        let tilesClaimed = getFloorSprite()
        tilesClaimed.tint = player.tint
        tilesClaimed.anchor.y = 0
        this.items.push(new ItemUI(container, tilesClaimed, () => player.tilesClaimed(), accX, y, height))

        accX += itemUIWidth

        let extraBombSprite = getItemExtraBombSprite()
        this.items.push(new ItemUI(container, extraBombSprite, () => player.bombs(), accX, y, height))

        accX += itemUIWidth

        let extraFirePowerSprite = getItemExtraFirePowerSprite()
        this.items.push(new ItemUI(container, extraFirePowerSprite, () => player.bombPower(), accX, y, height))

    }

    update() {
        for (var i = 0; i < this.items.length; i++)
            this.items[i].update()
    }
}

class ItemUI {
    currentValue:number
    text:Text = new Text("")
    constructor (
        private container:Container,
        private sprite:Sprite, 
        private getValue:() => number,
        private x:number,
        private y:number,
        private height:number) {

        sprite.x = x
        sprite.y = y
        sprite.width *= height / sprite.height
        sprite.height = height
        this.currentValue = getValue()
        this.setupText(this.currentValue)

        container.addChild(sprite)
    }

    update() {
        let newValue = this.getValue()
        if (this.currentValue != newValue) {
            this.setupText(newValue)
            this.currentValue = newValue
        }
    }

    setupText(value:number) {
        if (this.text)
            this.container.removeChild(this.text)

        this.text = new Text(value+"")
        this.text.x = this.x + this.sprite.width
        this.text.y = this.y
        this.text.width *= this.height / this.sprite.height
        this.text.height = this.height
        this.container.addChild(this.text)
    }
} 