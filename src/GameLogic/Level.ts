
import { getCrateSprite, getFloorSprite, getTileHeight, getTileWidth, getWallSprite } from "../Rendering/GetSpriteFunctions";
 
import { Sprite } from "pixi.js";
import { Coord } from "../Misc/HelperFunctions";
import { SideViewStage } from "./SideViewStage";


export class Level {
    
    tiles: Sprite[][] = []
    currentZIndex: number = 0

    
    stage:SideViewStage

    constructor(levelString:string[]) {
        this.stage = new SideViewStage(levelString.length, levelString[0].length, getTileWidth(), getTileHeight())
        this.setupTiles(levelString)

    }

    addChild(child:any) {
        this.stage.addChild(child)
    }

    removeCrate(pos: Coord) {
        // I want this to crash incase the tile doesn't exist, instead of a silient error
        let tile = this.tiles[pos.x][pos.y]
        if (tile != undefined) {
            tile.visible = false
        }
    }

    setupTiles(levelString:string[]) {
        for (let x = 0; x < levelString.length; x++) {
            this.tiles[x] = []
            for (let y = 0; y < levelString[x].length; y++) {
                switch (levelString[x][y]) {

                    case 'p':
                        this.newFloorTile(x, y)
                        this.newFloorTile(x, y+1)
                    break
                    case '.':
                        this.newFloorTile(x, y)
                    break

                    case 'c':
                        this.newTile(x, y, getCrateSprite())
                    break

                    case 'w':
                        this.newTile(x, y, getWallSprite())
                    break

                }
            }
        }
    }

    newFloorTile(x:number, y:number) {
        let floorTile = getFloorSprite()
        floorTile.alpha = 0.2
        this.newTile(x, y, floorTile)
    }

    newTile(x:number, y:number, tile:Sprite) {
        tile.x = x * getTileWidth()
        tile.y = y * getTileHeight()
        tile.zIndex = this.stage.getTileZIndexFromY(y)

        this.addChild(tile)
        this.tiles[x][y] = tile
    }
}