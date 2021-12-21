import { Coord } from "../Misc/HelperFunctions"


export class CollisionMap {

    width:number
    height:number

    collisionMap:number[][]

    constructor(width:number, height:number) {
        this.width = width
        this.height = height

        this.collisionMap = [] // <-- to make TS happy..
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

    setCoord(coord:Coord, value:number) {
        this.collisionMap[Math.floor(coord.x)][Math.floor(coord.y)] = value
    }
    
    getCoordValue(coord:Coord) {
        return this.collisionMap[Math.floor(coord.x)][Math.floor(coord.y)]
    }

    setValue(x:number, y:number, value:number) {
        this.collisionMap[Math.floor(x)][Math.floor(y)] = value
    }

    checkValue(x:number, y:number) :number {
        return this.collisionMap[Math.floor(x)][Math.floor(y)]
    }
    
}