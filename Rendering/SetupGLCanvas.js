






// // ================ fancy visuals =================
twgl.setDefaults({attribPrefix: "a_"});
const m4 = twgl.m4;
const v3 = twgl.v3;


// NOTE: evt hier een canvas elem aanmaken, zodat je geen gezeik met 'mogelijk null' krijgt in TypeScript 
const glCanvas = document.querySelector("canvas")
twgl.resizeCanvasToDisplaySize(glCanvas);


glContextOptions = {
    premultipliedAlpha: false,
    preserveDrawingBuffer: true,
    alpha: true,
}

// ================= using webgl 1.0 for now ==================
let webglVersion = 1
let gl = glCanvas.getContext("webgl", glContextOptions);

twgl.addExtensionsToContext(gl);

const dipRect = glCanvas.getBoundingClientRect();
console.log("dipRect", dipRect, devicePixelRatio)
console.log(glCanvas.width, glCanvas.height);


glCanvas.width  = Math.round(devicePixelRatio * window.innerWidth);
glCanvas.height = Math.round(devicePixelRatio * window.innerHeight);


console.log(glCanvas.width, glCanvas.height);

gl = glCanvas.getContext("webgl", glContextOptions);




gl.disable(gl.DEPTH_TEST);
// gl.enable(gl.DEPTH_TEST);
gl.disable(gl.CULL_FACE);
gl.disable(gl.BLEND);

gl.clearColor(0.0, 0.0, 0.0, 0.0);
gl.colorMask(true, true, true, true);


