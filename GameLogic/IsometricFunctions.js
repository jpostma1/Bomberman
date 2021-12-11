









function convertToIsometricDirectionName(movementString) {
    switch (movementString) {
        case "left":
            return "leftup"
        break;
        case "right":
            return "rightdown"
        break;
        case "up":
            return "rightup"
        break;
        case "down":
            return "leftdown"
        break;


        case "leftdown":
            return "left"
        break;
        case "rightup":
            return "right"
        break;
        case "leftup":
            return "up"
        break;
        case "rightdown":
            return "down"
        break;


    }
}

function getIsometricX(tileWidth, tileHeight, x, y) {
    return x * tileWidth - y * tileHeight
}

function getIsometricY(tileWidth, tileHeight, x, y) {
    return x * -tileWidth/2 - y * tileHeight/2
}


class IsoStage {
    constructor(stage, tileWidth, tileHeight, scale) {
        this.stage = stage
        this.tileWidth = tileWidth
        this.tileHeight = tileHeight
        this.scale = scale

        debugLog("IsoStage initialized")
        debugLog(this.stage)
    }

    addChild(child) {
        debugLog("adding child to IsoStage:")
        debugLog(child)
        this.stage.addChild(child)
    }

    getIsometricX(x, y) {
        return getIsometricX(this.tileWidth, this.tileHeight, x, y)
    }

    getIsometricY(x, y) {
        return getIsometricY(this.tileWidth, this.tileHeight, x, y)
    }
}