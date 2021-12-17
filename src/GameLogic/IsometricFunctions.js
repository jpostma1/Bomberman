









function convertToIsometricDirectionName(movementString) {
    switch (movementString) {
        case "snapToNearestFreeTile":
            return "snapToNearestFreeTile"
        case "left":

            return "leftup"
        case "right":

            return "rightdown"
        case "up":

            return "rightup"

        case "down":
            return "leftdown"

        case "leftdown":
            return "left"

        case "rightup":
            return "right"

        case "leftup":
            return "up"

        case "rightdown":
            return "down"

        case "":
            return ""

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