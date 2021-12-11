

// this file contains a range of small convenience functions to keep other code cleaner


function randBetween(min, max) {
    return min + Math.floor(Math.random()*(max-min))
}

function randSeedBetween(min, max) {
    return min + Math.floor(random()*(max-min))
}


function isObject(value) {
    return typeof value === 'object' && !Array.isArray(value) && value !== null
}

function isNumber(value) {
    return typeof(value) == "number"
}


function getFraction(x) {
    return x-parseInt(x) 
}

function addCoord(c1, c2) {
    return { x: c1.x + c2.x, y: c1.y + c2.y }
}
function subtractCoord(c1, c2) {
    return { x: c1.x - c2.x, y: c1.y - c2.y }
}

function magnitude(vector) {
    let dx2 = vector.x * vector.x
    let dy2 = vector.y * vector.y
    return Math.sqrt(dx2+dy2)
}

//NOTE USE: Assumes a sorted list in ascending order 
function binarySearch(list, value) {
    var low = 0
    var high = list.length

    while (low < high) {
        // >>> is an unsigned bit shift to the right (i.e. >>> 1 => divided by 2 and rounded down)
        var mid = low + high >>> 1
        if (list[mid] < value) 
            low = mid + 1
        else
            high = mid
    }
    return low
}



function splitUntil(string, match, limit) { 
    var output = [];
    var lastOccurence = 0;
    var occurences = 0;

    for(var i = 0; i < string.length; i++) {
        if(match == string[i]) {
            if(++occurences >= limit)
                break;
            output.push(string.slice(lastOccurence, i));
            lastOccurence = i+1;
        }
    }

    if(occurences >= limit && i < output.length)
        output[output.length-1] += match+string.slice(lastOccurence); 
    else 
        output.push(string.slice(lastOccurence));

    return output;
}



Array.prototype.splitOn = function (conditionFunc) {
    var holds = []
    var fails = []

    for(var element of this) {
        if(conditionFunc(element)) 
            holds.push(element)
        else 
            fails.push(element)
    }

    return { 
        holds: holds, 
        fails: fails 
    } 
}