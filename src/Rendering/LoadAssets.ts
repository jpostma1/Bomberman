import { BaseTexture, Loader, Rectangle, SCALE_MODES, settings } from "pixi.js";


export function loadAssets(onComplete:any) {
    const loader = Loader.shared;

    // set texture sampling mode to NEAREST for Sharp Pixel Art rendering
    settings.SCALE_MODE = SCALE_MODES.NEAREST

    // enable depth testing
    settings.SORTABLE_CHILDREN = true


    loader.add("tileSheet", "Assets/tilesFromSide.png")
    loader.add("playerSheet", "Assets/IsometricTRPGAssetPack_Entities.png");
    loader.add("bombSheet", "Assets/sample_bombtextures.png")
    loader.add('explosionSheetFromJSON', 'Assets/mc.json')
    loader.add("itemSheet", "Assets/Items.png")


    loader.load()
    loader.onComplete.add(onComplete)
}




export function getAnimationFrameRectangle(texture:BaseTexture, columns:number, rows:number, column:number, row:number):Rectangle {
    var w = texture.width / columns
    var h = texture.height / rows

    return new Rectangle(column*w, row*h, w, h)

}