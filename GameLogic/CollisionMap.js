


class CollisionMap {

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
        this.collisionMap[Math.floor(coord.x)][Math.floor(coord.y)] = value
    }

    setValue(x, y, value) {
        this.collisionMap[Math.floor(x)][Math.floor(y)] = value
    }

    checkValue(x, y) {
        return this.collisionMap[Math.floor(x)][Math.floor(y)]
    }
    setCoord(coord) {
        return this.collisionMap[Math.floor(coord.x)][Math.floor(coord.y)]
    }
}