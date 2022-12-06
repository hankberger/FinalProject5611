import * as THREE from 'three'
import './style.css';
import { AnimationMixer, Color, Object3D, TextureLoader, Vector2, Vector3 } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xADD8E6);

// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true
document.body.appendChild(renderer.domElement);

// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 15
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 - 0.05
orbitControls.update();

//MOVEMENT
let movements: Vector3[] = [];
let objects: THREE.Object3D[] = [];
let dummy: THREE.Object3D;
let rotationSet = false;
const speed = .04;

//OBSTACLES
const numObstacles = 30;
const goalGeo = new THREE.CylinderGeometry( 5, 5, 20, 32 );
const goalMat = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
const goal = new THREE.Mesh( goalGeo, goalMat );

// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', onWindowResize);

//GLB Model
new GLTFLoader().load('assets/toon_man.glb', function (gltf) {
  const model = gltf.scene;
  model.castShadow = true;
  model.traverse(c=>{
        c.castShadow = true;
  });
  // const dummyposx = Math.random()*16 - 8;
  // const dummyposz = Math.random()*16 - 8;
  // model.position.x = dummyposx;
  // model.position.z = dummyposz;
  // orbitControls.target = model.position;
  // dummy = model;
  // orbitControls.target = dummy.position;
  // orbitControls.update();
  
  // const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
  // mixer = new THREE.AnimationMixer(model);
  // const animationsMap: Map<string, THREE.AnimationAction> = new Map();
  // console.log(animationsMap);
  // gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
  //     animationsMap.set(a.name, mixer.clipAction(a))
  // })
  // let anim = animationsMap.get('animation_0');
  // console.log(anim);
  // anim?.play();
  console.log(model);
  scene.add(model);
});

function generateFloor() {
    // TEXTURE
    const textureLoader = new THREE.TextureLoader();
    // const floorColor = textureLoader.load('/gridbox.png');

    const WIDTH = 80
    const LENGTH = 80

    const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
    const material = new THREE.MeshPhongMaterial({color: 0xff4422});
    // const material = new THREE.MeshStandardMaterial(
    //     {
    //        map: floorColor
    //     })
    
        
        // wrapAndRepeatTexture(material.map);
    

    const floor = new THREE.Mesh(geometry, material)
    floor.receiveShadow = true
    floor.rotation.x = - Math.PI / 2
    scene.add(floor)
}

generateFloor();

function wrapAndRepeatTexture (map: THREE.Texture) {
  map.wrapS = map.wrapT = THREE.RepeatWrapping
  map.repeat.x = map.repeat.y = 10
}

function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))

    const dirLight = new THREE.DirectionalLight(0xffffff, 1)
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
    // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))
}

light();

// const geometry = new THREE.CylinderGeometry(.4, .4, 1.2, 16);
// const material = new THREE.MeshPhongMaterial( {color: 0xffffff} );
// const AAA = new THREE.Mesh(geometry, material);
// AAA.position.y = .6;
// scene.add(AAA);

function createObstacles(){
  for(let i = 0; i < numObstacles; i++){
    const posx = Math.random()*16 - 8;
    const posz = Math.random()*16 - 8;
    const rotation = Math.random() * 360;

    const obj = new THREE.BoxGeometry(1, 1, 1);
    const objMat = new THREE.MeshStandardMaterial();

    const box = new THREE.Mesh(obj, objMat);
    box.position.x = posx;
    box.position.y = Math.random()*.5;
    box.position.z = posz;
    box.castShadow = true;

    objects.push(box);
    scene.add(box)
  }
}

createObstacles();



// document.addEventListener( 'mousedown', onDocumentMouseDown );
// function onDocumentMouseDown( event: any ) {   
  
//   event.preventDefault();
//   let mouse3D = new THREE.Vector3( ( event.clientX/ window.innerWidth ) * 2 - 1,   
//                         -( event.clientY / window.innerHeight ) * 2 + 1,  
//                           0.5 );     

//   var raycaster =  new THREE.Raycaster();                                        
//   raycaster.setFromCamera( mouse3D, camera );

//   // Grab all objects that can be intersected.
//   var intersects = raycaster.intersectObjects( scene.children );
//   if ( intersects.length > 0 ) {
//     movements.push(intersects[ 0 ].point);
//   }
// }




const clock = new THREE.Clock();
var render = function () {
    requestAnimationFrame( render );
  
    renderer.render(scene, camera);
  
  };
  
render();