


var globalBunnies
function example2ParseSpriteSheet() {
    const app = new PIXI.Application({ backgroundColor: 0x1099bb })
    document.body.appendChild(app.view)


    // PIXI.BaseTexture.SCALE_MODE.DEFAULT = PIXI.BaseTexture.SCALE_MODE.NEAREST;

    

    const container = new PIXI.Container()
    app.stage.addChild(container)

    // const texture = PIXI.Texture.from('Assets/bunny.png')
    const allCharactersTexture = PIXI.Texture.from('isometricTRPGPack')


    debugLog("allCharactersTexture")
    debugLog(allCharactersTexture)

    try {
        var allCharactersTextureBase = PIXI.BaseTexture('Assets/IsometricTRPGAssetPack_Entities.png')
        debugLog("allCharactersTextureBase")
        debugLog(allCharactersTextureBase)
    } catch (e) {
        importantLog(e)
    }




    const bunnies = []
    globalBunnies = bunnies
    const bunnyCount = 25
    var bunnyNum = 0
    var bunnySpread = 70
    for (let i = 0; i < bunnyCount; i++) {
        const texture = new PIXI.Texture(
            allCharactersTexture, 
            getAnimationFrameRectangle(allCharactersTexture, 
                    4, 
                    33, 
                    randBetween(0, 4), 
                    randBetween(0, 33)
                    // 1, 0
                    )
            )
        const bunny = new PIXI.Sprite(texture)
        bunny.x = (i % 5) * bunnySpread
        bunny.y = Math.floor(i / 5) * bunnySpread
        bunny.anchor._x = 0.5 
        bunny.anchor._y = 0.5
        bunny.zIndex = 30- bunnyNum 
        // bunny.rotation = Math.random() * (Math.PI * 2)
        container.addChild(bunny)


        
        // bunny.anchor.setTo(0.5, 0.5)
        
        var scaleX = 20;
        var scaleY = 20;    
        bunny.scale.set(scaleX, scaleY);

        // var positionX = 100;
        // var positionY = 100;

        // bunny.x = positionX / scaleX;
        // bunny.y = positionY / scaleY;


        bunnies[bunnyNum++] = bunny
    }

    // const brt = new PIXI.BaseRenderTexture(300, 300, PIXI.SCALE_MODES.LINEAR, 1)
    // const rt = new PIXI.RenderTexture(brt)

    // const sprite = new PIXI.Sprite(rt)

    // sprite.x = 450
    // sprite.y = 60
    // app.stage.addChild(sprite)

    /*
     * All the bunnies are added to the container with the addChild method
     * when you do this, all the bunnies become children of the container, and when a container moves,
     * so do all its children.
     * This gives you a lot of flexibility and makes it easier to position elements on the screen
     */
    container.x = 100
    container.y = 60

    var speed = 20
    var controlingBunny = 0;
    app.ticker.add(() => {
        // bunnies[0].x += 0.1

        if(keyPressed('n'))
            controlingBunny = randBetween(0, bunnyCount)
        if(keyPressed('space')) {
            for (let i = 0; i < bunnyCount; i++) {
                bunnies[i].rotation += 0.1
                bunnies[i].x += (Math.random() - Math.random()) * 3
                bunnies[i].y += (Math.random() - Math.random()) * 3
            }
        }

        if(keyPressed('left')) {
            verboseLog("moving left")
            bunnies[controlingBunny].x -= speed
        }
        if(keyPressed('right')) {
            verboseLog("moving right")
            bunnies[controlingBunny].x += speed
        }
        if(keyPressed('up')) {
            verboseLog("moving up")
            bunnies[controlingBunny].y -= speed
        }
        if(keyPressed('down')) {
            verboseLog("moving down")
            bunnies[controlingBunny].y += speed
        }

        // app.renderer.render(container, rt)
    })
}
