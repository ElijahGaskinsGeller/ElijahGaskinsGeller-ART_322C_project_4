import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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


function easeOutSine(x) {
	return Math.sin((x * Math.PI) / 2);
}

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

//let mapCamera = new THREE.PerspectiveCamera(75, mapTargetWidth / mapTargetHeight, 0.1, 7000);
let mapCameraZoomFactor = 50;
let frustumSize = mapCameraZoomFactor * (mapTargetHeight / mapTargetWidth);
let aspect = mapTargetWidth / mapTargetHeight;
let mapCamera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 2000);

let panelCamera = new THREE.PerspectiveCamera(75, panelTargetWidth / panelTargetHeight, 0.1, 7000);
let monitorCamera = new THREE.OrthographicCamera();

mapCamera.position.y = 15;
//mapCamera.position.z = mapCameraZoomFactor * (mapTargetHeight / mapTargetWidth);


let panelCameraZoomFactor = 300;
panelCamera.position.x = 0;
panelCamera.position.y = 300;
panelCamera.position.z = panelCameraZoomFactor * (panelTargetHeight / panelTargetWidth);

panelScene.background = new THREE.Color(0xafc7a7);


let mapRenderer = new THREE.WebGLRenderer();
mapRenderer.setSize(mapTargetWidth, mapTargetHeight);
mapContainer.appendChild(mapRenderer.domElement);

let panelRenderer = new THREE.WebGLRenderer();
panelRenderer.setSize(panelTargetWidth, panelTargetHeight);
panelContainer.appendChild(panelRenderer.domElement);



//let monitorScreenTexture = new THREE.WebGLRenderTarget(monitorWidth, monitorHeight);
let monitorScreenMaterial = new THREE.MeshBasicMaterial({ color: 0x1d1e1f });


//let monitorRenderer = new THREE.WebGLRenderer();
//monitorRenderer.setSize(monitorWidth, monitorHeight);
//document.body.appendChild(monitorRenderer.domElement);



let mapControls = new OrbitControls(mapCamera, mapRenderer.domElement);
mapControls.enableRotate = false;

//let panelControls = new OrbitControls(panelCamera, panelRenderer.domElement);
//panelControls.enableRotate = false;
//panelControls.enablePan = false;

let raycaster = new THREE.Raycaster();
let mapMouseRelPos = new THREE.Vector2(0, 0);
let panelMouseRelPos = new THREE.Vector2(0, 0);



let fbxLoader = new FBXLoader();
let gltfLoader = new GLTFLoader();
let textureLoader = new THREE.TextureLoader();


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

function CreateButtonNode(name, button, node) {

	return {

		name: name,
		button: button,
		node: node

	}

}

function GetButtonName(button) {
	let buttonName = button.name.replace("button_", "dest_");
	return buttonName;
}

let NAMES = {

	destFood: "dest_food",
	destBlue: "dest_blue",
	destPurple: "dest_purple",
	destOrange: "dest_orange",
	destYellow: "dest_yellow",
	destViolet: "dest_violet",

	link0: "link_0",
	link1: "link_1",
	link2: "link_2",
	link3: "link_3",
	link4: "link_4",
	link5: "link_5",
	link6: "link_6",
	link7: "link_7",
	link8: "link_8",
	link9: "link_9",


	//upperLeft: "upper-left",
	//upperMiddle: "upper-middle",
	//upperRight: "upper-right",

	//middleLeft: "middle-left",
	//middleMiddle: "middle-middle",
	//middleRight: "middle-right",

	//lowerLeft: "lower-left",
	//lowerMiddle: "lower-middle",
	//lowerRight: "lower-right",




	monitorButton0: "monitor-button-0",
	monitorButton1: "monitor-button-1",
	monitorButton2: "monitor-button-2",
	monitorButton3: "monitor-button-3",
	monitorButton4: "monitor-button-4",

};

let boxes = {};
let clickableModels = [];

let buttons = [];
let buttonNodes = {};

let cube_geometry = new THREE.BoxGeometry(25, 25, 25);
let material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
let character = new THREE.Mesh(cube_geometry, material);

let mapGeometry = gltfLoader.load("../models/interactive_scene.glb", function(o) {

	console.log(o);

	let elements = o.scene.children;

	for (let i = 0; i < elements.length; i++) {

		let currentElement = elements[i];


		if (currentElement.name !== "bg" && currentElement.name !== "char") {


			currentElement.material = new THREE.MeshBasicMaterial({ color: currentElement.material.color });

			currentElement.material.transparent = true;
			currentElement.material.opacity = 0;

			if (currentElement.name.includes("dest") || currentElement.name.includes("link")) {

				boxes[currentElement.name] = CreateBoxNode(currentElement.name, currentElement, {});
				clickableModels.push(currentElement);

			}

			if (currentElement.name.includes("button")) {


				let buttonName = GetButtonName(currentElement);
				buttonNodes[buttonName] = CreateButtonNode(buttonName, currentElement, null);
				buttons.push(currentElement);

			}

			//TODO: this will be img
			if (currentElement.name === "char") {

				currentElement.material.opacity = 1;

			}

		} else if (currentElement.name === "bg") {

			currentElement.material.transparent = true;

		} else {

			character = currentElement;
			currentElement.material.transparent = true;

		}
		//currentElement.scale.x = 100;
		//currentElement.scale.z = 100;
		//currentElement.rotation.x = Math.PI / 2;
		//
		//mapScene.add(currentElement);
		//
		//console.log(currentElement);

	}

	//for (let i = 0; i < buttons.length; i++) {
	//
	//	buttons[i].parent.remove(buttons[i]);
	//
	//}

	PushConnections(NAMES.destFood, [NAMES.link0, NAMES.link2]);
	PushConnections(NAMES.destBlue, [NAMES.link2]);
	PushConnections(NAMES.destPurple, [NAMES.link9]);
	PushConnections(NAMES.destYellow, [NAMES.link5]);
	PushConnections(NAMES.destViolet, [NAMES.link6]);
	PushConnections(NAMES.destOrange, [NAMES.link7]);

	PushConnections(NAMES.link0, [NAMES.destFood, NAMES.link7, NAMES.link9]);
	PushConnections(NAMES.link1, [NAMES.link2, NAMES.link9]);
	PushConnections(NAMES.link2, [NAMES.destBlue, NAMES.destFood, NAMES.link1, NAMES.link3]);
	PushConnections(NAMES.link3, [NAMES.link2, NAMES.link4]);
	PushConnections(NAMES.link4, [NAMES.link3, NAMES.link5]);
	PushConnections(NAMES.link5, [NAMES.destYellow, NAMES.link4, NAMES.link8]);
	PushConnections(NAMES.link6, [NAMES.destViolet, NAMES.link8]);
	PushConnections(NAMES.link7, [NAMES.destOrange, NAMES.link0]);
	PushConnections(NAMES.link8, [NAMES.link5, NAMES.link6]);
	PushConnections(NAMES.link9, [NAMES.destPurple, NAMES.link1, NAMES.link0]);

	targetNode = boxes[NAMES.destFood];
	targetPanel = NAMES.destFood;



	//startingPosition.x = 0;
	//startingPosition.y = 0;
	//targetPosition.x = .1;
	//targetPosition.y = -.1;

	//NOTE: INVERSE Y
	//NOTE: USE Z INSTEAD OF Y WHEN ON CHARACTER

	startingPosition.x = character.position.x;
	startingPosition.y = -character.position.z;

	targetPosition.x = targetNode.box.position.x;
	targetPosition.y = targetNode.box.position.z;
	currentTransitionTime = transitionDuration * .9;


	o.scene.scale.x = 100;
	o.scene.scale.z = 100;
	//o.scene.rotation.x = Math.PI / 2;


	mapScene = o.scene;
});


//let mapGeometry = loader.load("../models/object_test_buttons.fbx", function(o) {
//	console.log(o);
//
//	let models = o.children;
//
//
//	for (let i = 0; i < models.length; i++) {
//
//		let currentModel = models[i];
//		currentModel.material = new THREE.MeshBasicMaterial({ color: currentModel.material.color });
//
//		if (currentModel.name.includes("button")) {
//
//			let buttonName = GetButtonName(currentModel);
//			buttonNodes[buttonName] = CreateButtonNode(buttonName, currentModel);
//			buttons.push(currentModel);
//
//		} else if (currentModel.name.charAt(0) !== "_") {
//			boxes[currentModel.name] = CreateBoxNode(currentModel.name, currentModel, {});
//			clickableModels.push(currentModel);
//		}
//
//	}
//
//
//	PushConnections(NAMES.upperLeft, [NAMES.upperMiddle, NAMES.middleLeft]);
//	PushConnections(NAMES.upperMiddle, [NAMES.upperLeft, NAMES.upperRight, NAMES.middleMiddle])
//	PushConnections(NAMES.upperRight, [NAMES.upperMiddle])
//
//	PushConnections(NAMES.middleLeft, [NAMES.upperLeft, NAMES.lowerLeft])
//	PushConnections(NAMES.middleMiddle, [NAMES.upperMiddle, NAMES.middleRight, NAMES.lowerMiddle])
//	PushConnections(NAMES.middleRight, [NAMES.middleMiddle, NAMES.lowerRight])
//
//	PushConnections(NAMES.lowerLeft, [NAMES.middleLeft])
//	PushConnections(NAMES.lowerMiddle, [NAMES.middleMiddle, NAMES.lowerRight])
//	PushConnections(NAMES.lowerRight, [NAMES.lowerMiddle, NAMES.middleRight])
//
//	targetNode = boxes["middle-middle"];
//	targetPanel = "middle-middle";
//	//HideAllPanels();
//
//	startingPosition.x = cube.position.x;
//	startingPosition.y = cube.position.y;
//
//	targetPosition.x = targetNode.box.position.x;
//	targetPosition.y = -targetNode.box.position.z;
//	currentTransitionTime = 0;
//
//
//
//	o.rotation.x = Math.PI / 2;
//
//	mapScene.add(o);
//
//});
//

let monitorButtonModels = [];
let monitorButtons = {};

function CreateMonitorButton(button, screenNumber) {

	return {

		button: button,
		screenNumber

	}

}


let panelGeometry = gltfLoader.load("../models/cctv.glb", function(o) {
	console.log("panel");
	console.log(o);

	let defaultMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(0xffffff) });

	let children = o.scene.children;

	for (let i = 0; i < children.length; i++) {

		let currentChild = children[i];



		if (!currentChild.name.includes("img")) {
			let newMaterial = new THREE.MeshBasicMaterial({ color: currentChild.material.color });
			currentChild.material = newMaterial;
		}

		if (currentChild.name === "monitor_screen") {
			currentChild.material = monitorScreenMaterial;
		}

		if (currentChild.name.includes("button")) {

			monitorButtonModels.push(currentChild);
			monitorButtons[currentChild.name] = CreateMonitorButton(currentChild, parseInt(currentChild.name.replace("monitor-button-", "")));
			console.log(monitorButtons[currentChild.name]);

		}
	}



	SetScreen(0);

	o.scene.rotation.y = -Math.PI / 2;
	o.scene.scale.x = 100;
	o.scene.scale.y = 100;
	o.scene.scale.z = 100;
	panelScene.add(o.scene);

});





//let test_geometry = new THREE.BoxGeometry(25, 25, 25);
//let test_material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
//let test = new THREE.Mesh(cube_geometry, material);
//character.position.x = 1;
//character.position.y = 0;
//character.position.z = 0;
//mapScene.add(test);

let cctvEmpty = [null, null, null, null, null, null];
let cctvActive = [null, null, null, null, null, null];

//textureLoader.load("../models/textures/cctv_footage/cctv_no_signal.jpg", function(t) {
//	cctvEmpty[0] = t;
//	monitorScreenMaterial.map = t;
//});
//
//textureLoader.load("../models/textures/cctv_footage/0.png", function(t) {
//	cctvEmpty[0] = t;
//	monitorScreenMaterial.map = t;
//});
//
//textureLoader.load("../models/textures/cctv_footage/1.png", function(t) {
//	cctvEmpty[1] = t;
//	cctvEmpty.push(t);
//});
//
//textureLoader.load("../models/textures/cctv_footage/2.png", function(t) {
//	cctvEmpty[2] = t;
//	cctvEmpty.push(t);
//});
//
//textureLoader.load("../models/textures/cctv_footage/3.png", function(t) {
//	cctvEmpty[3] = t;
//	cctvEmpty.push(t);
//});
//
//textureLoader.load("../models/textures/cctv_footage/4.png", function(t) {
//	cctvEmpty[4] = t;
//	cctvEmpty.push(t);
//});
//
//textureLoader.load("../models/textures/cctv_footage/5.png", function(t) {
//	cctvEmpty[5] = t;
//	cctvEmpty.push(t);
//});

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


let targetPath = [];

let targetPosition = new THREE.Vector2(character.position.x, character.position.z);
let startingPosition = new THREE.Vector2(character.position.x, character.position.z);
let targetPanel = "";
let activeNode = null;
let targetNode = null;

let pathCap = 15;

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

			startingPosition.x = character.position.x;
			startingPosition.y = character.position.z;

			targetPosition.x = targetNode.box.position.x;
			targetPosition.y = targetNode.box.position.z;
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
			if (!targetNode) {
				console.log("AHHH!");
				console.log(node);
			}
			targetPanel = targetNode.name;
			//HideAllPanels();

			startingPosition.x = character.position.x;
			startingPosition.y = character.position.z;

			targetPosition.x = targetNode.box.position.x;
			targetPosition.y = targetNode.box.position.z;
			currentTransitionTime = 0;



			console.log(paths);
			console.log(currentPath);
			console.log(targetNode);


		}
	}
}


function SetScreen(screenNumber) {


	switch (screenNumber) {

		case (0): {

			monitorScreenMaterial.map = cctvEmpty[0];
			//monitorScene.background = new THREE.Color(0x0000ff);

		} break;


		case (1): {

			monitorScreenMaterial.map = cctvEmpty[1];
			//monitorScene.background = new THREE.Color(0xff00ff);

		} break;


		case (2): {

			monitorScreenMaterial.map = cctvEmpty[2];
			//monitorScene.background = new THREE.Color(0xff0000);

		} break;


		case (3): {

			monitorScreenMaterial.map = cctvEmpty[3];
			//monitorScene.background = new THREE.Color(0xffff00);

		} break;

		case (4): {

			monitorScreenMaterial.map = cctvEmpty[4];
			//monitorScene.background = new THREE.Color(0x00ff00);

		} break;

		case (5): {

			monitorScreenMaterial.map = cctvEmpty[5];
			//monitorScene.background = new THREE.Color(0x00ffff);

		}

	}

}


function OnPointerDown(e) {
	if (e.button !== 0) {
		return;
	}

	if (e.srcElement === mapRenderer.domElement) {
		console.log("map");

		mapMouseRelPos.x = (e.clientX / mapTargetWidth) * 2 - 1;
		mapMouseRelPos.y = - (e.clientY / mapTargetHeight) * 2 + 1;

		raycaster.setFromCamera(mapMouseRelPos, mapCamera);


		let intersectsButton = raycaster.intersectObjects(buttons, false);

		console.log(intersectsButton);
		console.log(buttons);
		//NOTE: TEST FOR BUTTONS
		if (!transitioning && intersectsButton.length > 0) {


			let targetName = GetButtonName(intersectsButton[0].object);
			let desiredTarget = boxes[targetName];

			FindPathFromNode(desiredTarget);

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

		console.log(e);

		panelMouseRelPos.x = ((e.clientX - (window.innerWidth - panelTargetWidth)) / panelTargetWidth) * 2 - 1;
		panelMouseRelPos.y = - (e.clientY / panelTargetHeight) * 2 + 1;


		raycaster.setFromCamera(panelMouseRelPos, panelCamera);

		let intersectsButton = raycaster.intersectObjects(monitorButtonModels, true);

		if (intersectsButton.length > 0) {

			let clickedModel = intersectsButton[0].object;

			let clickedButton = monitorButtons[clickedModel.name];

			//SetScreen(clickedButton.screenNumber);

		}

		console.log("panels");

	}



}


let panelRotationFactor = .25;
let panelRotationDurration = .025;
let panelRotationTimer = 0;

let panelRotationStart = new THREE.Vector2();
let panelRotationTarget = new THREE.Vector2();

let panelCamOffsetX = .025;
let panelCamOffsetY = .025;

function OnMouseMove(e) {

	mapMouseRelPos.x = (e.clientX / mapTargetWidth) * 2 - 1;
	mapMouseRelPos.y = - (e.clientY / mapTargetHeight) * 2 + 1;


	panelMouseRelPos.x = ((e.clientX - (window.innerWidth - panelTargetWidth)) / panelTargetWidth) * 2 - 1;
	panelMouseRelPos.y = - (e.clientY / panelTargetHeight) * 2 + 1;


	if (panelMouseRelPos.x >= -1 && panelMouseRelPos.x <= 1) {

		panelRotationStart.x = panelCamera.rotation.x;
		panelRotationStart.y = panelCamera.rotation.y;

		panelRotationTarget.x = (panelCamOffsetX * panelMouseRelPos.y);
		panelRotationTarget.y = -(panelCamOffsetY * panelMouseRelPos.x);


		let panelRotationDistance = panelRotationStart.distanceTo(panelRotationTarget);

		panelRotationDurration = panelRotationDistance / panelRotationFactor;
		panelRotationTimer = panelRotationDurration;

	} else if (panelCamera.rotation.x !== 0 || panelCamera.rotation.y !== 0) {

		panelRotationStart.x = panelCamera.rotation.x;
		panelRotationStart.y = panelCamera.rotation.y;

		panelRotationTarget.x = 0;
		panelRotationTarget.y = 0;

		let panelRotationDistance = panelRotationStart.distanceTo(panelRotationTarget);

		panelRotationDurration = panelRotationDistance / panelRotationFactor;
		panelRotationTimer = panelRotationDurration;

	}


}


function OnWindowResize(e) {

	mapTargetWidth = mapContainer.clientWidth;
	mapTargetHeight = window.innerHeight;

	frustumSize = mapCameraZoomFactor * (mapTargetHeight / mapTargetWidth);
	aspect = mapTargetWidth / mapTargetHeight;

	//mapCamera = new THREE.OrthographicCamera(frustumSize * aspect / - 2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / - 2, 0.1, 2000);
	//
	mapCamera.left = frustumSize * aspect / - 2;
	mapCamera.right = frustumSize * aspect / 2;
	mapCamera.top = frustumSize / 2;
	mapCamera.bottom = frustumSize / - 2;

	//mapCamera.position.z = mapCameraZoomFactor * (mapTargetHeight / mapTargetWidth);
	//console.log(mapCamera.position.z);

	mapCamera.aspect = mapTargetWidth / mapTargetHeight;
	mapCamera.updateProjectionMatrix();

	mapRenderer.setSize(mapTargetWidth, mapTargetHeight);


	panelTargetWidth = panelContainer.clientWidth;
	panelTargetHeight = window.innerHeight;

	panelCamera.position.z = panelCameraZoomFactor * (panelTargetHeight / panelTargetWidth);
	//console.log(panelCamera.position.z);

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


	if (character.position.x !== targetPosition.x || character.position.z !== targetPosition.y) {


		let currentLerpTime = clamp(inverseLerp(0, transitionDuration, currentTransitionTime), 0, 1);

		character.position.x = lerp(startingPosition.x, targetPosition.x, currentLerpTime);
		character.position.z = lerp(startingPosition.y, targetPosition.y, currentLerpTime);

		currentTransitionTime += deltaTime;

		transitioning = true;

		if (currentLerpTime === 1) {


			if (targetPath.length > 0) {
				targetNode = targetPath.pop();
				targetPanel = targetNode.name;
				//HideAllPanels();

				startingPosition.x = character.position.x;
				startingPosition.y = character.position.z;

				targetPosition.x = targetNode.box.position.x;
				targetPosition.y = targetNode.box.position.z;
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



	if (panelRotationTimer > 0) {

		panelRotationTimer -= deltaTime;


		if (panelRotationTimer < 0) {

			panelRotationTimer = 0;

		}

		let normalizedPanelRotationTimer = easeOutSine(inverseLerp(panelRotationDurration, 0, panelRotationTimer));


		panelCamera.rotation.x = lerp(panelRotationStart.x, panelRotationTarget.x, normalizedPanelRotationTimer);
		panelCamera.rotation.y = lerp(panelRotationStart.y, panelRotationTarget.y, normalizedPanelRotationTimer);


	}



	//controls.update();

	mapRenderer.render(mapScene, mapCamera);

	panelRenderer.render(panelScene, panelCamera);


	//panelRenderer.setRenderTarget(monitorScreenTexture);
	//panelRenderer.render(monitorScene, monitorCamera);
	//panelRenderer.setRenderTarget(null);



	requestAnimationFrame(animate);
}



window.addEventListener("resize", OnWindowResize);
document.addEventListener("pointerdown", OnPointerDown);
document.addEventListener("mousemove", OnMouseMove);

requestAnimationFrame(animate);

