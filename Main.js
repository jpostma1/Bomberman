




console.log("Main loaded")


// visual debugging
let debugSquareCount = 1000
let debugSquares = debugSquareInstances(colorRedProgram, { u_matrix: orthoCameraMatrix }, debugSquareCount)
// let debugSquares2 = debugSquareInstances(colorRedProgram, { u_matrix: orthoCameraMatrix }, debugSquareCount)
let debugColor = 0
// visual debugging



function debugGrid(rows, columns, pos = { x: 0, y: 0 }) {
    var displacement = 10.2;
    for(var x = 0; x < rows; x++) {
        for(var y = 0; y < rows; y++) {
            debugSquares.quickPos(pos.x + x*displacement, pos.y + y*displacement, 0, 0, 1, [255,0,255,255])
        }
    }
}


function debugCircle(width, instancesToDraw = 100, pos = { x: 0, y: 0 }) {
    var circleIsFinished = false
    var angle = 0
    var pixelsToDraw = (width / 1.5 * Math.PI)
    var incrementPerPixel = (Math.PI * 2) / (instancesToDraw-1)
    
    console.log(width, pixelsToDraw, width * width * Math.PI, incrementPerPixel)

    while (!circleIsFinished) {
        angle += incrementPerPixel
        if (angle >= Math.PI * 2)
            circleIsFinished = true

        var x = Math.cos(angle) * width
        var y = Math.sin(angle) * width

        debugSquares.quickPos(pos.x + x, pos.y + y, 0, 0, 1, [255,0,255,255])
    }
}




// debugCircle(2, 1000, { x: 0, y: 0 })
debugGrid(10, 10, { x: 0, y: 0 })


debugSquares.render()

// var testRender = new TestRender()

gameLoop (
    //update
    function () {
    }, 
    //render
    function () {
        console.log("render called")
        // testRender.render();
        // debugSquares.render()
    }
);

