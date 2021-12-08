
var widthUnits = 1000
var heightUnits = 1000

// =============== compile shader programs =================
const colorRedProgram = twgl.createProgramInfo(gl, ["simpleVertex", "redFragment"]);
const textureProgram = twgl.createProgramInfo(gl, ["texVertex", "texFragment"]);
// end =============== compile shader programs =================


var orthoCameraMatrix = m4.identity()
    // 2/units for -units left edge and +units right edge
    m4.scale(orthoCameraMatrix, v3.create(2/widthUnits, 2/(heightUnits), 0), orthoCameraMatrix)












