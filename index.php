<!DOCTYPE html>
<html lang="en">
<head>

	<title>measureSTL</title>
	<meta charset="utf-8">
	<link rel="stylesheet" type="text/css" href="mainStyle.css">

</head>
<body>

<div id="landing" class="clearfix">
	<span id="welcome">
		<h1> Welcome to measureSTL </h1>
		<p>measureSTL is a tool for viewing and measuring .stl files. All operations are performed within your local browser so your files are never uploaded to the internet.</p>
	</span>
	<div class="fileLoader">
		<div id="fileOpt1" class="fileDiv">
			<input id="getFile" type="file" accept=".stl" onchange="loadSTL(this)">
			<label for="getFile" id="fileField" class="fileOpt">Click to Open File</label>
		</div>
		<h1>OR</h1>
		<div id="fileOpt2" class="fileDiv">
			<span onclick="loadSampleFile()" class="fileOpt"> View Sample File </span>
		</div>
	</div>
</div>
<div id="topBar" class="toolbar">
	<h1>measureSTL </h1>
	<div id="unitsDiv">
		Model Units:
		<select id="UnitsIn" onclick="setUnits(this)" onchange="setUnitsIn(this)">
			<option disabled>Model</option>
			<option value='mm'>Milimeters</option>
			<option value='in'>Inches</option>
		</select>
		<br />
		Displayed Units:
		<select id="UnitsOut" onclick="setUnits(this)" onchange=" setUnitsOut(this)">
			<option disabled>Displayed</option>
			<option value='mm'>Milimeters</option>
			<option value='in'>Inches</option>
		</select>
	</div>
	<div id="toolGroup" >
		<input class="toolBtns" type="image" src="assets/BTN_meshOFF.png" onclick='toggleMaterial(this)'/>
		<input class="toolBtns" type="image" src="assets/BTN_boxOFF.png" onclick='toggleBox(this)'/>
		<input class="toolBtns" type="image" src="assets/BTN_controlON.png" onclick='controlToggle(this)'/>
		<input class="toolBtns" type="image" src="assets/BTN_measureON.png" onclick='toggleMeasure(this)'/>
		<input class="toolBtns" type="image" src="assets/BTN_selectOFF.png" onclick='toggleSelect(this)'/>
		
	</div>

</div>
<div id="viewer"></div>
<div id="readout" class="dimensions">
	<h3>Dimensions</h3>
	<div id="Xdim"></div>
	<div id="Ydim"></div>
	<div id="Zdim"></div>
	<div id="Mdim"></div>
	<div>
		Surface Area:
		<div id="Sarea"></div>
		<div id="selectedSarea"></div>
	</div>
</div>

<div id="footer">
Created by Forrest McBride using THREE.js
</div>

	



<script src="build/three.js"></script>
<script src="js/loaders/STLLoader.js"></script>
<script src="js/Detector.js"></script>
<script src="js/libs/stats.min.js"></script>
<script src="js/renderers/CanvasRenderer.js"></script>
<script src="js/controls/OrbitControls.js"></script>
<script src="js/controls/TrackballControls.js"></script>
<script src="js/master.js"></script>

</body>
</html>
