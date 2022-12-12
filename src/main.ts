import './style.css';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

import Scene from './Scene';
import Player from './Player';
import AI from './AI';
import Track from './Track';


const app = new Scene();
const track = new Track(app);

//Variables
const bots: AI[] = [];
const obstacles: any[] = [];

// RESIZE HANDLER
export function onWindowResize() {
  app.camera.aspect = window.innerWidth / window.innerHeight;
  app.camera.updateProjectionMatrix();
  app.renderer.setSize(window.innerWidth, window.innerHeight);
  
  return;
}

window.addEventListener('resize', onWindowResize);

//Controls
const botBtn = document.getElementById("btn");

//ADD AI

const aiColors = [0x33bbaa, 0x11ffff,  0x00aaff, 0x00ff21]
let offset = 0;
botBtn?.addEventListener("click", (e) => {
  new GLTFLoader().load('assets/lowpoly.gltf', function (gltf) {
    const model = gltf.scene;
    model.castShadow = true;
    model.traverse(c=>{
        c.castShadow = true;
    });
    model.position.y = .2
    model.position.x = offset;
    offset += 2;
    // model.children[0].children[3].material.color.setHex(0xffaabb);
  
    //Color controls
    const color = aiColors[AI.numAI % aiColors.length];
    console.log('color:', color);
    model.children[0].children[0].children[0].material.color.setHex(color);
    model.children[0].children[1].children[0].children[0].material.color.setHex(color);
    model.children[0].children[1].children[0].children[1].material.color.setHex(color);
    model.children[0].children[1].children[1].material.color.setHex(color);
    model.children[0].children[1].children[2].material.color.setHex(color);
    model.children[0].children[2].material.color.setHex(color);
    model.children[0].children[3].material.color.setHex(color);
    model.children[0].children[4].material.color.setHex(color);
    model.children[0].children[5].material.color.setHex(color);
    // console.log(model);
    const aibot = new AI(model, app);
    bots.push(aibot);
    app.scene.add(model);
  });
  
});

//LOAD Player
new GLTFLoader().load('assets/lowpoly.gltf', function (gltf) {
  const model = gltf.scene;
  model.castShadow = true;
  model.traverse(c=>{
      c.castShadow = true;
  });
  model.position.y = .2
  // model.children[0].children[3].material.color.setHex(0xffaabb);

  //Color controls
  const baseColor = 0xffffff;
  model.children[0].children[0].children[0].material.color.setHex(baseColor);
  model.children[0].children[1].children[0].children[0].material.color.setHex(baseColor);
  model.children[0].children[1].children[0].children[1].material.color.setHex(baseColor);
  model.children[0].children[1].children[1].material.color.setHex(baseColor);
  model.children[0].children[1].children[2].material.color.setHex(baseColor);
  model.children[0].children[2].material.color.setHex(baseColor);
  model.children[0].children[3].material.color.setHex(baseColor);
  model.children[0].children[4].material.color.setHex(baseColor);
  model.children[0].children[5].material.color.setHex(baseColor);
  // console.log(model);
  app.player = new Player(model, app);
  app.scene.add(model);
});

//Helper Functions to get Cars / Obstacles.
export function getBots(){
  return bots;
}

export function getObstacles(){
  return app.getObstacles();
}

//RENDER LOOP!
const v = new THREE.Vector3()
function render(){
  const dt = app.clock.getDelta();
  requestAnimationFrame( render );

  //Update Camera Position to Follow Player
  if(app.player){
      app.controls.target = app.player.mesh.position;
      app.controls.update();
      app.player.move(dt, app.inputVector);
  }

  bots.forEach((bot)=>{
    bot.move(dt, app.inputVector);
  });

  track.updateTrack(app.player);

  // app.camera.position.x = app.player.mesh.position.x;
  // app.camera.position.y = app.player.mesh.position.y+2;
  // app.camera.position.z = app.player.mesh.position.z;
  // app.camera.translateZ(-10); 

  // app.camera.updateMatrix()

  app.camera.lookAt(app.player.mesh.position)

    app.cameraPivot.getWorldPosition(v)
    if (v.y < 2) {
        v.y = 2
    }

    const camPosition = new THREE.Vector3(app.player.mesh.position.x, 3, app.player.mesh.position.z)
    app.camera.position.lerpVectors(app.camera.position, camPosition, 0.035)
 



  app.renderer.render(app.scene, app.camera);
};

render();