




// class PlayerManager {
//     constructor(scene, program, maxSnakeCount = 1) {
//         this.maxSnakeCount = maxSnakeCount;
//         this.setupRenderDetails(scene, program);

//         this.idPool = new IDPool(maxSnakeCount)

//     }

//     get liveIdCount() {
//         return this.idPool.liveIdCount
//     }

//     removeSnake(id) {
//         this.updateSnake(id, { x: -100000, y: -100000 }, 0, 0)

//         this.idPool.setIdle(id)
//         this.instances.instanceCount = this.idPool.currentMaxId
//     }

//     newSnakeId() {
//         let id = this.idPool.newId()
//         this.instances.instanceCount = this.idPool.currentMaxId

//         return id
//     }

//     updateColor(instance, colorArray) {
//         this.colorArrays[instance * 4 + 0] = colorArray[0];
//         this.colorArrays[instance * 4 + 1] = colorArray[1];
//         this.colorArrays[instance * 4 + 2] = colorArray[2];
//         this.colorArrays[instance * 4 + 3] = colorArray[3];

//         this.colorsNeedUpdate = true;
//     }

//     updateSnake(instance, position, rotation = 0, scale = 1) {
//         updateMatrixInstance(this.instanceWorlds, instance, position, rotation, scale);
//         this.modelsNeedUpdate = true;
//     }

//     genInstanceAttibutes(instanceWorlds, visualIdValues) {
//         let modelMatrixInfo = genMatrices(instanceWorlds, this.maxSnakeCount);


//         return {
//             modelMatrix: modelMatrixInfo,
//             visualId: {
//                 numComponents: 4,
//                 data: visualIdValues,
//                 divisor: 1
//             },
//         };
//     }

//     handleGLBufferUpdate() {
//         if (this.modelsNeedUpdate) {
//             updateGLBuffer(this.istancesBufInfo.attribs.a_modelMatrix, this.instanceWorlds);
//         }

//         if (this.colorsNeedUpdate) {
//             updateGLBuffer(
//                 this.istancesBufInfo.attribs.a_visualId,
//                 this.colorArrays);
//         }


//         this.modelsNeedUpdate = false;
//         this.colorsNeedUpdate = false;
//     }

//     setupRenderDetails(scene, program) {
//         this.instanceWorlds = new Float32Array(this.maxSnakeCount * 16);
//         this.colorArrays = new Float32Array(this.maxSnakeCount * 4);

//         this.modelMatrixData = this.genInstanceAttibutes(this.instanceWorlds, this.colorArrays);
//         this.istancesBufInfo = createCircle(20, 1, this.modelMatrixData);
//         this.instances = new InstancedObject(
//             twgl.createVertexArrayInfo(
//                 gl,
//                 program,
//                 this.istancesBufInfo),
//             this.istancesBufInfo,
//             this.maxSnakeCount);

//         scene.addObject(this.instances);
//     }

// }
