import './style.css';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

import Scene from './Scene';
import Player from './Player';
import AI from './AI';
import Track from './Track';
import { Vector3, Group } from "three";
import UI from './UI';


const app = new Scene();
const ui = new UI();
app.camera.position.set(0, 3, 0);

const track = new Track(app);

//Variables
const bots: AI[] = [];

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

//LOAD Player
new GLTFLoader().load('assets/lowpoly.gltf', function (gltf) {
  const model = gltf.scene;
  model.castShadow = true;
  model.traverse(c=>{
      c.castShadow = true;
  });
  model.position.y = .3
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

  model.position.set(0, 0.3, 10);

  app.scene.add(model);
});

//ADD AI

const aiColors = [0x33bbaa, 0x11ffff,  0x00aaff, 0x00ff21]
let offset = 4;
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


    const positions = track.getTrackPositions();

    const reversed = Math.random() > 0.5;
    // const reversed = true;
    let index = 0;
    if (reversed) {
      index = positions.length - 1;
    }

    model.position.z = positions[index].z + Math.random() * 10 - 5;
    model.position.x = positions[index].x + Math.random() * 10 - 5;

    // model.position.z = Math.random() * 100 - 50;
    // model.position.x = Math.random() * 100 - 50;
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
    const aibot = new AI(model, app, track, app.player, reversed);
    bots.push(aibot);
    app.scene.add(model);
  });
  
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

  // Handle car-obstacle collision

  for (let i in app.obstacles) {
    const dist = new THREE.Vector3();
    dist.copy(app.obstacles[i].position);
    dist.sub(app.player.position);
    if (dist.length() < 1.25) {
        app.player.speed = app.player.speed > 0 ? -4 : 4;
    }
  }

  // player-ai collision
  for (const ai of AI.AIs) {
    const dist = new THREE.Vector3();
    dist.copy(ai.position);
    dist.sub(app.player.position);
    if (dist.length() > 2) {
      continue;
    }
    console.log("player-ai collision");

    app.player.speed = -4;
  }




  //Update Camera Position to Follow Player
  if(app.player){
      app.controls.target = app.player.mesh.position;
      app.controls.update();
      app.player.move(dt, app.inputVector);
  }
  bots.forEach((bot)=>{
    // bot.move(dt, app.inputVector);
    bot.computeForce(app.player);
  });

  bots.forEach((bot)=>{
    bot.updateVelocity();
    bot.moveToTrack(dt);
  });


  track.updateTrack(app.player);

//Camera stuff
  app.camera.lookAt(app.player.mesh.position)

  app.cameraPivot.getWorldPosition(v)
  if (v.y < 2) {
      v.y = 2
  }
  
  const carRotation = app.player.mesh.rotation.y;

  const camPosition = new THREE.Vector3(app.player.mesh.position.x , 3, app.player.mesh.position.z );

  if(app.player.velocity_vec.length() > .25){
    app.camera.position.lerpVectors(app.camera.position, camPosition, 0.035)
  }

  ui.updateScore(dt, app.player);
  
  app.renderer.render(app.scene, app.camera);
};

render();