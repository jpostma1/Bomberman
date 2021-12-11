



function loadAssets(onComplete) {
    const loader = PIXI.Loader.shared;

    // set texture sampling mode to NEAREST for Sharp Pixel Art rendering
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

    PIXI.settings.SORTABLE_CHILDREN = true


    loader.add('bunny', 'Assets/bunny.png')
    loader.add('isometricTRPGPack', 'Assets/IsometricTRPGAssetPack_Entities.png');
    loader.add('isometricTiles', 'Assets/Isometric_MedievalFantasy_Tiles.png');


    loader.load()
    loader.onComplete.add(onComplete)
}




function getAnimationFrameRectangle(texture, columns, rows, column, row) {
    var w = texture.width / columns
    var h = texture.height / rows

    return new PIXI.Rectangle(column*w, row*h, w, h)

}