





let adjacentTiles = [
        {x:  0, y: -1},
        {x: -1, y: 0},
        {x:  1, y: 0},        
        {x:  0, y: 1},
    ]

class ClaimedTerritory {

    constructor(width, height) {
        this.width = width
        this.height = height


        this.territory = new CollisionMap(width, height)
        this.visited   = new CollisionMap(width, height)
        this.currentlyVisitedNum = 1
    }


    outlineMakesNewClosedTerritory(pos, id) {
        let nonFriendlyTilesAroundPos = this.getOtherTilesAround(pos, id)

        // IMPORTANT: spots in 'visited' will be set to 'currentlyVisitedNum' when visited.
        // using this var we don't have to clear the collisionMap inbetween outline-scans
        this.currentlyVisitedNum++
        let fillingSeeds = []
        for(var i = 0; i < nonFriendlyTilesAroundPos.length; i++) { 
            let otherPos = addCoord(nonFriendlyTilesAroundPos[i], pos)
            if (!this.isVisited(otherPos)) {
                // -4 stands for netto 4 inward corers, this a closed territory
                if (this.cornersTakenInRoundTrip(pos, otherPos, id) == -4) {
                    fillingSeeds.push(otherPos)
                    break;
                }
            }
        }

        forAll(fillingSeeds, (pos) => this.fillClosedTerritory(pos, id))
    }

    cornersTakenInRoundTrip(ownTile, otherTile, id) {
        let cornersTaken = 0

        let direction = getStartingDirection(ownTile, otherTile)
        let startingCorner = this.scanAlongSide(otherTile, direction, id)
        let currentCorner = this.scanAlongSide(startingCorner.pos, new ScanAroundTeritorryDirection(
                startingCorner.scanDirection.movingDirection, 
                startingCorner.scanDirection.edgeDirection), id)

        let corners = currentCorner.cornerType
        var scanCount = 1
        // keep track of visited corner
        while(!_.isEqual(currentCorner, startingCorner)) {
            this.setVisited(currentCorner.pos)
            currentCorner = this.scanAlongSide(currentCorner.pos, currentCorner.scanDirection, id)          
            corners += currentCorner.cornerType
        }

        return corners
    }



    scanAlongSide(pos, direction, id) {
        // keep traveling in 'direction' until a corner is reached

        let freePosPlusMoveDir = addCoord(pos, direction.movingDirection)
        let ownTilePlusMoveDir = addCoord(freePosPlusMoveDir, direction.edgeDirection)
        let nextFreeTileId = this.checkTile(freePosPlusMoveDir)
        let nextOwnTileId  = this.checkTile(ownTilePlusMoveDir)
        if (nextFreeTileId == id) {
            // inner corner so stop
            return new CornerInfo(-1, pos, direction.innerTurn())

        } else if (nextOwnTileId == id) {
            // path in direction is free, so move forward
            return this.scanAlongSide(freePosPlusMoveDir, direction, id)

        } else {
            // outer corner so stop
            return new CornerInfo(1, freePosPlusMoveDir, direction.outerTurn())

        }
    }

    identifyCornerType(pos, direction, id) {
        // in or out corner
    }

    fillClosedTerritory(pos, id) {
        let unexpanded = [pos]
        this.setTile(pos, id)

        try {
            // extra infinite loop prevention
            let iterations = 0
            while(unexpanded.length > 0 && iterations < 1000) {
                iterations++

                let tile = unexpanded.pop()

                forAll(adjacentTiles, (adj) => {
                    let adjTile = addCoord(adj, tile)
                    let territoryId = this.checkTile(adjTile)
                    if (isNumber(territoryId) && territoryId != id) {
                        this.setTile(adjTile, id)
                        unexpanded.push(adjTile)
                    }
                })
            }

            if (iterations == 1000)
                logError("fillClosedTerritory infinite loop: " + id + ", x: " + pos.x + ", y: " + pos.y, this)
        } catch (e) {
            // catch out of bounds to prevent logic error that could create a infinite loop
            logError("fillClosedTerritory catch: ", e)
        }

    }


    setVisited(pos) {
        this.visited.setValue(pos.x, pos.y, this.currentlyVisitedNum)
    }

    isVisited(pos) {
        return this.visited.checkValue(pos.x, pos.y) == this.currentlyVisitedNum
    }


    setTile(pos, id) {
        this.territory.setValue(pos.x, pos.y, id)
    }

    setTileXY(x, y, id) {
        this.territory.setValue(x, y, id)
    }

    checkTile(pos) {
        return this.territory.checkValue(pos.x, pos.y)
    }


    getOtherTilesAround(inputPos, id) {
        if (this.checkTile(inputPos) == id) {
            return adjacentTiles.filter((pos) => this.checkTile(addCoord(inputPos, pos)) != id)
        } else return []
    }

} 

function getStartingDirection(ownTile, otherAdjacentTile) {
    if (ownTile.y < otherAdjacentTile.y) 
        return new ScanAroundTeritorryDirection(rightDir, downDir)
    if (ownTile.x < otherAdjacentTile.x) 
        return new ScanAroundTeritorryDirection(downDir, leftDir)
    if (ownTile.y > otherAdjacentTile.y) 
        return new ScanAroundTeritorryDirection(leftDir, upDir)
    if (ownTile.x > otherAdjacentTile.x) 
        return new ScanAroundTeritorryDirection(upDir, rightDir)

    logError("getStartingDirection: corruptedInput: " + ownTile +", "+otherAdjacentTile)
}

class ScanAroundTeritorryDirection {
    constructor(movingDirection, edgeDirection) {
        this.movingDirection = {x: movingDirection.x, y: movingDirection.y}
        this.edgeDirection = {x: edgeDirection.x, y: edgeDirection.y}
    }

    toString() {
        return "moving x: " + this.movingDirection.x +", y: " + this.movingDirection.y  + " edge x: " + this.edgeDirection.x +", y: " + this.edgeDirection.y
    }

    innerTurn() {
        if (_.isEqual(this.movingDirection, coordAntiClockwise90D(this.edgeDirection)))
            this.turnAntiClockwise90D()
        else if (_.isEqual(this.movingDirection, coordClockwise90D(this.edgeDirection)))
            this.turnClockwise90D()
        else {
            logError("ScanAroundTeritorryDirection: innerTurn: corrupted moving/edge direction!! ")
            verboseLog(this.movingDirection)
            verboseLog(this.edgeDirection)
        }

        return this
    }

    outerTurn() {
        if (_.isEqual(this.movingDirection, coordAntiClockwise90D(this.edgeDirection)))
            this.turnClockwise90D()
        else if (_.isEqual(this.movingDirection, coordClockwise90D(this.edgeDirection)))
            this.turnAntiClockwise90D()
        else {
            logError("ScanAroundTeritorryDirection: outerTurn: corrupted moving/edge direction!! ")
            verboseLog(this.movingDirection)
            verboseLog(this.edgeDirection)
        }

        return this
    }

    turnClockwise90D() {
        this.movingDirection = coordClockwise90D(this.movingDirection)
        this.edgeDirection   = coordClockwise90D(this.edgeDirection)
    }

    turnAntiClockwise90D() {
        this.movingDirection = coordAntiClockwise90D(this.movingDirection)
        this.edgeDirection   = coordAntiClockwise90D(this.edgeDirection)
    }
}

function coordClockwise90D(coord) {
    return {x: coord.y, y: -coord.x}
}

function coordAntiClockwise90D(coord) {
    return {x: -coord.y, y: coord.x}
}

class CornerInfo {
    constructor(cornerType, pos, scanDirection) {
        this.cornerType = cornerType
        this.pos = pos
        this.scanDirection = scanDirection

    }
}