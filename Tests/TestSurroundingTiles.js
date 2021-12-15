


testSurroundingTiles()
testGetStartingDirection() 
testScanAlongInnerSide() 
testCornersTakenInRoundTrip() 
testFillClosedTerritory()
testOutlineMakesNewClosedTerritory()

function simpleTerritory() {
    let claimedTerritory = new ClaimedTerritory(10, 10)

    claimedTerritory.setTileXY(1,1, 2)
    claimedTerritory.setTileXY(3,3, 32)
    claimedTerritory.setTileXY(3,4, 32)
    claimedTerritory.setTileXY(4,3, 32)
    claimedTerritory.setTileXY(4,4, 32)
    claimedTerritory.setTileXY(3,7, 2)

    return claimedTerritory
}

function simpleInnerTerritory() {
    let claimedTerritory = new ClaimedTerritory(10, 10)

    claimedTerritory.setTileXY(3,3, 32)
    claimedTerritory.setTileXY(4,3, 32)
    claimedTerritory.setTileXY(5,3, 32)
    claimedTerritory.setTileXY(6,3, 32)
    claimedTerritory.setTileXY(7,3, 32)
    claimedTerritory.setTileXY(7,4, 32)
    claimedTerritory.setTileXY(7,5, 32)
    claimedTerritory.setTileXY(7,6, 32)
    claimedTerritory.setTileXY(7,7, 32)
    claimedTerritory.setTileXY(6,7, 32)
    claimedTerritory.setTileXY(5,7, 32)
    claimedTerritory.setTileXY(4,7, 32)
    claimedTerritory.setTileXY(3,7, 32)
    claimedTerritory.setTileXY(3,6, 32)
    claimedTerritory.setTileXY(3,5, 32)
    claimedTerritory.setTileXY(3,4, 32)

    return claimedTerritory
}

function smallTerritory() {


    var levelString = [
        "........",
        "........",
        "...111...",
        "...1.1...",
        "...111...",
        "........",
        "........"
    ]

    return setTerritory(levelString)
}

function filledSmallTerritory() {
    var levelString = [
        "........",
        "........",
        "...111...",
        "...111...",
        "...111...",
        "........",
        "........"
    ]

    return setTerritory(levelString)
}

function hardExampleTerritory() {


    var levelString = [
        "....................",
        "....................",
        "...........1111111..",
        "..........11.....1..",
        "..........11.....1..",
        "..111111111111...1..",
        ".....11111111....1..",
        ".....1...1111..111..",
        ".....1.....11111....",
        "....................",
        "...................."
    ]

    return setTerritory(levelString)
}

function filledHardExampleTerritory() {
    let levelString = [
        "....................",
        "....................",
        "...........1111111..",
        "..........11111111..",
        "..........11111111..",
        "..1111111111111111..",
        ".....1111111111111..",
        ".....1...111111111..",
        ".....1.....11111....",
        "....................",
        "...................."
    ]

    return setTerritory(levelString)
    
}

function setTerritory(levelString) {
    let claimedTerritory = new ClaimedTerritory(levelString.length, levelString[0].length)
    for(var x = 0; x < levelString.length; x++) {
        for(var y = 0; y < levelString[x].length; y++) {
            // const tileType = Math.random()>0.15 ? {x: 1, y: 1 } : {x: 1, y: 0}
            switch(levelString[x][y]) {
                case '1':
                    claimedTerritory.setTileXY(x,y, 32)
                break
            }
        }
    }

    return claimedTerritory
}


function testSurroundingTiles() {
    let claimedTerritory = simpleTerritory()

    testEqualTo("getOtherTilesAround 1",
        claimedTerritory.getOtherTilesAround({x:3,y:3}, 32), 
        [
         // {x: -1,y: -1},
         {x: 0,y: -1},
         // {x: 1,y: -1},
         {x: -1,y: 0},
         // {x: -1,y: 1}
         ])
    testEqualTo("getOtherTilesAround 2",
        claimedTerritory.getOtherTilesAround({x:4,y:4}, 32), 
        [
         // {x: 1,y: -1},
         {x: 1,y: 0},
         // {x: -1,y: 1},
         {x: 0,y: 1},
         // {x: 1,y: 1}
         ])
}




function testGetStartingDirection() {

    testEqualTo("getStartingDirection 1",
        getStartingDirection({x:3,y:3}, {x:3,y:2}),
        new ScanAroundTeritorryDirection(leftDir, upDir)
        )

    // testEqualTo("getStartingDirection 2",
    //     getStartingDirection({x:3,y:3}, {x:4,y:4}),
    //     new ScanAroundTeritorryDirection(rightDir, downDir)
    //     )
}

 

function testScanAlongOuterSide() {
    let claimedTerritory = simpleTerritory()

    let otherTile1 = {x:4,y:2}
    let startingDirection = getStartingDirection({x:4,y:3}, otherTile1)
    let answer1 = claimedTerritory.scanAlongSide(otherTile1, startingDirection, 32)
    testEqualTo("scanAlongSide go right from upper left",
        answer1,
        new CornerInfo(1, {x:2,y:2}, getStartingDirection({x:4,y:3}, otherTile1).outerTurn())
        )

    claimedTerritory.currentlyVisitedNum++
    let otherTile2 = {x:2,y:3}
    let startingDirection2 = getStartingDirection({x:3,y:3}, otherTile2)
    testEqualTo("scanAlongSide go right from upper left",
        claimedTerritory.scanAlongSide(otherTile2, startingDirection2, 32),
        new CornerInfo(1, {x:2,y:5}, getStartingDirection({x:3,y:3}, otherTile2).outerTurn())
        )

    claimedTerritory.currentlyVisitedNum++
    let otherTile3 = {x:2,y:5}
    let startingDirection3 = getStartingDirection({x:3,y:4}, otherTile3)
    testEqualTo("scanAlongSide go right from upper left",
        claimedTerritory.scanAlongSide(otherTile3, startingDirection3, 32),
        new CornerInfo(1, {x:5,y:5}, getStartingDirection({x:3,y:4}, otherTile3).outerTurn())
        )

    claimedTerritory.currentlyVisitedNum++
    let otherTile4 = {x:5,y:5}
    let startingDirection4 = new ScanAroundTeritorryDirection(downDir, leftDir)
    testEqualTo("scanAlongSide go right from upper left",
        claimedTerritory.scanAlongSide(otherTile4, startingDirection4, 32),
        new CornerInfo(1, {x:5,y:2}, new ScanAroundTeritorryDirection(downDir, leftDir).outerTurn())
        )
}


function testScanAlongInnerSide() {
    let claimedTerritory = simpleInnerTerritory()

    let ownTile1   = {x:4,y:3}
    let otherTile1 = {x:4,y:4}
    let startingDirection1 = getStartingDirection(ownTile1, otherTile1)
    let answer1 = claimedTerritory.scanAlongSide(otherTile1, startingDirection1, 32)
    testEqualTo("scanAlongSide go right from upper left",
        answer1,
        new CornerInfo(-1, {x:6,y:4}, getStartingDirection(ownTile1, otherTile1).innerTurn())
        )

    claimedTerritory.currentlyVisitedNum++
    let ownTile2   = {x:7,y:4}
    let otherTile2 = {x:6,y:4}
    let startingDirection2 = new ScanAroundTeritorryDirection(upDir, rightDir)
    let answer2 = claimedTerritory.scanAlongSide(otherTile2, startingDirection2, 32)
    testEqualTo("scanAlongSide go right from upper left",
        answer2,
        new CornerInfo(-1, {x:6,y:6}, getStartingDirection(ownTile2, otherTile2).innerTurn())
        )
    
    claimedTerritory.currentlyVisitedNum++
    let ownTile3   = {x:7,y:3}
    let otherTile3 = {x:6,y:4}
    let startingDirection3 = new ScanAroundTeritorryDirection(leftDir, downDir)
    let answer3 = claimedTerritory.scanAlongSide(otherTile3, startingDirection3, 32)
    testEqualTo("scanAlongSide go right from upper left",
        answer3,
        new CornerInfo(-1, {x:4,y:4}, new ScanAroundTeritorryDirection(leftDir, downDir).innerTurn())
        )

    claimedTerritory.currentlyVisitedNum++
}




function testCornersTakenInRoundTrip() {
    
    let claimedTerritory = simpleTerritory()
    testEqualTo("cornersTaken In outer RoundTrip1",
        claimedTerritory.cornersTakenInRoundTrip({x:3,y:3}, {x:2,y:2}, 32),
        4)



    let claimedTerritory2 = simpleInnerTerritory()
    testEqualTo("cornersTaken In inner RoundTrip2",
        claimedTerritory2.cornersTakenInRoundTrip({x:3,y:4}, {x:4,y:4}, 32),
        -4)


    let claimedTerritory3 = hardExampleTerritory()

    testEqualTo("hardExample: cornersTaken In outer RoundTrip",
        claimedTerritory3.cornersTakenInRoundTrip({x:5,y:2}, {x:4,y:2}, 32),
        4)

    testEqualTo("hardExample: cornersTaken In inner RoundTrip",
        claimedTerritory3.cornersTakenInRoundTrip({x:3,y:11}, {x:3,y:12}, 32),
        -4)

    let small = smallTerritory()
    testEqualTo("smallExample: cornersTaken In inner RoundTrip",
        small.cornersTakenInRoundTrip({x:3,y:3}, {x:3,y:4}, 32),
        -4)
    
}

function testFillClosedTerritory() {
    let claimedTerritory = hardExampleTerritory()
    let filledResultTerritory = filledHardExampleTerritory()

    claimedTerritory.fillClosedTerritory({x:3,y:16}, 32)
    testEqualTo("hardExample: fill inner territory",
        claimedTerritory.territory,
        filledResultTerritory.territory
        )

}

function testOutlineMakesNewClosedTerritory() {
    let filledResultTerritory1 = filledHardExampleTerritory()
    let hardTerritory = hardExampleTerritory()

    hardTerritory.outlineMakesNewClosedTerritory({x:3,y:11}, 32)
    testEqualTo("hardExample: cornersTaken In inner RoundTrip",
        hardTerritory.territory,
        filledResultTerritory1.territory)

    let filledResultTerritory2 = filledSmallTerritory()

    let small = smallTerritory()
    small.outlineMakesNewClosedTerritory({x:3,y:3}, 32)
    testEqualTo("smallExample: cornersTaken In inner RoundTrip",
        small.territory,
        filledResultTerritory2.territory)
}