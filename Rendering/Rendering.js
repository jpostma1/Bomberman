


function gameLoop(update, render) {
    updateFunc = update
    renderFunc = render


    var loop = function () {
        requestAnimationFrame(loop)
        
        updateFunc()
        renderFunc()
        
    }

    
    requestAnimationFrame(loop)
}



function createTextureRect(width = 1, height = 1, z = 0, uvWidth = 1, uvHeight = 1, additionalArrays = {}) {

    var positions = 
        [
            -width,     -height,     z,
             width,     -height,     z,   
             width,      height,     z,
            
             width,      height,     z,   
            -width,      height,     z,    
            -width,     -height,     z
        ];


    // texture placement data
    var uvValues = 
        [
             0,             0,
             uvWidth,       0,   
             uvWidth,       uvHeight,   
            
             uvWidth,       uvHeight,   
             0,             uvHeight,
             0,             0
        ];

    const basicArrays = {
        position: { numComponents: 3, data: positions, divisor: 0 },
        uv: { numComponents: 2, data: uvValues, divisor: 0 }
    };

    Object.assign(basicArrays, additionalArrays);

    return twgl.createBufferInfoFromArrays(gl, basicArrays);
}


function updateGLBuffer(bufferObj, floatArray, offset = 0) {
    let glBuffer = bufferObj.buffer;
    gl.bindBuffer(gl.ARRAY_BUFFER, glBuffer);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, floatArray); 
}

function setNormalViewport() {
    gl.viewport(0, 0, glCanvas.width, glCanvas.height)
}

