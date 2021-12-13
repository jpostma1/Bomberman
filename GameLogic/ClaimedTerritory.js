




let surroundingTiles = [
        {x: -1, y: -1},
        {x:  0, y: -1},
        {x:  1, y: -1},

        {x: -1, y: 0},
        {x:  0, y: 0},
        {x:  1, y: 0},
        
        {x: -1, y: 1},
        {x:  0, y: 1},
        {x:  1, y: 1}
    ]

class ClaimedTerritory {

    constructor(width, height) {
        this.width = width
        this.height = height


        this.territory = new CollisionMap(width, height)
        this.visited   = new CollisionMap(width, height)
        this.visitedId = 0
    }


    outlineMakesNewClosedTerritory(x, y, id) {
        let nonFriendlyTilesAroundPos = this.getOtherTilesAround(id, x, y)

        this.visitedId++


    }

    setTile(x, y, id) {
        this.territory.setValue(x, y, id)
    }

    checkTile(x, y) {
        return this.territory.checkValue(x, y)
    }

    getOtherTilesAround(x, y, id) {
        if(this.checkTile(x, y) == id) {
            return surroundingTiles.filter((pos) => this.checkTile(x+pos.x, y+pos.y) != id
            )
        } else return []
    }

} 