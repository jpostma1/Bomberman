import { getAnimationFrameRectangle } from "../Rendering/LoadAssets"
import * as PIXI from 'pixi.js';

export class SideViewStage {
    
    tileWidth: number
    tileHeight: number

    zIndexRowOffset:number = 10
    playerZOffset:number = 1
    constructor(tileWidth:number, tileHeight:number) {
        this.tileWidth  = tileWidth
        this.tileHeight = tileHeight
    }

    toScreenCoordX(x:number) {
        return x * this.tileWidth
    }

    toScreenCoordY(y:number) {
        return y * this.tileHeight
    }

    getZIndexFromY(y: number): number {
        return Math.floor(y)*this.zIndexRowOffset+this.playerZOffset
    }
}

export class Level {
    tiles: PIXI.Sprite[][]
    currentZIndex: number

    container:PIXI.Container
    stage:SideViewStage

    constructor(levelString:string[]) {
        
        this.setupTiles(levelString)

    }

    addChild(child:any) {
        this.container.addChild(child)
    }

    setupTiles(levelString:string[]) {
        this.container = new PIXI.Container()
        this.tiles = []
        this.currentZIndex = 0

        // hardcoded tile sheet info
        const allTilesTexture = PIXI.BaseTexture.from('tilesFromSide')
        let sheetWidth = 7
        let sheetHeight = 1

        let scale = 1/2
        let tileWidth  = Math.floor((allTilesTexture.width /sheetWidth) *scale)
        let tileHeight = Math.floor((allTilesTexture.height/sheetHeight)*scale/2)

        this.stage = new SideViewStage(tileWidth, tileHeight)

        let tileColumns = levelString.length
        let tileRows    = levelString[0].length

        this.container.width  = tileColumns * tileWidth
        this.container.height = tileRows * tileHeight

        let texture;
        for(let x = 0; x < levelString.length; x++) {
            this.tiles[x] = []
            for(let y = 0; y < levelString[x].length; y++) {
                switch(levelString[x][y]) {

                    case '.':
                        // texture = new PIXI.Texture(
                        //     allTilesTexture, 
                        //     getAnimationFrameRectangle(allTilesTexture, 
                        //             sheetWidth, 
                        //             sheetHeight, 
                        //             //tile column
                        //             0,
                        //             //tile row
                        //             0
                        //             )
                        //     )
                        texture = undefined
                    break;
                    case 'c':
                        texture = new PIXI.Texture(
                            allTilesTexture, 
                            getAnimationFrameRectangle(allTilesTexture, 
                                    sheetWidth, 
                                    sheetHeight, 
                                    //tile column
                                    2,
                                    //tile row
                                    0
                                    )
                            )
                    break;
                    case 'w':
                        texture = new PIXI.Texture(
                            allTilesTexture, 
                            getAnimationFrameRectangle(allTilesTexture, 
                                    sheetWidth, 
                                    sheetHeight, 
                                    //tile column
                                    4,
                                    //tile row
                                    0
                                    )
                            )
                    break;

                }
                
                this.newTile(x, y, tileWidth, tileHeight,  y*this.stage.zIndexRowOffset, scale, texture)
            }
        }

    }

    newTile(x:number, y:number, tileWidth:number, tileHeight:number, zIndex:number, scale:number, texture?:PIXI.Texture) {
        
        const tile = new PIXI.Sprite(texture)
        tile.scale.set(scale, scale);
        tile.x = x * tileWidth
        tile.y = y * tileHeight
        
        // tile.anchor._x = 0.5 
        // tile.anchor._y = 0.5
        tile.zIndex = zIndex
        this.addChild(tile)
        this.tiles[x][y] = tile
    }
}