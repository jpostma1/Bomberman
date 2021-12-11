



function spawnExamplePlayer(lvlStage, x, y, zIndex = 0, speed = 0.1) {
    return new ExamplePlayer(lvlStage, x, y, zIndex, speed)
}

function spawnExamplePlayerManager(lvlStage, tileWidth, tileHeight) {
    return new ExamplePlayerManager(lvlStage, tileWidth, tileHeight)
}



class ExamplePlayer {

    constructor(lvlStage, x, y, zIndex = 0, speed = 1) {

        this.x = x
        this.y = y
        if(!isNumber(this.x)) {
            logError("ExamplePlayer: x is not a number:")
            logError(this.x)
        }
        if(!isNumber(this.y)) {
            logError("ExamplePlayer: y is not a number:")
            logError(this.y)
        }

        const texture = PIXI.Texture.from('Assets/bunny.png')    
        this.speed = speed
        this.sprite = new PIXI.Sprite(texture)
        
        this.sprite.zIndex = zIndex

        this.lvlStage = lvlStage
        this.lvlStage.addChild(this.sprite)
    }


    updateIsometricPos() {
        this.sprite.x = this.lvlStage.getIsometricX(this.x, this.y)
        this.sprite.y = this.lvlStage.getIsometricY(this.x, this.y)
    }

    runMechanics() {

        // this.clunckyMovement()
        this.movement()

        this.updateIsometricPos()
    }

    movement() {
        if(keyPressed('left')) {
            // verboseLog("moving left")
            this.x -= this.speed
        }
        if(keyPressed('right')) {
            // verboseLog("moving right")
            this.x += this.speed
        }
        if(keyPressed('up')) {
            // verboseLog("moving up")
            this.y += this.speed
        }
        if(keyPressed('down')) {
            // verboseLog("moving down")
            this.y -= this.speed
        }
    }

    clunckyMovement() {
        if(keyPressed('left')) {
            // verboseLog("moving left")
            this.x -= this.speed
        }
        if(keyPressed('right')) {
            // verboseLog("moving right")
            this.x += this.speed
        }
        if(keyPressed('up')) {
            // verboseLog("moving up")
            this.y += this.speed
        }
        if(keyPressed('down')) {
            // verboseLog("moving down")
            this.y -= this.speed
        }
    }
}


class ExamplePlayerManager {

    constructor(lvlStage, tileColumns = 10, tileRows = 10) {

        this.lvlStage = lvlStage
        this.tileColumns = tileColumns
        this.tileRows = tileRows

        this.player = new ExamplePlayer(lvlStage, tileColumns/2, tileRows/2, 100, 0.1)

        this.collisionMap = new ExampleCollisionMap(tileColumns, tileRows)
        this.collisionMap.setValue(3,3,1)
        this.collisionMap.setValue(6,3,1)
    }

    runMechanics() {

        // print when player is on a collision tile
        this.player.runMechanics()

        this.checkPlayerCollision(this.player)
        this.player.updateIsometricPos()
    }

    checkPlayerCollision(player) {
        var x = Math.round(player.x)
        var y = Math.round(player.y)
            
        var tileValue = this.collisionMap.checkValue(x, y)
        if (tileValue > 0) {
            debugLog("player is on colliding tile: " +tileValue)
        } else if(!isNumber(tileValue))
            importantLog(tileValue)

        this.keepPlayerInLevel(player)
    }

    keepPlayerInLevel(player) {
        var tileMarge = 1
        if(player.x + tileMarge >= this.tileColumns)
            player.x = this.tileColumns - tileMarge
        if(player.x - tileMarge <= 0)
            player.x = 0 + tileMarge

        if(player.y + tileMarge >= this.tileRows)
            player.y = this.tileRows - tileMarge
        if(player.y - tileMarge <= 0)
            player.y = 0 + tileMarge
    }
}


class ExampleCollisionMap {

    constructor(width, height) {
        this.width = width
        this.height = height
        this.initMap()

    }

    initMap () {
        this.collisionMap = []
        for(var x = 0; x < this.width; x++) {
            this.collisionMap[x] = [] 
            for(var y = 0; y < this.height; y++) {
                this.collisionMap[x][y] = 0
            }
        }
    }

    setCoord(coord, value) {
        this.collisionMap[coord.x][coord.y] = value
    }

    setValue(x, y, value) {
        this.collisionMap[x][y] = value
    }

    checkValue(x, y) {
        return this.collisionMap[x][y]
    }
    setCoord(coord) {
        return this.collisionMap[coord.x][coord.y]
    }
}