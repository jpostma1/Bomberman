import * as PIXI from 'pixi.js';



export function loadAssets(onComplete:any) {
    // const loader = PIXI.loader;
    const loader = PIXI.Loader.shared;

    // set texture sampling mode to NEAREST for Sharp Pixel Art rendering
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

    // enable depth testing
    PIXI.settings.SORTABLE_CHILDREN = true


    loader.add('bunny', 'Assets/bunny.png')
    loader.add('tilesFromSide', 'Assets/tilesFromSide.png')
    loader.add('isometricTRPGPack', 'Assets/IsometricTRPGAssetPack_Entities.png');
    loader.add('isometricTiles', 'Assets/Isometric_MedievalFantasy_Tiles.png');

    console.log("loadAssets log 21:26")

    loader.load()
    loader.onComplete.add(onComplete)
}




export function getAnimationFrameRectangle(texture:PIXI.BaseTexture, columns:number, rows:number, column:number, row:number):PIXI.Rectangle {
    var w = texture.width / columns
    var h = texture.height / rows

    return new PIXI.Rectangle(column*w, row*h, w, h)

}