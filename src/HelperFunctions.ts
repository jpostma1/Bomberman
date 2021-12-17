

// this file contains a range of small convenience functions to keep other code cleaner

export let rightDir = { x:  1, y:  0 }
export let leftDir  = { x: -1, y:  0 }
export let upDir    = { x:  0, y:  1 }
export let downDir  = { x:  0, y: -1 }
export let centerCoord  = { x:  0.5, y: 0.5 }
export let center = 0.5

export interface Coord {
    x:number
    y:number
}

export function sign(x:number):number {
    if (x == 0)
        return 0
    if (x < 0)
        return -1

    return 1
}

export function randBetween(min:number, max:number):number {
    return min + Math.floor(Math.random()*(max-min))
}

// function randSeedBetween(min:number, max:number):number {
//     return min + Math.floor(random()*(max-min))
// }


export function isObject(value:number):boolean {
    return typeof value === 'object' && !Array.isArray(value) && value !== null
}

export function isNumber(value:number):boolean {
    return typeof(value) == "number"
}


export function getFraction(x:number):number {
    return x-parseInt(x+"") 
}

export function addCoord(c1:Coord, c2:Coord):Coord {
    return { x: c1.x + c2.x, y: c1.y + c2.y }
}
export function subtractCoord(c1:Coord, c2:Coord):Coord {
    return { x: c1.x - c2.x, y: c1.y - c2.y }
}

export function magnitude(vector:Coord):number {
    let dx2 = vector.x * vector.x
    let dy2 = vector.y * vector.y
    return Math.sqrt(dx2+dy2)
}


export function forAll(enumerator:any, func:any, logInvalidEnumerator = true) {
    if(isObject(enumerator))
        for(var index in enumerator)
            func(enumerator[index])
    else if(Array.isArray(enumerator))
        for (var i = 0; i < enumerator.length; i++)
            func(enumerator[i])
    else {
        if(logInvalidEnumerator)
            console.error("forAll: not a supported enumerator:", enumerator)
        return -1
    }

}

// Array.prototype.map = function(func:any) {
//     var output = [];
//     for(var i = 0; i < this.length; i++)
//         output.push(func(this[i]));

//     return output;
// }
