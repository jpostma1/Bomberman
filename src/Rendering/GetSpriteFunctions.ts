

import { AnimatedSprite, BaseTexture, Sprite, Texture } from 'pixi.js';

import { getAnimationFrameRectangle } from "./LoadAssets"

export function getCrateSprite():Sprite {
    return getTileSprite(2, 0)
}

export function getWallSprite():Sprite {
    return getTileSprite(4, 0)
}

export function getFloorSprite():Sprite {
    let sprite = getTileSprite(0, 0, true)
    sprite.anchor.y = -1
    return sprite
}

export function getFloorTexture():Texture {
    const allTilesTexture:BaseTexture = BaseTexture.from('tileSheet')
    let sheetWidth = 7
    let sheetHeight = 1

    let scale = 1/2

    let tileColumn = 0
    let tileRow = 0
    let getHalveTile:boolean = true

    return new Texture(allTilesTexture,
        getAnimationFrameRectangle(allTilesTexture, 
            sheetWidth, 
            getHalveTile ? sheetHeight * 2 : sheetHeight, 
            tileColumn,
            tileRow
            ))
}

export function getBombSprite() : Sprite {
    // hardcoded tile sheet info
    const textureSheet:BaseTexture = BaseTexture.from('bombSheet')
    let sheetWidth = 4
    let sheetHeight = 1

    let scale = 1/2

    const texture = new Texture(textureSheet,
        getAnimationFrameRectangle(textureSheet, 
            sheetWidth, 
            sheetHeight, 
            2,
            0
            ))
    const sprite = new Sprite(texture)
    sprite.scale.set(scale, scale)
    sprite.anchor._y = 0.25


    return sprite
}


export function getTileSprite(tileColumn:number, tileRow:number, getHalveTile:boolean = false) : Sprite {
    const allTilesTexture:BaseTexture = BaseTexture.from('tileSheet')
    let sheetWidth = 7
    let sheetHeight = 1

    let scale = 1/2

    const texture = new Texture(allTilesTexture,
        getAnimationFrameRectangle(allTilesTexture, 
            sheetWidth, 
            getHalveTile ? sheetHeight * 2 : sheetHeight, 
            tileColumn,
            tileRow
            ))
    const sprite = new Sprite(texture)
    sprite.scale.set(scale, scale)
    
    return sprite
}

let tileHeight:number
let tileWidth:number
export function getTileHeight():number {
    if (tileHeight)
        return tileHeight
    
    initializeTileDimensions()
    
    return tileHeight
}

export function getTileWidth():number {
    if (tileWidth)
        return tileWidth
    
    initializeTileDimensions()

    return tileWidth
}

function initializeTileDimensions() {
    const allTilesTexture:BaseTexture = BaseTexture.from('tileSheet')
    let sheetWidth = 7
    let sheetHeight = 1
    let scale = 1 / 2

    
    tileWidth  = Math.floor((allTilesTexture.width /sheetWidth)  *scale)
    // NOTE: tileHeight is devided by 2, for the 'isometric' view
    tileHeight = Math.floor((allTilesTexture.height/sheetHeight) *scale/2)
}


export function getPlayerSprite(column:number, row:number) : Sprite {
    const playerTextureSheet:BaseTexture = BaseTexture.from('playerSheet')
    let sheetWidth = 4
    let sheetHeight = 33

    

    const texture = new Texture(playerTextureSheet,
        getAnimationFrameRectangle(playerTextureSheet, 
            sheetWidth, 
            sheetHeight, 
            column,
            row
            ))
    const sprite = new Sprite(texture)
    let scale = 3
    sprite.scale.set(scale, scale)
    sprite.anchor._x = 0.25
    sprite.anchor._y = 0.25

    return sprite
}






export function getExplosion() : AnimatedSprite {
    
    const explosionTextures = [];
    for (let i = 0; i < 20; i++) {
        const texture = Texture.from(`Explosion_Sequence_A ${i + 1}.png`);
        explosionTextures.push(texture);
    }

    let animatedSprite = new AnimatedSprite(explosionTextures)
    let scale = 2 * getTileHeight() / animatedSprite.height
    animatedSprite.scale.set(scale, scale)

    return animatedSprite
}


export function getItemSprite(itemColumn:number, itemRow:number) : Sprite {
    const allItemsTexture:BaseTexture = BaseTexture.from('itemSheet')
    let sheetWidth = 3
    let sheetHeight = 5

    const texture = new Texture(allItemsTexture,
        getAnimationFrameRectangle(allItemsTexture, 
            sheetWidth, 
            sheetHeight, 
            itemColumn,
            itemRow
            ))
    const sprite = new Sprite(texture)
    let scale = getTileHeight() / sprite.height * 1.5
    sprite.scale.set(scale, scale)

    return sprite
}

export function getItemExtraBombSprite() {
    return getItemSprite(0, 0)
}      
export function getItemExtraSpeedSprite() {
    return getItemSprite(0, 4)
}     
export function getItemExtraFirePowerSprite() {
    return getItemSprite(2, 1)
} 
export function getItemExtraLifeSprite() {
    return getItemSprite(0, 2)
}      

export function getItemLessBombSprite() {
    return getItemSprite(1, 0)
}       
export function getItemLessSpeedSprite() {
    return getItemSprite(1, 4)
}      
export function getItemLessFirePowerSprite() {
    return getItemSprite(1, 1)
}  
export function getItemLessLifeSprite() {
    return getItemSprite(1, 3)
}       