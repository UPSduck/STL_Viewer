


/* ////////////////////////////////////////////////

			#   #	 ###	####	 ####
			#   #	#   #	#   #	#
			#   #	#####	####	 ###
			 # #	#   #	#   #	    #
			  #		#   #	#   #	####

/////////////////////////////////////////////////// */

//Scene Globals
var scene, 		//THREE.js Scene 
	camera, 	//THREE.js Camera
	controls, 	//THREE.js Controls
	renderer, 	//THREE.js Renders
	axisHelper;

//Scene Resources
var material = [	//THREE.js materials array
    	new THREE.MeshBasicMaterial( {  //material[0] Model Wireframe
	    	color: 0xffffff, 
	    	wireframe: true,
	    	depthWrite:true
	    }),
    	new THREE.MeshLambertMaterial( { //material[1] Model Solid
		    color: 0x99ffff,
		    depthWrite:true,
		    vertexColors:THREE.FaceColors,
	    }),
	    new THREE.MeshBasicMaterial({	//material[2] MeasureTool
		    color: 0xFFFF00,
		    depthWrite: false,
		    depthTest: false
	  	}), 
  	], 
		light = [],
	model = new THREE.Mesh(		//MODEL import geometry container
    	new THREE.BoxGeometry( 1, 1, 1 ), 
    	material[1] 
	),
	envelope = new THREE.Box3().setFromObject( model ),
	boundry = new THREE.BoxHelper( envelope, 0xff0000 );

boundry.visible = false;




// Dimensions
var Xdim, 		//Part Envelope X
	Ydim, 		//Part Envelope Y
	Zdim, 		//Part Envelope Z
	Mdim, 		//Measure Tool Length
	Sarea,		//Total Part surface Area
	UnitIn= 	//Units of measure for imported Part
		document.getElementById('UnitsIn').value,
	UnitOut=	//Units of Measure Displayed
		document.getElementById('UnitsOut').value,
	S; 			//Scene Scale adjustment to imported Model


//Measure Tool
var	measureTool = true,					//Toggle TEMP USE
	pointA = new THREE.Vector3( 0, 0, 0 ),
	pointB = new THREE.Vector3(),
	markerA, 		//Measurement Start
	markerB, 		//Measurement End
	line;			//Measurement Line

//Select Faces
var selectedFaces=[],
	selectedSarea,
	selectTool=false;
	


/* ////////////////////////////////////////////////////

			#####	#   #	#   # 	 ###
			#		#   #	##  # 	#   #
			####	#   #	# # # 	#
			#		#   #	#  ## 	#   #
			#		 ###	#   # 	 ###

//////////////////////////////////////////////////// */


function loadSTL(thisInput){
	if(document.getElementById('getFile').value){
        loader = new THREE.STLLoader();
        thisFile = thisInput.files[0];
        reader = new FileReader();
        reader.onload = function(e){
        	document.getElementById('landing').style.display="none";
        	model['geometry'] = new THREE.Geometry().fromBufferGeometry(loader.parseBinary(reader.result));
        	centerPosition(model);
        	envelope.setFromObject(model);
        	boundry.update(envelope); 
        	GetBoundryDimensions();
        	calculateSurfaceArea(model['geometry']);
        	if(!scene){
        		init();
				animate();
			}
			normalizeSceneScale();
        }
        reader.readAsArrayBuffer(thisFile);
        
    }
    else{alert('OPPS! Error loading file!')}
}
function loadSampleFile(){
	var loader = new THREE.STLLoader();
	loader.load( 'Samples/monkey.stl', function (geo){
		model.geometry = new THREE.Geometry().fromBufferGeometry(geo);
		//model.geometry.attributes.position.needsUpdate = true;
		centerPosition(model);
    	envelope.setFromObject(model);
    	boundry.update(envelope); 
    	GetBoundryDimensions();
    	calculateSurfaceArea(model['geometry']);
    	if(!scene){
    		init();
			animate();
		}
		normalizeSceneScale();
		document.getElementById('landing').style.display="none";
	})
}
function init() {
    scene = new THREE.Scene();

    //SET CAMERA
    camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 10000 );
    controls = new THREE.TrackballControls(camera);
    controls.rotateSpeed = 3;
    camera.up.set( 0, 0, 1 );
	camera.position.x = 250;
	camera.position.y = 250;
	camera.position.z = 0;

    //Guides
    axisHelper = new THREE.AxisHelper( 200 );

   	markerA = new THREE.Mesh( 
   		new THREE.SphereGeometry( 2, 12, 12 ), 
   		material[2]
   	);
	markerB = markerA.clone();
	


    //SET LIGHT
    light[0] = new THREE.AmbientLight(0x404040);
    light[1] = new THREE.DirectionalLight(0xffffdd,0.8);
    light[1].position.set(3, 5, -2).normalize();
    light[2] = new THREE.DirectionalLight(0xccccff,0.3);
    light[2].position.set(-5, -2, 1).normalize();


    model.geometry.dynamic = true;

    scene.add( light[0] );
    scene.add( light[1] );
    scene.add( light[2] );
    scene.add(axisHelper);
    scene.add(  boundry );
    scene.add(  markerA );
	scene.add(  markerB );
	scene.add(  model   );

    setRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );

    document.getElementById('viewer').appendChild( renderer.domElement );
    renderer.render( scene, camera );
    document.addEventListener('mousedown', onDocumentMouseDown, false);
	window.addEventListener('resize', onWindowResize, false);
}
function animate() {

    requestAnimationFrame( animate );
    controls.update();
    renderer.render( scene, camera );
}

function centerPosition(mesh){
	envelope.setFromObject(model);
	function center(min,max){
		var lowEnd = min;
		var highEnd = max;
		var offset='';
		var addHalf =(lowEnd+highEnd)/2;
		if(lowEnd<0 && 0<highEnd){
			console.log("split");
			offset = addHalf
		}else if(0<lowEnd){
			console.log("greater");
			offset = addHalf+lowEnd
		}else if(highEnd<0){
			console.log("lower");
			offset = addHalf+highEnd
		};
		console.log("min:"+lowEnd+" max:"+highEnd+" offset"+offset);
		return (offset*-1)
	}
	var xOffset = center(envelope.min.x,envelope.max.x);
	var yOffset = center(envelope.min.y,envelope.max.y);
	var zOffset = center(envelope.min.z,envelope.max.z);
	console.log(xOffset,yOffset,zOffset);
	mesh.position.set(xOffset,yOffset,zOffset);
}
function webglAvailable() {
	try {
		var canvas = document.createElement( 'canvas' );
		return !!( window.WebGLRenderingContext && (
			canvas.getContext( 'webgl' ) ||
			canvas.getContext( 'experimental-webgl' ) )
		);
	} catch ( e ) {
		return false;
	}
}
function setRenderer(){
	if ( webglAvailable() ) {
		renderer = new THREE.WebGLRenderer();
	} else {
		renderer = new THREE.CanvasRenderer();
		alert("WARNING! \n WebGL not supported. A slower Canvas Render will be used");
	}
}
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
}
function normalizeSceneScale(){
	S=((Xdim+Ydim+Zdim)/3)/100;
	camera.position.x = 250*S;
	camera.position.y = 250*S;
	camera.position.z = 0; //250*S;

	markerA.scale.set(S,S,S);
	markerB.scale.set(S,S,S);
	axisHelper.scale.set(S,S,S);
}

/* ########################
	UNITS & DIMENSIONS
########################## */

function UnitsOfLength (number,unitsInCode,unitsOutCode){ //WIP
	var standardLengthUnits = 
		//Listed Short to Long
		[["code", "th",     "l", "in","ft","yd","ch","fur","ml","lea"], 
		 ["name", "thou","line", "inch","foot","yard","chain","furlong","mile","league"],
		 //Ratio Next unit down
		 ["rate",  NaN,  1000/12,   12,  12,   3,  22,   10,   8,   3,]
		];
	var metricLengthUnits = 
		[["code", "mm","cm","dm","m","km"],
		 ["name","milimeter","centimeter","decimeter","meter","kilometer"]];
	for(i=0;standardLengthUnits[0].length>i;i++){

	}

}

function convertUnits(number){
	var thisNum = number;
	if(UnitIn=='in' && UnitOut=='mm'){
		thisNum=thisNum*25.4;
	}
	else if (UnitIn=='mm'&&UnitOut=='in'){
		thisNum=thisNum*0.0393701;
	}
	else if (UnitIn=='mm'&&UnitOut=='cm'){
		thisNum=thisNum*.01;
	}
	else if (UnitIn=='cm'&&UnitOut=='mm'){
		thisNum=thisNum*10;
	}

	



	return RoundToNearest(thisNum, 2);
}
function setUnits(event){
	if(controls.enabled == true){
		controls.enabled = false;
		event.click();
	};
	thisDiv = document.getElementById("unitsDiv");
	event.onblur = function(){
		controls.enabled = true;
	};

	//thisDiv.className = "active";
}
function setUnitsIn(event){
	UnitIn=event.value;
	GetBoundryDimensions();
}
function setUnitsOut(event){
	UnitOut=event.value;
	GetBoundryDimensions();
	document.getElementById('Sarea').innerHTML = 
	"Total: "+
	convertUnits(Sarea)+UnitOut+"\u00B2";
}

function calculateSurfaceArea( geometry ){
	tempGeo = geometry;
	Sarea = 0;
	var a, b, c;
    var v0 = new THREE.Vector3();
	var v1 = new THREE.Vector3();
	for(i=0;i<tempGeo.faces.length;i++){
		
		a=tempGeo.vertices[tempGeo.faces[i].a];
    	b=tempGeo.vertices[tempGeo.faces[i].b];
    	c=tempGeo.vertices[tempGeo.faces[i].c];
    	v0.subVectors( c, b );
		v1.subVectors( a, b );

        Sarea += v0.cross( v1 ).length() * 0.5;	
	}
	document.getElementById('Sarea').innerHTML = "Total: "+
	convertUnits(Sarea)+UnitOut+"\u00B2";
}

function calculateSelectedSurfaceArea( geometry ){
	tempGeo = geometry;
	selectedSarea = 0;
	var a, b, c;
    var v0 = new THREE.Vector3();
	var v1 = new THREE.Vector3();

	for(i=0;i<tempGeo.faces.length;i++){
		if(tempGeo.faces[i].selected==true){
			a=tempGeo.vertices[tempGeo.faces[i].a];
        	b=tempGeo.vertices[tempGeo.faces[i].b];
        	c=tempGeo.vertices[tempGeo.faces[i].c];
        	v0.subVectors( c, b );
			v1.subVectors( a, b );
	        selectedSarea += v0.cross( v1 ).length() * 0.5;	
	    }
	}
	document.getElementById('selectedSarea').innerHTML = "Selected: "+
	convertUnits(selectedSarea)+UnitOut+"\u00B2";
}


function GetBoundryDimensions(){
	Xdim = envelope.size()['x'];
	Ydim = envelope.size()['y'];
	Zdim = envelope.size()['z'];

	document.getElementById('Xdim').innerHTML = 
		"X : "+convertUnits(Xdim)+UnitOut;
	document.getElementById('Ydim').innerHTML = 
		"Y : "+convertUnits(Ydim)+UnitOut;
	document.getElementById('Zdim').innerHTML = 
		"Z : "+convertUnits(Zdim)+UnitOut;
}

function getLongestSide(){
	longest = envelope.size()['x'];
	if(envelope.size()['y']>longest){
		longest = envelope.size()['y'];
	}
	else if(envelope.size()['z']>longest){
		longest = envelope.size()['z'];
	}
	return longest;
}
function RoundToNearest(input, decimalPlace){
	dp = 10^decimalPlace;
	return Math.round(input*dp)/dp;
}


	/* ########################
	BUTTONS / GUI TOOLS
########################## */
function toggleMaterial( event){
	if(model['material'] == material[0]){
		model['material'] = material[1];
		event.src="assets/BTN_meshOFF.png"
	}
	else{
		model['material'] = material[0];
		event.src="assets/BTN_meshON.png"
	}
}
function toggleBox(event){
	
	if(boundry.visible == true){
		boundry.visible = false;
		event.src="assets/BTN_boxOFF.png"
	}
	else{
		boundry.visible = true;
		event.src="assets/BTN_boxON.png"
	}
}
function controlToggle( event) {
	if(controls.enabled == true){
		controls.enabled = false;
		event.src="assets/BTN_controlOFF.png"
	}
	else{
		controls.enabled = true;
		event.src="assets/BTN_controlON.png"
	}
}

function toggleMeasure( event ){

	if(measureTool==true){
		measureTool=false;
		scene.remove( line );
		markerA.visible = false;
		markerB.visible = false;
		event.src="assets/BTN_measureOFF.png"
	}
	else{
		measureTool=true;
		markerA.position.set();
		markerB.position.copy(markerA);
		markerA.visible = true;
		markerB.visible = true;
		event.src="assets/BTN_measureON.png"
	}
}

function toggleSelect( event ){
	if(selectTool==true){
		selectTool=false;
		event.src="assets/BTN_selectOFF.png"
	}
	else{
		selectTool=true;
		event.src="assets/BTN_selectON.png"

		//Disable Measure
		measureTool=false;
		scene.remove( line );
		markerA.visible = false;
		markerB.visible = false;
	}
}


//measure tool functions
function getIntersections( event ) {
  var vector = new THREE.Vector2();

  vector.set(
    ( event.clientX / window.innerWidth ) * 2 - 1,
    - ( event.clientY / window.innerHeight ) * 2 + 1 );

  var temp = [model];

  var raycaster = new THREE.Raycaster();
  raycaster.setFromCamera( vector, camera );	
  var intersects = raycaster.intersectObjects( temp );
  
  return intersects;
}
function getLine( vectorA, vectorB ) {

  var geometry = new THREE.Geometry();
  geometry.vertices.push( vectorA );
  geometry.vertices.push( vectorB );
  var material = new THREE.LineBasicMaterial({
    color: 0xFFFF00,
    depthWrite: false,
    depthTest: false
  });
  line = new THREE.Line( geometry, material );
  return line;
}

function onDocumentMouseMove( event ) 
{
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

function onDocumentMouseDown( event ) {

  if(measureTool == true){
  		measurementTool(event);
	}
  else if(selectTool==true){
	  	selectSurfacesTool(event);
  	}
}
function measurementTool( event ){
	var intersects = getIntersections( event );

  if( intersects.length > 0 ){

    if ( ! pointB.equals( pointA ) ) {
      pointB = intersects[ 0 ].point;
    } else {
      pointB = pointA;
    }
    pointA = intersects[ 0 ].point;
    markerA.position.copy( pointA );
    markerB.position.copy( pointB );
    
    var distance = pointA.distanceTo( pointB );
    
    if ( line instanceof THREE.Line ) {
      scene.remove( line );
    }
    if ( distance > 0 ) {
      document.getElementById('Mdim').innerHTML = 
		"Measurement: "+convertUnits(distance)+UnitOut;
		line = getLine( pointA, pointB );
      scene.add(line);
    }

  }
}

function selectSurfacesTool( event ){

	/* 
	Special thanks to Seth Moczydlowski's tutorial 
	http://moczys.com/2014/01/09/three-js-experiment-2-selectionhighlighting/
	*/

	// var selectedFaces[]

	var intersects = getIntersections( event );
  	if( intersects.length > 0 ){ // If Face Selected
  		if(intersects[0].face.selected==null ||
  		   intersects[0].face.selected==false){
  			intersects[0].face.selected=true;
			intersects[0].face.color.setHex( 0xff00ff );	
		}	
		else{
  			intersects[0].face.selected=false;
			intersects[0].face.color.setHex( 0xffffff );
		}

		// upsdate mouseSphere coordinates and update colors
		calculateSelectedSurfaceArea(model['geometry']);
		intersects[0].object.geometry.colorsNeedUpdate=true;
	}
}

