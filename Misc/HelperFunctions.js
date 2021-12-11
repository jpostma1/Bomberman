


function isObject(value) {
    return typeof value === 'object' && !Array.isArray(value) && value !== null
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