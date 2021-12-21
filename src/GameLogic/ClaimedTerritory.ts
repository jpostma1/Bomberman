import _ from "lodash"
import { isNumber } from "lodash"
import { addCoord, Coord, downDir, forAll, leftDir, rightDir, upDir } from "../Misc/HelperFunctions"
import { logError, verboseLog } from "../Misc/Logging"
import { CollisionMap } from "./CollisionMap"






export let adjacentTiles = [
        {x:  0, y: -1},
        {x: -1, y: 0},
        {x:  1, y: 0},        
        {x:  0, y: 1},
    ]

export class ClaimedTerritory {

    territory:CollisionMap
    visited:CollisionMap
    currentlyVisitedNum:number = 1

    cachedIdCount:any = {}

    constructor(
        public width:number,
        public height:number) {

        this.territory = new CollisionMap(width, height)
        this.visited   = new CollisionMap(width, height)
    }


    outlineMakesNewClosedTerritory(pos:Coord, id:number):Coord[] {
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

        let claimedTiles:Coord[] = []
        forAll(fillingSeeds, (pos:Coord) => 
            forAll(this.fillClosedTerritory(pos, id), 
                (newClaimedTile:Coord) => claimedTiles.push(newClaimedTile)
            )
        )

        return claimedTiles
    }

    cornersTakenInRoundTrip(ownTile:Coord, otherTile:Coord, id:number) {
        let cornersTaken = 0

        let scanDirection = getStartingDirection(ownTile, otherTile)
        let startingCorner = this.scanAlongSide(otherTile, scanDirection, id)
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



    scanAlongSide(pos:Coord, scanDirection:ScanAroundTeritorryDirection, id:number):CornerInfo {
        // keep traveling in 'direction' until a corner is reached

        let freePosPlusMoveDir = addCoord(pos, scanDirection.movingDirection)
        let ownTilePlusMoveDir = addCoord(freePosPlusMoveDir, scanDirection.edgeDirection)
        let nextFreeTileId = this.checkTile(freePosPlusMoveDir)
        let nextOwnTileId  = this.checkTile(ownTilePlusMoveDir)
        if (nextFreeTileId == id) {
            // inner corner so stop
            scanDirection.innerTurn()
            return new CornerInfo(-1, pos, scanDirection)

        } else if (nextOwnTileId == id) {
            // path in scanDirection is free, so move forward
            return this.scanAlongSide(freePosPlusMoveDir, scanDirection, id)

        } else {
            // outer corner so stop
            scanDirection.outerTurn()
            return new CornerInfo(1, freePosPlusMoveDir, scanDirection)

        }
    }


    fillClosedTerritory(pos:Coord, id:number):Coord[] {
        let unexpanded:Coord[] = [pos]
        this.setTile(pos, id)
        let filledTiles:Coord[] = [pos]
        try {
            // extra infinite loop prevention
            let iterations = 0
            while(unexpanded.length > 0 && iterations < 1000) {
                iterations++

                // to make TS happy (unnecessary check, since unexpanded.length > 0)
                let tempTile = unexpanded.pop()
                if (tempTile == undefined) tempTile = {x:0, y:0}
                // 
                let tile:Coord = tempTile

                forAll(adjacentTiles, (adj:Coord) => {
                    let adjTile = addCoord(adj, tile)
                    let territoryId = this.checkTile(adjTile)
                    if (isNumber(territoryId) && territoryId != id) {
                        this.setTile(adjTile, id)
                        unexpanded.push(adjTile)
                        filledTiles.push(adjTile)
                    }
                })
            }

            if (iterations == 1000)
                logError("fillClosedTerritory infinite loop: " + id + ", x: " + pos.x + ", y: " + pos.y, this)
        } catch (e) {
            // catch out of bounds to prevent logic error that could create a infinite loop
            logError("fillClosedTerritory catch: ", e)
        }

        return filledTiles
    }

    handleCache(pos:Coord, id:number) {
        if (this.cachedIdCount[id] == undefined)
            this.cachedIdCount[id] = 0

        let oldId = this.checkTile(pos)
        
        this.cachedIdCount[oldId]--
        this.cachedIdCount[id]++
    }

    getClaimedTiles(id:number) {
        if (this.cachedIdCount[id] == undefined)
            return 0
        
        return this.cachedIdCount[id]
    }

    setVisited(pos:Coord) {
        this.visited.setValue(pos.x, pos.y, this.currentlyVisitedNum)
    }

    isVisited(pos:Coord):boolean {
        return this.visited.checkValue(pos.x, pos.y) == this.currentlyVisitedNum
    }

    setTile(pos:Coord, id:number) {
        this.handleCache(pos, id)
        this.territory.setValue(pos.x, pos.y, id)
    }

    setTileXY(x:number, y:number, id:number) {
        this.setTile({x:x, y:y}, id)
    }

    checkTile(pos:Coord):number {
        return this.territory.checkValue(pos.x, pos.y)
    }

    getOtherTilesAround(inputPos:Coord, id:number) {
        if (this.checkTile(inputPos) == id) {
            return adjacentTiles.filter((pos) => this.checkTile(addCoord(inputPos, pos)) != id)
        } else return []
    }

} 

function getStartingDirection(ownTile:Coord, otherAdjacentTile:Coord):ScanAroundTeritorryDirection {
    if (ownTile.y < otherAdjacentTile.y) 
        return new ScanAroundTeritorryDirection(rightDir, downDir)
    if (ownTile.x < otherAdjacentTile.x) 
        return new ScanAroundTeritorryDirection(downDir, leftDir)
    if (ownTile.y > otherAdjacentTile.y) 
        return new ScanAroundTeritorryDirection(leftDir, upDir)
    if (ownTile.x > otherAdjacentTile.x) 
        return new ScanAroundTeritorryDirection(upDir, rightDir)
    
        
    logError("getStartingDirection: corruptedInput: " + ownTile +", "+otherAdjacentTile)
    return new ScanAroundTeritorryDirection({x:0, y:0}, {x:0, y:0})
}

class ScanAroundTeritorryDirection {
    movingDirection:Coord
    edgeDirection:Coord
    constructor(movingDirection:Coord, edgeDirection:Coord) {
        this.movingDirection = {x: movingDirection.x, y: movingDirection.y}
        this.edgeDirection = {x: edgeDirection.x, y: edgeDirection.y}
    }

    toString() {
        return "moving x: " + this.movingDirection.x +", y: " + this.movingDirection.y  + " edge x: " + this.edgeDirection.x +", y: " + this.edgeDirection.y
    }

    innerTurn():void {
        if (_.isEqual(this.movingDirection, coordAntiClockwise90D(this.edgeDirection)))
            this.turnAntiClockwise90D()
        else if (_.isEqual(this.movingDirection, coordClockwise90D(this.edgeDirection)))
            this.turnClockwise90D()
        else {
            logError("ScanAroundTeritorryDirection: innerTurn: corrupted moving/edge direction!! ")
            verboseLog(this.movingDirection)
            verboseLog(this.edgeDirection)
        }
    }

    outerTurn():void {
        if (_.isEqual(this.movingDirection, coordAntiClockwise90D(this.edgeDirection)))
            this.turnClockwise90D()
        else if (_.isEqual(this.movingDirection, coordClockwise90D(this.edgeDirection)))
            this.turnAntiClockwise90D()
        else {
            logError("ScanAroundTeritorryDirection: outerTurn: corrupted moving/edge direction!! ")
            verboseLog(this.movingDirection)
            verboseLog(this.edgeDirection)
        }
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

function coordClockwise90D(coord:Coord) {
    return {x: coord.y, y: -coord.x}
}

function coordAntiClockwise90D(coord:Coord) {
    return {x: -coord.y, y: coord.x}
}

class CornerInfo {
    cornerType:number
    pos:Coord
    scanDirection:ScanAroundTeritorryDirection
    constructor(cornerType:number, pos:Coord, scanDirection:ScanAroundTeritorryDirection) {
        this.cornerType = cornerType
        this.pos = pos
        this.scanDirection = scanDirection

    }
}