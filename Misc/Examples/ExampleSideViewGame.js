



var exampleGame
let viewPortWidth = 1000
// let viewPortHeight = 1000
function exampleSideViewGame(lvlString) {
    

    app = new PIXI.Application({
        width: viewPortWidth, 
        height: viewPortWidth*window.innerHeight/window.innerWidth,
        backgroundColor: 0x1099bb,
        antialias: false })
    document.body.appendChild(app.view)
    


    exampleGame = new ExampleSideViewGame(app, lvlString);

    let frames = 0
    let last60frames = performance.now()
    app.ticker.add((deltaFrames) => {
        exampleGame.runMechanics(deltaFrames)

        frames++
        if(frames == 60) {
            frames = 0
            console.warn(performance.now() - last60frames)
            last60frames = performance.now()
        }

        if (keyPressed("esc")) {
            app.ticker.stop()
            console.warn("ticker stopped!")
        }
    })
}


class ExamplePlayer {

    constructor(lvlStage, x, y, zIndex = 0, speed = 1) {
        this.x = x
        this.y = y
        if (!isNumber(this.x)) {
            logError("ExamplePlayer: x is not a number:")
            logError(this.x)
        }
        if (!isNumber(this.y)) {
            logError("ExamplePlayer: y is not a number:")
            logError(this.y)
        }

        // TODO: make configurable dependent
        this.keyLeft   = 'left'
        this.keyRight  = 'right'
        this.keyUp     = 'up'
        this.keyDown   = 'down'

        this.speed = speed

        // These values can be 'unset' instead of using a seperate boolean for each I've used undefined to check if they are set. 
        this.targetTile = undefined
        this.movingDirection = undefined
        this.secondaryMovingDirection = undefined
        this.tabuDirection = undefined


        this.lvlStage = lvlStage

        this.updateCurrentTile()
        this.setupSprite(zIndex)
    }

    setupSprite(zIndex) {
        // hardcoded tile sheet info
        const allTilesTexture = PIXI.Texture.from('tilesFromSide')
        var sheetWidth = 7
        var sheetHeight = 1
        // ===========  ==============
        const targetSpriteTexture = new PIXI.Texture(allTilesTexture,
                    getAnimationFrameRectangle(allTilesTexture, 
                        sheetWidth, 
                        sheetHeight*2, 
                        //tile column
                        1,
                        //tile row
                        0
                        ))
        this.targetSprite = new PIXI.Sprite(targetSpriteTexture)
        this.targetSprite.scale.set(0.5,0.5)
        // =========================



        const texture = new PIXI.Texture(allTilesTexture,
                    getAnimationFrameRectangle(allTilesTexture, 
                        sheetWidth, 
                        sheetHeight*2, 
                        //tile column
                        4,
                        //tile row
                        0
                        ))
        // const texture = PIXI.Texture.from('bunny')
        this.sprite = new PIXI.Sprite(texture)


        this.sprite.scale.set(0.5,0.5)
        // this.sprite.scale.set(1,0.65)



        this.sprite.zIndex = zIndex
    }

    setX(x) {
        this.x = x
    }
    setY(y) {
        this.y = y
    }

    moveX(x) {
        this.x +=  x
    }
    moveY(y) {
        this.y += y
    }

    moveToTargetTile() {
        if (this.targetTile.x != this.x) {
            if (Math.abs(this.x - this.targetTile.x) < this.speed) {
                this.setX(this.targetTile.x)
                this.targetTile = undefined
            } else {
                this.moveX(Math.sign(this.targetTile.x - this.x)*this.speed)
            }
        } else if (this.targetTile.y != this.y) {
            if (Math.abs(this.y - this.targetTile.y) < this.speed*yDistortion) {
                this.setY(this.targetTile.y)
                this.targetTile = undefined
            } else {
                this.moveY(Math.sign(this.targetTile.y - this.y)*this.speed*yDistortion)
            }
        } else 
            this.targetTile = undefined
        
    }



    updateSpritePos() {
        this.sprite.x = this.lvlStage.toScreenCoordX(this.x)
        this.sprite.y = this.lvlStage.toScreenCoordY(this.y)
        this.sprite.zIndex = Math.floor(this.y)*zIndexRowOffset+1
        this.targetSprite.zIndex = this.sprite.zIndex-1

        if(this.targetTile != undefined) {
            this.targetSprite.x = this.lvlStage.toScreenCoordX(this.targetTile.x)
            this.targetSprite.y = this.lvlStage.toScreenCoordY(this.targetTile.y)
        } else {
            this.targetSprite.x = -100000
            this.targetSprite.y = -100000
        }

    }

    fourDirectionMovement() {

        if (keyPressed(this.keyLeft)) {

            if (this.movingDirection == undefined) 
                this.movingDirection = leftDir
            else if (this.movingDirection != leftDir)
                this.secondaryMovingDirection = leftDir

        } else {
            this.maybeResetMovingDirection(leftDir)
        }

        if (keyPressed(this.keyRight)) {

            if (this.movingDirection == undefined) 
                this.movingDirection = rightDir
            else if (this.movingDirection != rightDir)
                this.secondaryMovingDirection = rightDir

        } else {
            this.maybeResetMovingDirection(rightDir)
        }

        if (keyPressed(this.keyDown)) {
            
            if (this.movingDirection == undefined) 
                this.movingDirection = upDir
            else if (this.movingDirection != upDir)
                this.secondaryMovingDirection = upDir

        } else {
            this.maybeResetMovingDirection(upDir)
        }

        if (keyPressed(this.keyUp)) {
            
            if (this.movingDirection == undefined) 
                this.movingDirection = downDir
            else if (this.movingDirection != downDir)
                this.secondaryMovingDirection = downDir

        } else {
            this.maybeResetMovingDirection(downDir)
        }

    }


    pathFreeInDir(collidesFunc, direction) {

        if(direction != undefined) {

            let potentialTargetTile = addCoord(direction, this.currentTile)
            if (!collidesFunc(potentialTargetTile)) {

                if (this.alingedWith(potentialTargetTile)) {
                    return potentialTargetTile
                } else if(this.targetTile != undefined) {
                    
                    let secondaryCornerTile = addCoord(direction, this.targetTile)
                    if (collidesFunc(secondaryCornerTile)) {
                        // move backwards to prevent sticking to corner
                        return this.currentTile
                    }
                }
            }
        }

        return undefined
    }

    calcTargetTile(collidesFunc) {
        this.updateCurrentTile()

        if (this.movingDirection != undefined) {

            if (this.tabuDirection != this.secondaryMovingDirection) {
            
                let newTargetTile = this.pathFreeInDir(collidesFunc, this.secondaryMovingDirection)
                if (newTargetTile != undefined) {
                    this.targetTile = newTargetTile
                    this.setTabuSecondaryDirection()
                    return
                }
            }

            let potentialTargetTile = this.pathFreeInDir(collidesFunc, this.movingDirection)
            if (potentialTargetTile != undefined) {
                this.targetTile = potentialTargetTile
            } 
        }
    }

    alingedWith(tile) {
        return Math.abs(this.x - tile.x) < this.speed || Math.abs(this.y - tile.y) < this.speed * yDistortion
    }

    updateCurrentTile() {
        this.currentTile = { x:Math.round(this.x), y:Math.round(this.y) }
    }

    resetMovingDirection() {
        this.movingDirection = this.secondaryMovingDirection
        this.secondaryMovingDirection = undefined
        this.tabuDirection = undefined
    }

    maybeResetMovingDirection(direction) {
        if (this.movingDirection == direction)

            this.resetMovingDirection()

        else if (this.secondaryMovingDirection == direction) {
            this.secondaryMovingDirection = undefined
            this.tabuDirection = undefined
        }
        
    }

    setTabuSecondaryDirection() {
        let temp = this.secondaryMovingDirection
        this.secondaryMovingDirection = this.movingDirection
        this.movingDirection = temp
        this.tabuDirection = this.secondaryMovingDirection
    }
}

let yDistortion = 2
let standardPlayerSpeed = 0.05 
// let standardPlayerSpeed = 0.1
class ExampleSideViewGame {

    constructor(app, levelString) {
        this.tileColumns = levelString.length
        this.tileRows = levelString[0].length

        console.log(this.tileColumns, this.tileRows)

        this.level = new ExampleSideViewLevel(levelString)
        app.stage.addChild(this.level.container)
        this.player = new ExamplePlayer(this.level.stage, this.tileColumns/2, this.tileRows/2, 10000, standardPlayerSpeed)
        console.log('player', this.player.sprite)
        this.level.addChild(this.player.sprite)
        // ===== debug =========
        this.level.addChild(this.player.targetSprite)
        // ===== debug =========

        this.setupCollisionMap(levelString)

        this.initializeVars()
    }

    initializeVars () {
        this.unaccountedDeltaTime = 0
    }

    setupCollisionMap(levelString) {
        this.collisionMap = new CollisionMap(this.tileColumns, this.tileRows)
        for(var x = 0; x < levelString.length; x++) {
            for(var y = 0; y < levelString[x].length; y++) {
                switch(levelString[x][y]) {

                    case '.':
                        this.collisionMap.setValue(x, y, 0)
                    break;

                    case 'c':
                        this.collisionMap.setValue(x, y, 1)
                    break;

                    case 'C':
                        this.collisionMap.setValue(x, y, 2)
                    break;

                    case 'w':
                        this.collisionMap.setValue(x, y, 5)
                    break;
                }
            }
        }
    }

    runMechanics(newDelta) {
        this.player.fourDirectionMovement()
        // to pass a member function requires a lambda, otherwise 'this' isn't bound correctly 
        this.player.calcTargetTile((pos) => this.collides(pos))

        // if(this.player.targetTile && this.collides(this.player.targetTile) != 0)
        //     this.player.targetTile = undefined


        let currentDelta = this.unaccountedDeltaTime+newDelta

        for(var i = 0; i < currentDelta; i++)
            this.checkPlayerCollision(this.player)

        this.unaccountedDeltaTime = getFraction(currentDelta)
            
        this.readyForRender()
    }

    readyForRender() {
        this.player.updateSpritePos()
    }

    collides(cornerPlusSpeedOffset) {
        var tileValue = this.collisionMap.checkValue(cornerPlusSpeedOffset.x, cornerPlusSpeedOffset.y)
        if (tileValue > 0)
            return true

        return false
    }


    checkPlayerCollision(player) {

        // if (player.moving == "left") {
        //     player.x -= player.speed
        // } else if (player.moving == "right") {
        //     player.x += player.speed
        // } else if (player.moving == "down") {
        //     player.y += player.speed
        // } else if (player.moving == "up") {
        //     player.y -= player.speed
        // } 

        if (player.targetTile != undefined) {
            player.moveToTargetTile()
        }

        this.keepPlayerInLevel(player)
    }


    keepPlayerInLevel(player) {
        var tileMarge = 1
        if (player.x + tileMarge >= this.tileColumns)
            player.x = this.tileColumns - tileMarge
        if (player.x - tileMarge <= 0)
            player.x = 0 + tileMarge

        if (player.y + tileMarge >= this.tileRows)
            player.y = this.tileRows - tileMarge
        if (player.y - tileMarge <= 0)
            player.y = 0 + tileMarge
    }
}

class SideViewStage {
    constructor(tileWidth, tileHeight) {
        this.tileWidth  = tileWidth
        this.tileHeight = tileHeight
    }

    toScreenCoordX(x) {
        return x * this.tileWidth
    }

    toScreenCoordY(y) {
        return y * this.tileHeight
    }
}
let zIndexRowOffset = 10
class ExampleSideViewLevel {
    constructor(levelString) {
        
        this.setupTiles(levelString)

    }

    addChild(child) {
        this.container.addChild(child)
    }

    setupTiles(levelString) {
        this.container = new PIXI.Container()
        // this.container.x = viewPortWidth/2
        // this.container.y = viewPortHeight/2
        this.tiles = []
        this.currentZIndex = 0

        // hardcoded tile sheet info
        const allTilesTexture = PIXI.Texture.from('tilesFromSide')
        var sheetWidth = 7
        var sheetHeight = 1

        var scale = 1/2
        var tileWidth  = Math.floor((allTilesTexture.width /sheetWidth) *scale)
        var tileHeight = Math.floor((allTilesTexture.height/sheetHeight)*scale/2)

        this.stage = new SideViewStage(tileWidth, tileHeight)

        let tileColumns = levelString.length

        let tileRows    = levelString[0].length
        let texture;

        this.container.width  = tileColumns * tileWidth
        this.container.height = tileRows * tileHeight

        for(var x = 0; x < levelString.length; x++) {
            this.tiles[x] = []
            for(var y = 0; y < levelString[x].length; y++) {
                // const tileType = Math.random()>0.15 ? {x: 1, y: 1 } : {x: 1, y: 0}
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
                // if (texture != undefined)
                    this.newTile(texture, x, y, tileWidth, tileHeight,  y*zIndexRowOffset, scale)
            }
        }

    }

    newTile(texture, x, y, tileWidth, tileHeight, zIndex, scale) {
        
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

function closerToCenter(coord1, coord2) {
    let fraction1 = { x:getFraction(coord1.x), y: getFraction(coord1.y) }
    let fraction2 = { x:getFraction(coord2.x), y: getFraction(coord2.y) }
    return magnitude(subtractCoord(centerCoord, fraction1)) < magnitude(subtractCoord(centerCoord, fraction2))
}

function isCenteredFromRight(x, speed) {
    let fractional = getFraction(x)
    return center - fractional <= speed
}

function isCenteredFromLeft(x, speed) {
    let fractional = getFraction(x)
    return fractional - center <= speed
}

function isCenteredFromUp(y, speed) {
    let fractional = getFraction(y)
    return center - fractional <= speed
}

function isCenteredFromDown(y, speed) {
    let fractional = getFraction(y)
    return fractional - center <= speed
}

