



class Scene {
    constructor(programObject, cameraMatrix, bufferInfoArray = []) {
        this.objects = bufferInfoArray;
        if(cameraMatrix == undefined)
            this.matrix = m4.identity;
        else
            this.matrix = cameraMatrix;
        this.programObject = programObject;
    }

    getObjects() {
        return this.objects;
    }

    removeObject(object) {
        remove(this.objects, object);
    }

    addObject(object) {
        this.objects.push(object);
    }

    updateCamera(cameraMatrix) {
        this.matrixNeedsUpdate = true;
        this.matrix = cameraMatrix;
    }

    render(useThisProgram = true) {
        if(useThisProgram)
            gl.useProgram(this.programObject.program);

        if(this.matrixNeedsUpdate) {
            
            twgl.setUniforms(this.programObject, {
                u_matrix: this.matrix,
            });
        }

        for(let i = 0; i < this.objects.length; i++) {
            this.objects[i].draw(this.programObject);
        }        
    }
}

class GLObject {
    constructor(bufInfo, drawType) {
        this.bufInfo = bufInfo;
        if(drawType == undefined) 
            this.drawType = gl.TRIANGLES;
        else
            this.drawType = drawType;

        this.visible = true;

        //TODO:
        // this.uniqueUniforms = uniqueUniforms;
    }



    draw(programObject) {
        if(this.visible) {
            twgl.setBuffersAndAttributes(gl, programObject, this.bufInfo);
            twgl.drawBufferInfo(gl, this.bufInfo, this.drawType);
        }
    }
}

class InstancedObject extends GLObject {
    constructor(vertexArrayInfo, bufInfo, instanceCount = 0, drawType) {
        super(bufInfo, drawType);

        this.vertexArrayInfo = vertexArrayInfo;
        this.instanceCount = instanceCount;
    }

    draw(programInfo) {
        if(this.visible) {
            
            twgl.setBuffersAndAttributes(gl, programInfo, this.bufInfo);
            
            twgl.drawBufferInfo(gl, this.vertexArrayInfo, this.drawType, this.vertexArrayInfo.numelements, 0, this.instanceCount);
        }
    }
}

//==============================================

class InstancedDrawHelper {
    constructor(programInfo, basicArrays, uniforms = {}, maxInstanceCount = 1) {
        this.programInfo = programInfo;
        this.uniforms = uniforms;

        this.maxInstanceCount = maxInstanceCount

        this.setup(basicArrays, maxInstanceCount);
    }

    get instanceCount() {
        return this.instancedObject.instanceCount;
    }

    set instanceCount(count) {
        this.instancedObject.instanceCount = count;
    }

    setup(basicArrays, maxInstanceCount) {
        this.worlds = new Float32Array(maxInstanceCount * 16);
        this.colorArrays = new Float32Array(maxInstanceCount * 4);

        var additionalArrayData = {
            modelMatrix: {
                numComponents: 16,
                data: this.worlds,
                divisor: 1
            },
            visualId: {
                numComponents: 4,
                data: this.colorArrays,
                divisor: 1
            }
        };

        this.bufInfo = assignAdditionalArrays(basicArrays, additionalArrayData)

        this.instancedObject = new InstancedObject(twgl.createVertexArrayInfo(gl, this.programInfo, this.bufInfo), this.bufInfo, maxInstanceCount);

        this.scene = new Scene(this.programInfo);

        this.scene.addObject(this.instancedObject);

    }

    setInstance(instance, position, rotation = 0, scale = 1, colorArray = undefined) {
        updateMatrixInstance(this.worlds, instance,
            position,
            rotation,
            scale);

        this.colorArrays[instance * 4 + 0] = colorArray[0]
        this.colorArrays[instance * 4 + 1] = colorArray[1]
        this.colorArrays[instance * 4 + 2] = colorArray[2]
        this.colorArrays[instance * 4 + 3] = colorArray[3]
    }

    updateGLBuffers() {
        updateGLBuffer(this.bufInfo.attribs.a_visualId, this.colorArrays);
        updateGLBuffer(this.bufInfo.attribs.a_modelMatrix, this.worlds);
        this.glBuffersNeedUpdate = false
    }

    render(updateGLBuffers = false, frameBuffer = null, setFrameBuffer, setProgram = true, setUniforms = true) {
        if (updateGLBuffers || this.glBuffersNeedUpdate) {
            this.updateGLBuffers();
        }


        if (setFrameBuffer)
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
        if (setProgram)
            gl.useProgram(this.programInfo.program);

        if(setUniforms)
            try {
                twgl.setUniforms(this.programInfo, this.uniforms);
            } catch (e) {
                console.error(performance.now(), this.programInfo, this.uniforms, e);
            }

        // render the objects:
        this.scene.render();
    }
}
//==============================================


// =========== visual debugging =================
class DebugInstanceMesh extends InstancedDrawHelper {
    constructor(programInfo, basicArrays, uniforms = {}, maxInstanceCount = 1) {
        super(programInfo, basicArrays, uniforms, maxInstanceCount)

        this.nextInstance = 0
        this.basicColor = [255,0,0,255] //red
    }

    quickPos(x, y, z = 0, rotation = 0, scale = 1, color) {
        var instance = this.nextInstance++
        if (instance >= this.maxInstanceCount) {
            console.log('out of debug squares! reusing the from the beginning')
            instance = 0
            this.nextInstance = 1
        }

        color = color || this.basicColor

        this.setInstance(instance, { x: x, y: y, z: z }, rotation, scale, color)
        this.glBuffersNeedUpdate = true
    }
    quickPosRGB(x, y, z, r, g, b, a = 255) {
        var instance = this.nextInstance
        if (instance >= this.maxInstanceCount) {
            console.log('out of debug squares! reusing the from the beginning')
            instance = 0
            this.nextInstance = 1
        }
        let rotation = 0
        let scale = 1
        let color = [r, g, b, a]
        this.setInstance(instance, { x: x, y: y, z: z }, rotation, scale, color)

        this.glBuffersNeedUpdate = true
    }

    quickPosScaleRGB(x, y, z, scale = 1, r, g, b, a = 255) {
        var instance = this.nextInstance
        if (instance >= this.maxInstanceCount) {
            console.log('out of debug squares! reusing the from the beginning')
            instance = 0
            this.nextInstance = 1
        }

        let color = [r, g, b, a]

        this.setInstance(instance, { x: x, y: y, z: z }, 0, scale, color)

        this.glBuffersNeedUpdate = true
    }

    render() {
        this.instanceCount = this.nextInstance
        super.render()
    }
}

// begin | ----------- debuging tools -------------------------
function debugSquareInstances(shaderProgram, uniforms, instanceCount, integralShader = false) {
    
    let debugMesh = new DebugInstanceMesh(
        shaderProgram,
        genRect(1, 1, 1),
        uniforms,
        instanceCount)

    for (var i = 0; i < instanceCount; i++) {
        debugMesh.setInstance(
            i, 
            { x: -10000, y: -10000 }, 
            i, 
            1, 
            [255,0,0,255])
    }

    debugMesh.glBuffersNeedUpdate = true
    debugMesh.instanceCount = instanceCount

    return debugMesh;
}

function genMatrices(worldBuffer, instanceCount) {
    const r = 10000;

    for (let i = 0; i < instanceCount; i++) {
        const mat = new Float32Array(worldBuffer.buffer, i * 16 * 4, 16);
        m4.identity(mat);
        m4.translation([-r, -r, 0], mat);

    }

    return {
        numComponents: 16,
        data: worldBuffer,
        divisor: 1
    };
}


function genRect(width = 1, height = 1, z = 0) {
    var positions   = 
        [
            -width,     -height,     z,
             width,     -height,     z,   
             width,      height,     z,
            -width,      height,     z, 
        ];

    return {
        position: { numComponents: 3, data: positions, divisor: 0 },
        indices: [0, 1, 2, 2, 3, 0],
    };
}

function updateMatrixInstance(matrixBuffer, instance, position, rotation = 0, scale = 1) {    
    if(instance == undefined || typeof(instance) != "number") 
        console.trace("updateMatrixInstance error: instance is not a number", instance)

    const mat = new Float32Array(matrixBuffer.buffer, instance * 16 * 4, 16);

    // set position
    var z = position.z != undefined ? position.z : 0;
    m4.translation([position.x, position.y, z], mat);
    m4.rotateZ(mat, rotation, mat);
    if(isObject(scale)) {
        m4.scale(mat, v3.create(scale.width, scale.height, scale.depth || 1), mat);
    } else
        m4.scale(mat, v3.create(scale, scale, scale), mat);
}

function assignAdditionalArrays(basicArrays, additionalArrays) {
    Object.assign(basicArrays, additionalArrays);

    return twgl.createBufferInfoFromArrays(gl, basicArrays);
}

// ========================================