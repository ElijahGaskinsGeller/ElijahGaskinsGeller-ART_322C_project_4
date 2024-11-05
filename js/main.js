

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


let scene = new THREE.Scene();


let camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

camera.position.z = 700;


let renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//let controls = new OrbitControls(camera, renderer.domElement);


let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2(1, 1);



let loader = new FBXLoader();
//let material_0 = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
//let material_1 = new THREE.MeshBasicMaterial({ color: 0xff0000 });
//let material_2 = new THREE.MeshBasicMaterial({ color: 0x0000ff });
//let material_3 = new THREE.MeshBasicMaterial({ color: 0xffff00 });

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




let geometry = loader.load("../models/object_test_3x3_path.fbx", function(o) {
	console.log(o);

	let models = o.children;

	//models[0].material = material_0;
	//models[1].material = material_1;
	//models[2].material = material_2;
	//models[3].material = material_3;

	for (let i = 0; i < models.length; i++) {

		let currentModel = models[i];
		currentModel.material = new THREE.MeshBasicMaterial({ color: currentModel.material.color });

		if (currentModel.name.charAt(0) !== "_") {
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
	HideAllPanels();

	startingPosition.x = cube.position.x;
	startingPosition.y = cube.position.y;

	targetPosition.x = targetNode.box.position.x;
	targetPosition.y = -targetNode.box.position.z;
	currentTransitionTime = 0;


	//boxes["lower-left"].connections["lower-right"] = boxes["lower-right"];
	//boxes["lower-left"].connections["upper-left"] = boxes["upper-left"];
	//
	//boxes["lower-right"].connections["upper-right"] = boxes["upper-right"];
	//boxes["lower-right"].connections["lower-left"] = boxes["lower-left"];
	//
	//boxes["upper-left"].connections["lower-left"] = boxes["lower-left"];
	//boxes["upper-left"].connections["upper-right"] = boxes["upper-right"];
	//
	//boxes["upper-right"].connections["lower-right"] = boxes["lower-right"];
	//boxes["upper-right"].connections["upper-left"] = boxes["upper-left"];
	//
	//
	console.log(boxes);


	o.rotation.x = Math.PI / 2;

	scene.add(o);

});

let cube_geometry = new THREE.BoxGeometry(25, 25, 25);
let material = new THREE.MeshBasicMaterial({ color: 0xff00ff });
let cube = new THREE.Mesh(cube_geometry, material);
cube.position.y = 10;
scene.add(cube);


function HideAllPanels() {

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
	panel.classList.add("display-" + panelId);


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

function OnPointerDown(e) {

	mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
	mouse.y = - (e.clientY / window.innerHeight) * 2 + 1;

	raycaster.setFromCamera(mouse, camera);



	let intersects = raycaster.intersectObjects(clickableModels, false);

	if (!transitioning && intersects.length > 0) {

		let desiredTarget = boxes[intersects[0].object.name];

		if (desiredTarget && desiredTarget !== activeNode) {

			if (activeNode === null || desiredTarget.name in activeNode.connections) {

				targetNode = desiredTarget;
				targetPanel = intersects[0].object.name;
				HideAllPanels();

				startingPosition.x = cube.position.x;
				startingPosition.y = cube.position.y;

				targetPosition.x = intersects[0].object.position.x;
				targetPosition.y = -intersects[0].object.position.z;
				currentTransitionTime = 0;

			} else if (!(desiredTarget.name in activeNode.connections)) {

				let paths = FindPaths(desiredTarget, [activeNode]);
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
				HideAllPanels();

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

	} else {
		console.log("no click");
	}



}


function OnWindowResize(e) {

	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	renderer.setSize(window.innerWidth, window.innerHeight);

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
				HideAllPanels();

				startingPosition.x = cube.position.x;
				startingPosition.y = cube.position.y;

				targetPosition.x = targetNode.box.position.x;
				targetPosition.y = -targetNode.box.position.z;
				currentTransitionTime = 0;

			} else {

				activeNode = targetNode;

				HideAllPanels();
				//DisplayPannel(targetPanel);

			}


		}

	} else {

		transitioning = false;

	}


	renderer.render(scene, camera);


	requestAnimationFrame(animate);
}



window.addEventListener("resize", OnWindowResize);
document.addEventListener("mousemove", OnMouseMove);
document.addEventListener("pointerdown", OnPointerDown);

requestAnimationFrame(animate);

