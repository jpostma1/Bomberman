

class TestRender {

    constructor() {

        this.viewMatrix = m4.identity(); 
        this.shaderProgram = colorRedProgram

        this.exampleQuad = createTextureRect(1.0, 1.0, 0.0, 1.0, 1.0)
    }



    render() {



        handleRatioWithViewport();

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(this.shaderProgram.program)
        twgl.setUniforms(this.shaderProgram, {
            u_matrix: this.viewMatrix,
        });
        twgl.setBuffersAndAttributes(gl, this.shaderProgram, this.exampleQuad);
        twgl.drawBufferInfo(gl, this.exampleQuad, gl.TRIANGLES);

        setNormalViewport();

        
        
    }

}