/*
	All comments are for HW3 for CSE470
*/

//webGL global variables
var gl;
var canvas;
var program;

//matrices
var worldMatrix = mat4();
var viewMatrix = mat4();
var projMatrix = mat4();
var worldUniformLocation;
var viewUniformLocation;
var projUniformLocation;

var ambientProduct;
var diffuseProduct;
var specularProduct;

window.onload = function main()
{
	//setup webGL project
	canvas = document.getElementById('gl-canvas');
	gl = WebGLUtils.setupWebGL(canvas);
	if (!gl)
	{
		alert("WebGL isn't available.");
	}
	gl.viewport(0, 0, canvas.width, canvas.height);
	//gl.enable(gl.CULL_FACE);
	//gl.frontFace(gl.CW);

	program = initShaders(gl, 'vertex-shader', 'fragment-shader');
	gl.useProgram(program);

	//create scene objects
	cylinder = new shape(10000, "cylinder"); //cylinder is a new parametric shape with 20 subdivisions
	cylinder.setup();

	cube = new shape(10000, "cone");
	cube.setup();

	light1 = new light(); //new scene light

	//material(ambient, diffuse, specular, shine);
	material1 = new material(vec4(0.0, 0.0, 0.0, 1.0), vec4(0.01, 0.01, 0.01, 1.0), vec4(0.50, 0.50, 0.50, 1.0), 0.25); //black plastic
	material2 = new material(vec4(0.0, 0.05, 0.05, 1.0), vec4(0.4, 0.5, 0.5, 1.0), vec4(0.04, 0.7, 0.7, 1.0), 0.78125); //cyan rubber
	material3 = new material(vec4(0.05375, 0.05, 0.06625, 1.0), vec4(0.18275, 0.17, 0.22525, 1.0), vec4(0.332741, 0.328634, 0.346435, 1.0), 0.3); //obsidian
	material4 = new material(vec4(0.19125, 0.0735, 0.0225, 1.0), vec4(0.7038, 0.27048, 0.0828, 1.0), vec4(0.256777, 0.137622, 0.086014, 1.0), 0.1); //copper
	material5 = new material(vec4(0.24725, 0.1995, 0.0745, 1.0), vec4(0.75164, 0.60648, 0.22648, 1.0), vec4(0.628281, 0.555802, 0.366065, 1.0), 0.4); //gold
	material6 = new material(vec4(0.0, 0.0, 0.0, 1.0), vec4(0.55, 0.55, 0.55, 1.0), vec4(0.7, 0.7, 0.7, 1.0), 0.25); //white plastic

	cylinder.materials.push(material1);
	cylinder.materials.push(material2);
	cylinder.materials.push(material3);
	cube.materials.push(material4);
	cube.materials.push(material5);
	cube.materials.push(material6);

	//project matrices
	worldMatrix = mat4();
	viewMatrix = mat4();
	projMatrix = mat4();
	worldUniformLocation = gl.getUniformLocation(program, 'worldMatrix');
	viewUniformLocation = gl.getUniformLocation(program, 'viewMatrix');
	projUniformLocation = gl.getUniformLocation(program, 'projMatrix');
	//send matrix data to GPU
	gl.uniformMatrix4fv(worldUniformLocation, gl.FALSE, flatten(worldMatrix));
	gl.uniformMatrix4fv(viewUniformLocation, gl.FALSE, flatten(viewMatrix));
	gl.uniformMatrix4fv(projUniformLocation, gl.FALSE, flatten(projMatrix));

	var render = function()
	{
		//clear screen
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.clearColor(0.35, 0.35, 0.35, 1.0);
		gl.enable(gl.DEPTH_TEST);
		gl.depthFunc(gl.LESS);

		//setup camera
		viewMatrix = lookAt([5, 5, 10], [0, 0, 0], [0, 1, 0]);
		viewMatrix = mult(viewMatrix, rotate(90, [0, 0, 1]));
		viewMatrix = mult(viewMatrix, rotate(90, [1, 0, 0]));
		projMatrix = perspective(45, canvas.width / canvas.height, 0.1, 1000.0); //FOV, aspectRatio, projNear, projFar
		worldMatrix = mat4();

		//get HTML button inputs
		getInput();

	    //transform cylinder - - - -   
	    worldMatrix = mult(worldMatrix, translate(0, 0, -2)); //translate matrix
	    worldMatrix = mult(worldMatrix, rotate(cylinder.rotation, cylinder.rotationAxis)); //rotate matrix
	    cylinder.update(); //draw shape

	    //reset world marix
	    worldMatrix = mat4();

	    //transform shape2 - - - -
	    worldMatrix = mult(worldMatrix, translate(0, 0, 2)); //translate matrix
	   	worldMatrix = mult(worldMatrix, rotate(cube.rotation, cube.rotationAxis)); //rotate matrix
	    cube.update(); //draw shape

	    //reset world marix
	    worldMatrix = mat4();

	    //light update
	    light1.update();

		window.requestAnimFrame(render);
	};
	window.requestAnimFrame(render);
}

function getInput()
{
	document.getElementById("whiteLight").onclick = function(){light1.toggleLight();};
	document.getElementById("surfaceRotation").onclick = function()
	{
		cylinder.toggleRotation();
		cube.toggleRotation();
	};
	document.getElementById("lightRotation").onclick = function(){light1.toggleRotation();};
	document.getElementById("cylinderMaterial1").onclick = function(){cylinder.materialIndex = 0;};
	document.getElementById("cylinderMaterial2").onclick = function(){cylinder.materialIndex = 1;};
	document.getElementById("cylinderMaterial3").onclick = function(){cylinder.materialIndex = 2;};
	document.getElementById("shapeMaterial1").onclick = function(){cube.materialIndex = 0;};
	document.getElementById("shapeMaterial2").onclick = function(){cube.materialIndex = 1;};
	document.getElementById("shapeMaterial3").onclick = function(){cube.materialIndex = 2;};
	document.getElementById("lowRes").onclick = function() //delete shapes and replace them with low poly versions
	{
		delete cylinder;
		delete cube;
		cube = new shape(10, "cone");
		cube.setup();
		cylinder = new shape(10, "cylinder");
		cylinder.setup();
		cylinder.materials.push(material1);
		cylinder.materials.push(material2);
		cylinder.materials.push(material3);
		cube.materials.push(material4);
		cube.materials.push(material5);
		cube.materials.push(material6);
	};
	document.getElementById("highRes").onclick = function() //delete shapes and replace them with high poly versions
	{
		delete cylinder;
		delete cube;
		cube = new shape(10000, "cone");
		cube.setup();
		cylinder = new shape(10000, "cylinder");
		cylinder.setup();
		cylinder.materials.push(material1);
		cylinder.materials.push(material2);
		cylinder.materials.push(material3);
		cube.materials.push(material4);
		cube.materials.push(material5);
		cube.materials.push(material6);
	};
	document.getElementById("toggleNormals").onclick = function()
	{
	};
}