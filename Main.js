




console.log("Main loaded")


// visual debugging
let debugSquareCount = 1000
let debugSquares = debugSquareInstances(colorRedProgram, { u_matrix: orthoCameraMatrix }, debugSquareCount)
// let debugSquares2 = debugSquareInstances(colorRedProgram, { u_matrix: orthoCameraMatrix }, debugSquareCount)
let debugColor = 0
// visual debugging




var mainScene = new Scene(colorProgram)
var objManager = new GLObjectManager(mainScene, colorProgram, 100)

var id3 = objManager.newObj()
objManager.updateObj(id3, { x: 10, y:0, z:300}, 0, 10)
objManager.updateColor(id3, [0, 0,255,255])

var id1 = objManager.newObj()
objManager.updateObj(id1, { x: 0, y:10, z:200}, 0, 10)
objManager.updateColor(id1, [255,0,0,255])

var id2 = objManager.newObj()
objManager.updateObj(id2, { x: 0, y:0, z:1}, 0, 10)
objManager.updateColor(id2, [0, 255,0,255])


objManager.handleGLBufferUpdate()

setupInputListeners()
// debugCircle(2, 1000, { x: 0, y: 0 })
debugGrid(10, 10, { x: 0, y: 0 })




var thisUniforms = { u_matrix: orthoCameraMatrix }
// if (setFrameBuffer)
gl.bindFramebuffer(gl.FRAMEBUFFER, null);
// if (setProgram)
gl.useProgram(colorProgram.program);

// if(setUniforms)
try {
    twgl.setUniforms(colorProgram, thisUniforms);
} catch (e) {
    console.error(performance.now(), colorProgram, thisUniforms, e);
}

gameLoop (
    //update
    function () {
    }, 
    //render
    function () {
        clearFrame()
        console.log("render called")
        // testRender.render();
        // debugSquares.render()
        mainScene.render()
    }
);





// ============================
function debugGrid(rows, columns, pos = { x: 0, y: 0 }) {
    var displacement = 1
    var scale = 10;
    var rotation = 0
    var z = 0
    for(var x = 0; x < rows; x++) {
        for(var y = 0; y < rows; y++) {
            // debugSquares.quickPosScaleRGB(
            //     pos.x + x*displacement, 
            //     pos.y + y*displacement, 
            //     z, 
            //     // rgb a
            //     0, 255, 255, 255,
            //     // scale
            //     1)

            debugSquares.quickPos(
                pos.x + x*scale*2+x*displacement, 
                pos.y + y*scale*2+y*displacement, 
                z, 
                rotation,
                // // rgb a
                // 0, 255, 255, 255,
                // scale
                scale
                )
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