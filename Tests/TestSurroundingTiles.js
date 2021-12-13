


testSurroundingTiles()

function testSurroundingTiles() {
    let claimedTerritory = new ClaimedTerritory(10, 10)

    claimedTerritory.setTile(1,1, 2)
    claimedTerritory.setTile(3,3, 32)
    claimedTerritory.setTile(3,4, 32)
    claimedTerritory.setTile(4,3, 32)
    claimedTerritory.setTile(4,4, 32)
    claimedTerritory.setTile(3,7, 2)


    testEqualTo(claimedTerritory.getOtherTilesAround(3,3, 32), 
        [{x: -1,y: -1},
         {x: 0,y: -1},
         {x: 1,y: -1},
         {x: -1,y: 0},
         {x: -1,y: 1}], 
         "getOtherTilesAround 1")
    testEqualTo(claimedTerritory.getOtherTilesAround(4,4, 32), 
        [{x: 1,y: -1},
         {x: 1,y: 0},
         {x: -1,y: 1},
         {x: 0,y: 1},
         {x: 1,y: 1}],
         "getOtherTilesAround 2")
}