import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';



function lerp(start, end, amt) {
	return (1 - amt) * start + amt * end
}

function inverseLerp(start, end, amt) {
	return (amt - start) / (end - start);
}

function clamp(num, min, max) {
	return Math.min(Math.max(num, min), max);
};



console.log(THREE);


let mapScene = new THREE.Scene();
let mapContainer = document.getElementById("map-container");
let mapTargetWidth = mapContainer.clientWidth;
let mapTargetHeight = window.innerHeight;

let panelScene = new THREE.Scene();
let panelContainer = document.getElementById("panel-container");
let panelTargetWidth = panelContainer.clientWidth;
let panelTargetHeight = window.innerHeight;

let monitorScene = new THREE.Scene();
let monitorWidth = 256;
let monitorHeight = monitorWidth;
monitorScene.background = new THREE.Color(0xff0000);

let mapCamera = new THREE.PerspectiveCamera(75, mapTargetWidth / mapTargetHeight, 0.1, 7000);
let panelCamera = new THREE.PerspectiveCamera(75, panelTargetWidth / panelTargetHeight, 0.1, 7000);
let monitorCamera = new THREE.OrthographicCamera();

mapCamera.position.z = 1000 * (mapTargetHeight / mapTargetWidth);


let panelCameraZoomFactor = 300;
panelCamera.position.x = 0;
panelCamera.position.y = 300;
panelCamera.position.z = panelCameraZoomFactor * (panelTargetHeight / panelTargetWidth);

panelScene.background = new THREE.Color(0xff00ff);


let mapRenderer = new THREE.WebGLRenderer();
mapRenderer.setSize(mapTargetWidth, mapTargetHeight);
mapContainer.appendChild(mapRenderer.domElement);

let panelRenderer = new THREE.WebGLRenderer();
panelRenderer.setSize(panelTargetWidth, panelTargetHeight);
panelContainer.appendChild(panelRenderer.domElement);



let monitorScreenTexture = new THREE.WebGLRenderTarget(monitorWidth, monitorHeight);
let monitorScreenMaterial = new THREE.MeshBasicMaterial({ map: monitorScreenTexture.texture });


//let monitorRenderer = new THREE.WebGLRenderer();
//monitorRenderer.setSize(monitorWidth, monitorHeight);
//document.body.appendChild(monitorRenderer.domElement);



//let controls = new OrbitControls(panelCamera, panelRenderer.domElement);


let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(1, 1);



let loader = new FBXLoader();


function PushConnections(boxName, connectionNames) {

	for (let i = 0; i < connectionNames.length; i++) {

		let currentName = connectionNames[i];

		boxes[boxName].connections[currentName] = boxes[currentName];

	}


}

function CreateBoxNode(name, box, connections) {

	return {
		name: name,
		box: box,
		connections: connections
	};

}

function CreateButtonNode(name, button) {

	return {

		name: name,
		button: button

	}

}

function GetButtonName(button) {
	let buttonName = button.name.replace("button-", "");
	return buttonName;
}

let NAMES = {

	upperLeft: "upper-left",
	upperMiddle: "upper-middle",
	upperRight: "upper-right",

	middleLeft: "middle-left",
	middleMiddle: "middle-middle",
	middleRight: "middle-right",

	lowerLeft: "lower-left",
	lowerMiddle: "lower-middle",
	lowerRight: "lower-right"

};

let boxes = {};
let clickableModels = [];

let buttons = [];
let buttonNodes = {};



let mapGeometry = loader.load("../models/object_test_buttons.fbx", function(o) {
	console.log(o);

	let models = o.children;


	for (let i = 0; i < models.length; i++) {

		let currentModel = models[i];
		currentModel.material = new THREE.MeshBasicMaterial({ color: currentModel.material.color });

		if (currentModel.name.includes("button")) {

			let buttonName = GetButtonName(currentModel);
			buttonNodes[buttonName] = CreateButtonNode(buttonName, currentModel);
			buttons.push(currentModel);

		} else if (currentModel.name.charAt(0) !== "_") {
			boxes[currentModel.name] = CreateBoxNode(currentModel.name, currentModel, {});
			clickableModels.push(currentModel);
		}

	}


	PushConnections(NAMES.upperLeft, [NAMES.upperMiddle, NAMES.middleLeft]);
	PushConnections(NAMES.upperMiddle, [NAMES.upperLeft, NAMES.upperRight, NAMES.middleMiddle])
	PushConnections(NAMES.upperRight, [NAMES.upperMiddle])

	PushConnections(NAMES.middleLeft, [NAMES.upperLeft, NAMES.lowerLeft])
	PushConnections(NAMES.middleMiddle, [NAMES.upperMiddle, NAMES.middleRight, NAMES.lowerMiddle])
	PushConnections(NAMES.middleRight, [NAMES.middleMiddle, NAMES.lowerRight])

	PushConnections(NAMES.lowerLeft, [NAMES.middleLeft])
	PushConnections(NAMES.lowerMiddle, [NAMES.middleMiddle, NAMES.lowerRight])
	PushConnections(NAMES.lowerRight, [NAMES.lowerMiddle, NAMES.middleRight])

	targetNode = boxes["middle-middle"];
	targetPanel = "middle-middle";
	//HideAllPanels();

	startingPosition.x = cube.position.x;
	startingPosition.y = cube.position.y;

	targetPosition.x = targetNode.box.position.x;
	targetPosition.y = -targetNode.box.position.z;
	currentTransitionTime = 0;



	o.rotation.x = Math.PI / 2;

	mapScene.add(o);

});


let panelGeometry = loader.load("../models/cctv_test.fbx", function(o) {
	console.log("panel");
	console.log(o);

	let defaultMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff) });

	let children = o.children;

	for (let i = 0; i < children.length; i++) {

		let currentChild = children[i];

		switch (currentChild.name) {

			case ("Camera"): {


			} break;

			case ("monitor_screen"): {

				currentChild.material = monitorScreenMaterial;
				console.log(currentChild);

			} break;


			default: {

				currentChild.material = defaultMat;


			} break;


		};

	}

	o.rotation.y = -Math.PI / 2;
	panelScene.add(o);

});





let cube_geometry = new THREE.BoxGeometry(25, 25, 25);
let material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
let cube = new THREE.Mesh(cube_geometry, material);
cube.position.y = 10;
mapScene.add(cube);


function HideAllPanels() {

	//TODO: THIS WAS MADE TO SUPPORT MORE "DISPLAY" CLASSES.  EITHER IMPLEMENT MORE "DISPLAY" CLASSES OR REMOVE THIS

	let currentPanels = document.getElementsByClassName("display");

	for (let i = 0; i < currentPanels.length; i++) {

		let classesToRemove = [];

		for (let j = 0; j < currentPanels[i].classList.length; j++) {

			if (currentPanels[i].classList[j].includes("display")) {

				classesToRemove.push(currentPanels[i].classList[j]);
				console.log(currentPanels[i].classList[j]);

			}

		}

		currentPanels[i].classList.remove(...classesToRemove);

	}

}


function DisplayPannel(panelId) {


	let panel = document.getElementById(panelId);

	panel.classList.add("display");
	//panel.classList.add("display-" + panelId);


}


function OnMouseMove(e) {


	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

}

let targetPath = [];

let targetPosition = new THREE.Vector2(cube.position.x, cube.position.y);
let startingPosition = new THREE.Vector2(cube.position.x, cube.position.y);
let targetPanel = "";
let activeNode = null;
let targetNode = null;

let pathCap = 6;

//NOTE: to start send in currentNode in array
function FindPaths(target, path) {

	let results = [];

	let currentNode = path[path.length - 1];

	if (path.length > pathCap) {

		return results;

	}


	for (let key in currentNode.connections) {

		let seekingNode = currentNode.connections[key];
		let currentPath = [...path, seekingNode];

		if (seekingNode === target) {
			results.push(currentPath);
			return results;
		}


		//NOTE: check to see if connection isnt previous node;
		if ((path.length >= 2 && path[path.length - 2] !== seekingNode) || path.length === 1) {

			let foundPaths = FindPaths(target, currentPath);

			for (let i = 0; i < foundPaths.length; i++) {

				if (foundPaths[i].length > 0) {

					results.push(foundPaths[i]);

				}

			}

		}

	}

	return results;

}


function FindPathFromNode(node) {
	if (node && node !== activeNode) {

		if (activeNode === null || node.name in activeNode.connections) {

			targetNode = node;
			targetPanel = targetNode.name;
			//HideAllPanels();

			startingPosition.x = cube.position.x;
			startingPosition.y = cube.position.y;

			targetPosition.x = targetNode.box.position.x;
			targetPosition.y = -targetNode.box.position.z;
			currentTransitionTime = 0;

		} else if (!(node.name in activeNode.connections)) {

			let paths = FindPaths(node, [activeNode]);
			let currentPath = [];

			for (let i = 0; i < paths.length; i++) {

				if (currentPath.length === 0 || paths[i].length < currentPath.length) {

					currentPath = paths[i];

				}

			}

			currentPath.reverse();
			currentPath.pop();

			targetPath = currentPath;

			targetNode = targetPath.pop();
			targetPanel = targetNode.name;
			//HideAllPanels();

			startingPosition.x = cube.position.x;
			startingPosition.y = cube.position.y;

			targetPosition.x = targetNode.box.position.x;
			targetPosition.y = -targetNode.box.position.z;
			currentTransitionTime = 0;



			console.log(paths);
			console.log(currentPath);
			console.log(targetNode);


		}
	}
}


function OnPointerDown(e) {

	if (e.srcElement === mapRenderer.domElement) {
		console.log("map");

		mouse.x = (e.clientX / mapTargetWidth) * 2 - 1;
		mouse.y = - (e.clientY / mapTargetHeight) * 2 + 1;

		raycaster.setFromCamera(mouse, mapCamera);


		let intersectsButton = raycaster.intersectObjects(buttons, false);

		//NOTE: TEST FOR BUTTONS
		if (!transitioning && intersectsButton.length > 0) {

			let targetName = GetButtonName(intersectsButton[0].object);
			let desiredTarget = boxes[targetName];

			FindPathFromNode(desiredTarget);
			//console.log(targetName);

		}


		//NOTE: TEST FOR LOCATIONS ON MAP
		let intersectsMap = raycaster.intersectObjects(clickableModels, false);
		if (!transitioning && intersectsMap.length > 0) {

			let desiredTarget = boxes[intersectsMap[0].object.name];

			FindPathFromNode(desiredTarget);

		} else {
			console.log("no click");
		}
	} else if (e.srcElement === panelRenderer.domElement) {

		console.log("panels");

	}



}


function OnWindowResize(e) {

	mapTargetWidth = mapContainer.clientWidth;
	mapTargetHeight = window.innerHeight;

	mapCamera.position.z = 1000 * (mapTargetHeight / mapTargetWidth);
	//console.log(mapCamera.position.z);

	mapCamera.aspect = mapTargetWidth / mapTargetHeight;
	mapCamera.updateProjectionMatrix();

	mapRenderer.setSize(mapTargetWidth, mapTargetHeight);


	panelTargetWidth = panelContainer.clientWidth;
	panelTargetHeight = window.innerHeight;

	panelCamera.position.z = panelCameraZoomFactor * (panelTargetHeight / panelTargetWidth);
	console.log(panelCamera.position.z);

	panelCamera.aspect = panelTargetWidth / panelTargetHeight;
	panelCamera.updateProjectionMatrix();

	panelRenderer.setSize(panelTargetWidth, panelTargetHeight);



}


let lastTime = 0;

let transitionDuration = .5;
let currentTransitionTime = 0;

let transitioning = false;

function animate(time) {

	let deltaTime = (time - lastTime) / 1000;
	lastTime = time;


	if (cube.position.x !== targetPosition.x || cube.position.y !== targetPosition.y) {


		let currentLerpTime = clamp(inverseLerp(0, transitionDuration, currentTransitionTime), 0, 1);

		cube.position.x = lerp(startingPosition.x, targetPosition.x, currentLerpTime);
		cube.position.y = lerp(startingPosition.y, targetPosition.y, currentLerpTime);

		currentTransitionTime += deltaTime;

		transitioning = true;

		if (currentLerpTime === 1) {


			if (targetPath.length > 0) {
				targetNode = targetPath.pop();
				targetPanel = targetNode.name;
				//HideAllPanels();

				startingPosition.x = cube.position.x;
				startingPosition.y = cube.position.y;

				targetPosition.x = targetNode.box.position.x;
				targetPosition.y = -targetNode.box.position.z;
				currentTransitionTime = 0;

			} else {

				activeNode = targetNode;

				//HideAllPanels();
				//DisplayPannel(targetPanel);

			}


		}

	} else {

		transitioning = false;

	}


	//controls.update();

	mapRenderer.render(mapScene, mapCamera);

	panelRenderer.render(panelScene, panelCamera);

	//panelRenderer.render(monitorScene, monitorCamera);

	panelRenderer.setRenderTarget(monitorScreenTexture);
	panelRenderer.render(monitorScene, monitorCamera);
	panelRenderer.setRenderTarget(null);



	requestAnimationFrame(animate);
}



window.addEventListener("resize", OnWindowResize);
document.addEventListener("mousemove", OnMouseMove);
document.addEventListener("pointerdown", OnPointerDown);

requestAnimationFrame(animate);

