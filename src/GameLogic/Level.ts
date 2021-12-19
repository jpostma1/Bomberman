
import { getCrateSprite, getFloorSprite, getTileHeight, getTileWidth, getWallSprite } from "../Rendering/DrawFunctions";
 
import { Sprite, Container } from "pixi.js";
import { Coord } from "../HelperFunctions";


export class SideViewStage {
    
    tileWidth: number
    tileHeight: number

    zIndexRowOffset:number = 10
    playerZOffset:number = 3
    bombZOffset:number = 2
    itemZOffset:number = 1

    container:Container 
    constructor(tileColumns:number, tileRows:number,  tileWidth:number, tileHeight:number) {
        this.container = new Container()
        this.container.width  = tileColumns * getTileWidth()
        this.container.height = tileRows * getTileHeight()

        this.tileWidth  = tileWidth
        this.tileHeight = tileHeight
    }

    toScreenCoordX(x:number) {
        return x * this.tileWidth
    }

    toScreenCoordY(y:number) {
        return y * this.tileHeight
    }
    getTileZIndexFromY(y: number): number {
        return Math.floor(y) * this.zIndexRowOffset
    }

    getPlayerZIndexFromY(y: number): number {
        return Math.floor(y) * this.zIndexRowOffset+this.playerZOffset
    }

    getBombZIndexFromY(y: number): number {
        return Math.floor(y) * this.zIndexRowOffset+this.bombZOffset
    }

    getItemZIndexFromY(y:number) : number {
        return Math.floor(y) * this.zIndexRowOffset+this.itemZOffset
    }

    addChild(child:Sprite) {
        this.container.addChild(child)
    }

    removeChild(child:Sprite) {
        this.container.removeChild(child)
    }
}

export class Level {
    
    tiles: Sprite[][]
    currentZIndex: number

    
    stage:SideViewStage

    constructor(levelString:string[]) {
        
        this.setupTiles(levelString)

    }

    addChild(child:any) {
        this.stage.addChild(child)
    }

    removeCrate(pos: Coord) {
        // I want this to crash incase the tile doesn't exist, instead of a silient error
        let tile = this.tiles[pos.x][pos.y]
        if (tile != undefined) {
            this.stage.removeChild(tile)
        }
    }

    setupTiles(levelString:string[]) {
        this.tiles = []
        this.currentZIndex = 0

        

        let tileColumns = levelString.length
        let tileRows    = levelString[0].length
        this.stage = new SideViewStage(tileColumns, tileRows, getTileWidth(), getTileHeight())

        for (let x = 0; x < levelString.length; x++) {
            this.tiles[x] = []
            for (let y = 0; y < levelString[x].length; y++) {
                switch (levelString[x][y]) {

                    case '.':
                        let floorTile = getFloorSprite()
                        floorTile.alpha = 0.2
                        this.newTile(x, y, floorTile)
                    break;

                    case 'c':
                        this.newTile(x, y, getCrateSprite())
                    break;

                    case 'w':
                        this.newTile(x, y, getWallSprite())
                    break;

                }
            }
        }
    }

    newTile(x:number, y:number, tile:Sprite) {
        tile.x = x * getTileWidth()
        tile.y = y * getTileHeight()
        tile.zIndex = this.stage.getTileZIndexFromY(y)

        this.addChild(tile)
        this.tiles[x][y] = tile
    }
}