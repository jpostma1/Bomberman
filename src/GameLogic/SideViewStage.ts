import { getTileHeight, getTileWidth } from "../Rendering/GetSpriteFunctions";
import { Sprite, Container } from "pixi.js";



export class SideViewStage {

    tileWidth: number;
    tileHeight: number;

    zIndexRowOffset: number = 10;
    playerZOffset: number = 3;
    bombZOffset: number = 2;
    itemZOffset: number = 1;

    container: Container;
    constructor(tileColumns: number, tileRows: number, tileWidth: number, tileHeight: number) {
        this.container = new Container();
        this.container.width = tileColumns * getTileWidth();
        this.container.height = tileRows * getTileHeight();

        this.tileWidth = tileWidth;
        this.tileHeight = tileHeight;
    }

    toScreenCoordX(x: number) {
        return x * this.tileWidth;
    }

    toScreenCoordY(y: number) {
        return y * this.tileHeight;
    }
    getTileZIndexFromY(y: number): number {
        return Math.floor(y) * this.zIndexRowOffset;
    }

    getPlayerZIndexFromY(y: number): number {
        return Math.floor(y) * this.zIndexRowOffset + this.playerZOffset;
    }

    getBombZIndexFromY(y: number): number {
        return Math.floor(y) * this.zIndexRowOffset + this.bombZOffset;
    }

    getItemZIndexFromY(y: number): number {
        return Math.floor(y) * this.zIndexRowOffset + this.itemZOffset;
    }

    addChild(child: Sprite) {
        this.container.addChild(child);
    }

    removeChild(child: Sprite) {
        this.container.removeChild(child);
    }
}
