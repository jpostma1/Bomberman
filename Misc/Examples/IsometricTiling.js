


var examplePlayer
var examplePlayerManager
function example3IsometricTiling() {
    viewPortWidth = 500
    viewPortHeight = 500

    app = new PIXI.Application({
        width: viewPortWidth, 
        height: viewPortHeight,
        backgroundColor: 0x1099bb })
    document.body.appendChild(app.view)
    
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST

    // PIXI.BaseTexture.SCALE_MODE.DEFAULT = PIXI.BaseTexture.SCALE_MODE.NEAREST;

    // PIXI.settings.SCALE_MODE = PIXI.settings.SCALE_MODE.NEAREST
    

    const container = new PIXI.Container()
    app.stage.addChild(container)
    

    // const texture = PIXI.Texture.from('Assets/bunny.png')
    const allTilesTexture = PIXI.Texture.from('isometricTiles')


    debugLog("allTilesTexture")
    debugLog(allTilesTexture)


    const bunnies = []
    globalBunnies = bunnies
    const tileCount = 100
    var tileNum = 0
    // var bunnySpread = 70

    var sheetWidth = 11
    var sheetHeight = 10

    console.log("width s", allTilesTexture.width/sheetWidth)
    console.log("height s", allTilesTexture.width/sheetWidth)
    var scale = 3
    var tileWidth  = Math.floor((allTilesTexture.width /sheetWidth) *scale/2)
    var tileHeight = Math.floor((allTilesTexture.height/sheetHeight)*scale/2)

    var columns = 10

    const isoStage = new IsoStage(container, tileWidth, tileWidth, scale)

    for (let i = 0; i < tileCount; i++) {
        const tileType = Math.random()>0.15 ? {x: 1, y: 1 } : {x: 1, y: 0}
        const texture = new PIXI.Texture(
            allTilesTexture, 
            getAnimationFrameRectangle(allTilesTexture, 
                    sheetWidth, 
                    sheetHeight, 
                    // 0,2
                    // tileNum == 0 ? 1 : randSeedBetween(0, 4), 
                    // tileNum == 0 ? 1 : randSeedBetween(8, sheetHeight)
                    // tileNum == 0 ? 1 : randBetween(0, sheetWidth), 
                    // tileNum == 0 ? 1 : randBetween(4, 6)
                    tileType.x,
                    tileType.y
                    // 1, 0
                    )
            )
        const tile = new PIXI.Sprite(texture)
        var scaleX = scale;
        var scaleY = scale;    
        tile.scale.set(scaleX, scaleY);
        const x = (i % columns) 
        const y = Math.floor(i / columns)
        // tile.x = getIsometricX(tileWidth, tileWidth, x, y)
        // tile.y = getIsometricY(tileWidth, tileWidth, x, y)
        tile.x = isoStage.getIsometricX(x, y)
        tile.y = isoStage.getIsometricY(x, y)
        
        tile.anchor._x = 0.5 
        tile.anchor._y = 0.5
        tile.zIndex = tileCount-tileNum
        // app.stage.addChild(tile)
        container.addChild(tile)


        
        // tile.anchor.setTo(0.5, 0.5)
        

        // var positionX = 100;
        // var positionY = 100;

        // tile.x = positionX / scaleX;
        // tile.y = positionY / scaleY;


        bunnies[tileNum++] = tile
    }

    // const brt = new PIXI.BaseRenderTexture(300, 300, PIXI.SCALE_MODES.LINEAR, 1)
    // const rt = new PIXI.RenderTexture(brt)

    // const sprite = new PIXI.Sprite(rt)

    // sprite.x = 450
    // sprite.y = 60
    // app.stage.addChild(sprite)

    container.x = viewPortWidth/2
    container.y = viewPortHeight/2

    var controlingBunny = 0;

    var playerZIndex = 100
    // examplePlayer = spawnExamplePlayer(isoStage, 0, 0, playerZIndex);
    examplePlayerManager = spawnExamplePlayerManager(isoStage, sheetWidth, sheetHeight);

    app.ticker.add(() => {

        // examplePlayer.runMechanics()
        examplePlayerManager.runMechanics()

        if(keyPressed('space')) {
            controlingBunny = randBetween(0, bunnyCount)
            // for (let i = 0; i < bunnyCount; i++) {
            //     bunnies[i].rotation += 0.1
            //     bunnies[i].x += (Math.random() - Math.random()) * 3
            //     bunnies[i].y += (Math.random() - Math.random()) * 3
            // }
        }

        // if(keyPressed('left')) {
        //     verboseLog("moving left")
        //     bunnies[controlingBunny].x -= speed
        // }
        // if(keyPressed('right')) {
        //     verboseLog("moving right")
        //     bunnies[controlingBunny].x += speed
        // }
        // if(keyPressed('up')) {
        //     verboseLog("moving up")
        //     bunnies[controlingBunny].y -= speed
        // }
        // if(keyPressed('down')) {
        //     verboseLog("moving down")
        //     bunnies[controlingBunny].y += speed
        // }

        // app.renderer.render(container, rt)
    })
}

