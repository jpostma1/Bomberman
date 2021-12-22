
import { Sprite } from "pixi.js";
import { binarySearch, Coord, forAll, removeItem } from "../Misc/HelperFunctions";
import { getItemExtraBombSprite, getItemExtraFirePowerSprite, getItemExtraLifeSprite, getItemExtraSpeedSprite, getItemLessBombSprite, getItemLessFirePowerSprite, getItemLessLifeSprite, getItemLessSpeedSprite, getItemSprite, getTileHeight, getTileWidth } from "../Rendering/GetSpriteFunctions";
import { SideViewStage } from "./SideViewStage";
import { Player } from "./Player/Player";
import { ItemSettings } from "../Misc/Settings";




export class Item {
    constructor (
        public manager:ItemManager, 
        public sprite:Sprite,
        public pos:Coord, 
        public pickupAction:(player:Player) => void) {

        sprite.x = (0.25 + pos.x) * getTileWidth()
        sprite.y = pos.y * getTileHeight()

        sprite.zIndex = manager.stage.getItemZIndexFromY(sprite.y)

        manager.stage.addChild(sprite)
    }
}

export class ItemManager {

    itemSpawnFuncs:((pos:Coord) => Item)[] = []
    itemChances:number[] = []
    totalChanceFactor:number = 0

    currentItems:Item[] = []
    itemSettings:ItemSettings

    stage:SideViewStage
    constructor (stage:SideViewStage, itemSettings:ItemSettings) {
        this.stage = stage
        this.itemSettings = itemSettings


        this.initItemChances()
    }

    pickupItems(players:Player[]) {
        forAll(players, (player:Player) => {
            for (var i = 0; i < this.currentItems.length; i++) {
                let item = this.currentItems[i]
                if (player.isInReach(item.pos)) {
                    i--
                    this.pickupItem(item, player)
                }
            }
        })
    }

    pickupItem(item:Item, player:Player) {
        item.pickupAction(player)
        removeItem(this.currentItems, item)
        this.stage.removeChild(item.sprite)
    }

    maybeSpawnItem(pos:Coord) {
        if (Math.random() < this.itemSettings.itemDropChance) 
            this.spawnItem(pos)
    }

    spawnItem(pos:Coord) {
        let chanceIndex = Math.random() * this.totalChanceFactor
        // concise way to take item chances into account, without knowing the range provided in the config file
        let itemIndex = binarySearch(this.itemChances, chanceIndex)

        let newItem = this.itemSpawnFuncs[itemIndex](pos)
        this.currentItems.push(newItem)
    }

    spawnItemExtraBomb(pos:Coord) : Item {
        let itemSprite:Sprite = getItemExtraBombSprite()
        return new Item(this, itemSprite, pos, (player:Player) => {
            player.skills.maxBombs++
            player.state.bombs++
        })
    }
    
    spawnItemExtraSpeed(pos:Coord) : Item {
        let itemSprite:Sprite = getItemExtraSpeedSprite()    
        return new Item(this, itemSprite, pos, (player:Player) => {
            player.skills.speed += this.itemSettings.speedBoost
        })
    }
    
    spawnItemExtraFirePower(pos:Coord) : Item {
        let itemSprite:Sprite = getItemExtraFirePowerSprite()    
        return new Item(this, itemSprite, pos, (player:Player) => {
            player.skills.bombPower++
        })
    }
    
    spawnItemExtraLife(pos:Coord) : Item {
        let itemSprite:Sprite = getItemExtraLifeSprite()    
        return new Item(this, itemSprite, pos, (player:Player) => {
            player.skills.lives++
        })
    }
    
    spawnItemLessBomb(pos:Coord) : Item {
        let itemSprite:Sprite = getItemLessBombSprite()    
        return new Item(this, itemSprite, pos, (player:Player) => {
            if (player.skills.maxBombs > 1) {
                player.skills.maxBombs--
                if (player.state.bombs > player.skills.maxBombs)
                    player.state.bombs = player.skills.maxBombs
            }
                
        })
    }
    
    spawnItemLessSpeed(pos:Coord) : Item {
        let itemSprite:Sprite = getItemLessSpeedSprite()    
        return new Item(this, itemSprite, pos, (player:Player) => {
            player.skills.speed -= this.itemSettings.speedBoost
        })
    }
    
    spawnItemLessFirePower(pos:Coord) : Item {
        let itemSprite:Sprite = getItemLessFirePowerSprite()    
        return new Item(this, itemSprite, pos, (player:Player) => {
            if (player.skills.bombPower > this.itemSettings.minBombPower)
                player.skills.bombPower--
        })
    }
    
    spawnItemLessLife(pos:Coord) : Item {
        let itemSprite:Sprite = getItemLessLifeSprite()    
        return new Item(this, itemSprite, pos, (player:Player) => {
            player.takeLife()
        })
    }

    initItemChances() {
        let accumulatedChanceFactor:number = 0
        
        accumulatedChanceFactor += this.itemSettings.extraBombChance
        this.itemSpawnFuncs.push(pos => this.spawnItemExtraBomb(pos))
        this.itemChances.push(accumulatedChanceFactor)
        //
        accumulatedChanceFactor += this.itemSettings.extraSpeedChance
        this.itemSpawnFuncs.push(pos => this.spawnItemExtraSpeed(pos))
        this.itemChances.push(accumulatedChanceFactor)
        //
        accumulatedChanceFactor += this.itemSettings.extraFirePowerChance
        this.itemSpawnFuncs.push(pos => this.spawnItemExtraFirePower(pos))
        this.itemChances.push(accumulatedChanceFactor)
        //
        accumulatedChanceFactor += this.itemSettings.extraLifeChance
        this.itemSpawnFuncs.push(pos => this.spawnItemExtraLife(pos))
        this.itemChances.push(accumulatedChanceFactor)
        //
        accumulatedChanceFactor += this.itemSettings.lessBombChance
        this.itemSpawnFuncs.push(pos => this.spawnItemLessBomb(pos))
        this.itemChances.push(accumulatedChanceFactor)
        //
        accumulatedChanceFactor += this.itemSettings.lessSpeedChance
        this.itemSpawnFuncs.push(pos => this.spawnItemLessSpeed(pos))
        this.itemChances.push(accumulatedChanceFactor)
        //
        accumulatedChanceFactor += this.itemSettings.lessFirePowerChance
        this.itemSpawnFuncs.push(pos => this.spawnItemLessFirePower(pos))
        this.itemChances.push(accumulatedChanceFactor)
        //
        accumulatedChanceFactor += this.itemSettings.lessLifeChance
        this.itemSpawnFuncs.push(pos => this.spawnItemLessLife(pos))
        this.itemChances.push(accumulatedChanceFactor)

        this.totalChanceFactor = accumulatedChanceFactor
    }
    
}

