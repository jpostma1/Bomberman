import { Text, Container, Sprite, TextStyle } from "pixi.js"
import { Player } from "../GameLogic/Player/Player"
import { viewPortWidth } from "../Misc/Settings"
import { getFloorSprite, getItemExtraBombSprite, getItemExtraFirePowerSprite, getItemExtraLifeSprite, getTileHeight } from "./GetSpriteFunctions"





export class SimpleUI {
    container:Container = new Container()
    uiHeight:number
    itemBars:ItemBar[] = []
    timeLeftText:Text = new Text("")
    constructor(players:Player[], mainStage:Container, levelContainer:Container) {
        this.uiHeight = getTileHeight() * players.length * 2
        levelContainer.y = this.uiHeight

        mainStage.addChild(this.container)

        for (var i = 0; i < players.length; i++)
            this.itemBars.push(new ItemBar(this.container, players[i], i*getTileHeight()*2, getTileHeight() * 2))

    }

    gameOver(winnerMessage:string, tint:number) {
        const style = new TextStyle({
            fontFamily: 'Arial',
            fontSize: 36,
            fontStyle: 'italic',
            fontWeight: 'bold',
            fill: tint,
            stroke: '#ffffff',
            strokeThickness: 5,
            dropShadow: true,
            dropShadowColor: '#000000',
            dropShadowBlur: 4,
            dropShadowAngle: Math.PI / 6,
            dropShadowDistance: 6,
            wordWrap: false,
            lineJoin: 'round',
        });
        
        let winnerText = new Text(winnerMessage, style)
        winnerText.x = viewPortWidth/2
        winnerText.y = winnerText.x*window.innerHeight/window.innerWidth
        winnerText.anchor.set(0.5, 0.5)
        this.container.addChild(winnerText)

        let restartText =  new Text("(Press N to restart)", style)
        restartText.x = viewPortWidth/2
        restartText.y = restartText.x*window.innerHeight/window.innerWidth + 40
        restartText.anchor.set(0.5, 0.5)
        this.container.addChild(restartText)
    }

    update(secondsLeft:number) {
        for (var i = 0; i < this.itemBars.length; i++)
            this.itemBars[i].update()

        this.container.removeChild(this.timeLeftText)
        this.timeLeftText.destroy()
        this.timeLeftText = new Text("Time left: " + secondsLeft)
        this.timeLeftText.x = this.itemBars[0].accX + this.uiHeight
        this.container.addChild(this.timeLeftText)
    }
}

class ItemBar {
    items:ItemUI[] = []

    // accumulate x while placing items
    accX:number = 0
    constructor(container:Container, player:Player, y:number, height:number) {
        
        let extraLifeSprite = getItemExtraLifeSprite()
        this.items.push(new ItemUI(container, extraLifeSprite, () => player.lives(), this.accX, y, height))
        
        let itemUIWidth = extraLifeSprite.width * 4
        this.accX += itemUIWidth

        
        let tilesClaimed = getFloorSprite()
        tilesClaimed.tint = player.tint
        tilesClaimed.anchor.y = 0
        this.items.push(new ItemUI(container, tilesClaimed, () => player.tilesClaimed(), this.accX, y, height))

        this.accX += itemUIWidth

        let extraBombSprite = getItemExtraBombSprite()
        this.items.push(new ItemUI(container, extraBombSprite, () => player.bombs(), this.accX, y, height))

        this.accX += itemUIWidth

        let extraFirePowerSprite = getItemExtraFirePowerSprite()
        this.items.push(new ItemUI(container, extraFirePowerSprite, () => player.bombPower(), this.accX, y, height))

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
        if (this.text) {
            this.container.removeChild(this.text)
            this.text.destroy()
        }   

        this.text = new Text(value+"")
        this.text.x = this.x + this.sprite.width
        this.text.y = this.y
        this.text.width *= this.height / this.sprite.height
        this.text.height = this.height
        this.container.addChild(this.text)
    }
} 