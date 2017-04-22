function shape(subdivisions, type) //polygon shape
{
	this.subdivisions = subdivisions;
	this.topVertices = [];
	this.bottomVertices = [];
	this.sideVertices = [];
	this.topNormals = [];
	this.bottomNormals = [];
	this.sideNormals = [];
	this.topData = [];
	this.bottomData = [];
	this.sideData = [];

	this.materials = []; //each object holds three materials that they can cycle through
	this.materialIndex = 0;
	this.material = this.materials[this.materialIndex];
	this.texture; //not applicable to this project, but this is where it would go if we were doing texturing

	this.xAxis = 0;
	this.yAxis = 1;
	this.zAxis = 0;
	this.rotation = 0;
	this.rotationSpeed = 0;
	this.rotationAxis = [0, 1, 0];
	this.rotationMatrix = mat4();

	this.setup = function()
	{
		this.createVertices();
		this.createNormals();
		this.packData();
		this.bindBuffers();
	}

	this.createVertices = function()
	{
		var t = ((Math.PI / 180) * (360 / this.subdivisions));
		for (var i = 0; i <= this.subdivisions + 1; i++) //the last vertex created is the same as the
		{											//first vertex in order to complete the circle.
			x = Math.cos(t * i);
			z = Math.sin(t * i);

			if(z > 0){if(z < 0.001){z = 0;}} //prevent ridiculously small numbers
			else{if(z > -0.001){z = 0;}} //and just set them equal to 0
			if(x > 0){if(x < 0.001){x = 0;}}
			else{if(x > -0.001){x = 0;}}

			if (type == "cylinder")
			{
				this.topVertices.push(vec3(x, -1, z)); //top face vertices
				this.sideVertices.push(vec3(x, -1, z)); //side vertices along the top
				this.sideVertices.push(vec3(x, 1, z)); //side vertices along the bottom
				this.bottomVertices.push(vec3(x, 1, z)); //bottom face vertices
			}
			else if (type == "cone")
			{
				this.topVertices.push(vec3(0, 1, 0));
				this.sideVertices.push(vec3(0, 1, 0));
				this.sideVertices.push(vec3(x, -1, z));
				this.bottomVertices.push(vec3(x, -1, z));
			}
		}
		if (type == "cylinder")
		{
			/*this.topVertices.push(vec3(x, -1, z)); //top face vertices
			this.sideVertices.push(vec3(x, -1, z)); //side vertices along the top
			this.sideVertices.push(vec3(x, 1, z)); //side vertices along the bottom
			this.bottomVertices.push(vec3(x, 1, z)); //bottom face vertices*/
		}
		else if (type == "cone")
		{
			this.topVertices.push(vec3(0, 1, 0));
			this.sideVertices.push(vec3(0, 1, 0));
			this.sideVertices.push(vec3(Math.cos(0), -1, Math.sin(0)));
			this.bottomVertices.push(vec3(Math.cos(0), -1, Math.sin(0)));
		}
	}

	this.createNormals = function()
	{
		//top normals
		for (var i = 0; i < this.subdivisions; i++)
		{
			this.topNormals.push(vec3(0, -1, 0));
		}

		//bottom normals
		for (var i = 0; i < this.subdivisions; i++)
		{
			this.bottomNormals.push(vec3(0, 1, 0));
		}

		//side normals
		for (var i = 0; i < (this.subdivisions * 2); i++)
		{
			var t1 = subtract(this.sideVertices[i + 1], this.sideVertices[i]);
			var t2 = subtract(this.sideVertices[i + 2], this.sideVertices[i + 1]);
			var normal = cross(t1, t2);
			var normal = vec3(normal);
			normal = normalize(normal);
			this.sideNormals.push(normal);
		}
	}

	this.packData = function()
	{
		//split up the components of each vector before pushing the data
		//combine top 
		for(var i = 0; i < this.subdivisions; i++){
			for(var j = 0; j < 3; j++){this.topData.push(this.topVertices[i][j]);}
			for (var j = 0; j < 3; j++){this.topData.push(this.topNormals[i][j]);}}
		//combine bottom
		for(var i = 0; i < this.subdivisions; i++){
			for(var j = 0; j < 3; j++){this.bottomData.push(this.bottomVertices[i][j]);}
			for(var j = 0; j < 3; j++){this.bottomData.push(this.bottomNormals[i][j]);}}
		//combine sides
		for(var i = 0; i < (this.subdivisions * 2); i++){
			for(var j = 0; j < 3; j++){this.sideData.push(this.sideVertices[i][j]);}
			for(var j = 0; j < 3; j++){this.sideData.push(this.sideNormals[i][j]);}}
	}

	this.bindBuffers = function()
	{
		this.topBuffer;
		this.bottomBuffer;
		this.sideBuffer;

		//for this project, each polygon is defined by a front face, a back face, and a series of side faces
		//buffer for top
		this.topBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.topBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.topData), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		//buffer for bottom
		this.bottomBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bottomBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.bottomData), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);

		//buffer for side
		this.sideBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, this.sideBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(this.sideData), gl.STATIC_DRAW);
		gl.bindBuffer(gl.ARRAY_BUFFER, null);
	}

	this.draw = function()
	{
		//draw top
		gl.bindBuffer(gl.ARRAY_BUFFER, this.topBuffer);
		vPosition = gl.getAttribLocation(program, 'vPosition');
		gl.vertexAttribPointer(
			vPosition,
			3,
			gl.FLOAT,
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT,
			0 * Float32Array.BYTES_PER_ELEMENT
		);
		gl.enableVertexAttribArray(vPosition);

		vNormal = gl.getAttribLocation(program, 'vNormal');
		gl.vertexAttribPointer(
			vNormal,
			3,
			gl.FLOAT, 
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT
		);
		gl.enableVertexAttribArray(vNormal);

		gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, flatten(worldMatrix));
		gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, flatten(viewMatrix));
		gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, flatten(projMatrix));

		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.topData.length / 6);

		//draw bottom
		gl.bindBuffer(gl.ARRAY_BUFFER, this.bottomBuffer);
		vPosition = gl.getAttribLocation(program, 'vPosition');
		gl.vertexAttribPointer(
			vPosition,
			3,
			gl.FLOAT,
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT,
			0 * Float32Array.BYTES_PER_ELEMENT
		);
		gl.enableVertexAttribArray(vPosition);

		vNormal = gl.getAttribLocation(program, 'vNormal');
		gl.vertexAttribPointer(
			vNormal,
			3,
			gl.FLOAT, 
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT
		);
		gl.enableVertexAttribArray(vNormal);

		gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, flatten(worldMatrix));
		gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, flatten(viewMatrix));
		gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, flatten(projMatrix));

		gl.drawArrays(gl.TRIANGLE_FAN, 0, this.bottomData.length / 6);

		//
		//draw the sides of the cylinder - - - - -
		//
		gl.bindBuffer(gl.ARRAY_BUFFER, this.sideBuffer);
		vPosition = gl.getAttribLocation(program, 'vPosition');
		gl.vertexAttribPointer(
			vPosition,
			3,
			gl.FLOAT,
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT,
			0 * Float32Array.BYTES_PER_ELEMENT
		);
		gl.enableVertexAttribArray(vPosition);

		vNormal = gl.getAttribLocation(program, 'vNormal');
		gl.vertexAttribPointer(
			vNormal,
			3,
			gl.FLOAT, 
			gl.FALSE,
			6 * Float32Array.BYTES_PER_ELEMENT,
			3 * Float32Array.BYTES_PER_ELEMENT
		);
		gl.enableVertexAttribArray(vNormal);

		gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, flatten(worldMatrix));
		gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, flatten(viewMatrix));
		gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, flatten(projMatrix));

		gl.drawArrays(gl.TRIANGLE_STRIP, 0, this.subdivisions * 2);

		//lighting and materials
	    ambientProduct = mult(light1.lightAmbient, this.material.materialAmbient);
	    diffuseProduct = mult(light1.lightDiffuse, this.material.materialDiffuse);
	    specularProduct = mult(light1.lightSpecular, this.material.materialSpecular);
	    //send light and material data to GPU
	    gl.uniform4fv(gl.getUniformLocation(program, "ambientProduct"), flatten(ambientProduct));
	    gl.uniform4fv(gl.getUniformLocation(program, "diffuseProduct"), flatten(diffuseProduct));
	    gl.uniform4fv(gl.getUniformLocation(program, "specularProduct"), flatten(specularProduct));	
	    gl.uniform4fv(gl.getUniformLocation(program, "lightPosition"), flatten(light1.lightPosition));
	    gl.uniform1f(gl.getUniformLocation(program, "shininess"), this.material.materialShininess);
	}

	this.update = function()
	{
		this.rotation += this.rotationSpeed;
		this.rotationAxis = [this.xAxis, this.yAxis, this.zAxis];
		this.material = this.materials[this.materialIndex];
		this.draw();
	}

	this.toggleRotation = function()
	{
		if (this.rotationSpeed == 0)
		{
			this.rotationSpeed = Math.random() * 10;
			this.xAxis = Math.random();
			this.yAxis = Math.random();
			this.zAxis = Math.random();
		}
		else
		{
			this.rotationSpeed = 0;
		}
	}
}

function light() //scene light
{
	this.rotating = 0;
	this.xPos = 2.0;
	this.yPos = -2.0;
	this.zPos = 2.0;
	this.rotationSpeed = 1;
	this.whiteLight = 0;
	this.lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
	this.lightPosition = vec4(this.xPos, this.yPos, this.zPos, 0.0); 
	this.lightDiffuse = vec4(1.0, 1.0, 1.0, 1.0);
	this.lightSpecular = vec4(1.0, 1.0, 1.0, 1.0);

	this.toggleLight = function()
	{
		if (this.whiteLight == 0) //turn on the white light
		{
			this.lightAmbient = vec4(1.0, 1.0, 1.0, 1.0);
			this.whiteLight = 1;
		}
		else //reset light to set properties
		{
			this.lightAmbient = vec4(0.2, 0.2, 0.2, 1.0);
			this.whiteLight = 0;
		}
	}

	this.toggleRotation = function()
	{
		if (this.rotating == 0)
		{
			this.rotating = 1;
		}
		else
		{
			this.rotating = 0;
			this.lightPosition = vec4(2.0, -2.0, 2.0, 0.0);
		}
	}

	this.update = function()
	{
		if (this.rotating == 1)
		{
			this.rotationSpeed += 1;
			i = this.rotationSpeed;
			var t = ((Math.PI) / 360);
			y = Math.cos(t * i) * 10;
			z = Math.sin(t * i) * 10;

			if(z > 0){if(z < 0.001){z = 0;}} //prevent ridiculously small numbers
			else{if(z > -0.001){z = 0;}} //and just set them equal to 0
			if(y > 0){if(y < 0.001){y = 0;}}
			else{if(y > -0.001){y = 0;}}

			this.lightPosition = vec4(2.0, y, z, 0.0);
		}
	}
}

function material(amb, diff, spec, shine) //polygon material
{
	this.materialAmbient = amb;
	this.materialDiffuse = diff;
	this.materialSpecular = spec;
	this.materialShininess = shine;
}