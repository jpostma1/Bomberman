


var examplePlayer
var examplePlayerManager
function exampleIsometricWithSideView() {
    viewPortWidth = 500
    viewPortHeight = 500

    app = new PIXI.Application({
        width: viewPortWidth, 
        height: viewPortHeight,
        backgroundColor: 0x1099bb })
    document.body.appendChild(app.view)
    
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST
    

    const container = new PIXI.Container()
    app.stage.addChild(container)
    

    const allTilesTexture = PIXI.Texture.from('tilesFromSide')


    debugLog("allTilesTexture")
    debugLog(allTilesTexture)


    const bunnies = []
    globalBunnies = bunnies
    const tileCount = 100
    var tileNum = 0

    var sheetWidth = 7
    var sheetHeight = 1

    var scale = 1
    var tileWidth  = Math.floor((allTilesTexture.width /sheetWidth) *scale)
    var tileHeight = Math.floor((allTilesTexture.height/sheetHeight)*scale/2)

    var columns = 10

    for (let i = 0; i < tileCount; i++) {
        const tileSheetX = randSeedBetween(1,3)*2
        const tileType = {x: tileSheetX, y: 0 }
        const texture = new PIXI.Texture(
            allTilesTexture, 
            getAnimationFrameRectangle(allTilesTexture, 
                    sheetWidth, 
                    sheetHeight, 

                    tileType.x,
                    tileType.y

                    )
            )
        const tile = new PIXI.Sprite(texture)
        var scaleX = scale;
        var scaleY = scale;    
        tile.scale.set(scaleX, scaleY);
        const x = (i % columns) 
        const y = Math.floor(i / columns)

        tile.x = x*tileWidth
        tile.y = y*tileHeight
        tile.zIndex = tileNum

        container.addChild(tile)

        bunnies[tileNum++] = tile
    }

    var controlingBunny = 0;
    var playerZIndex = 100

}

