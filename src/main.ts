import './style.css';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import * as THREE from 'three';

import Scene from './Scene';
import Player from './Player';
import AI from './AI';
import Track from './Track';
import { Vector3, Group } from "three";


const app = new Scene();
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
    const aibot = new AI(model, app, track, app.player);
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

    for(let j in AI.AIs){
      dist.copy(app.obstacles[i].position);
      dist.sub(AI.AIs[j].mesh.position);
      if(dist.length() < 1.25){
        AI.AIs[j].speed *= -.8
    }
    }
  }




  //Update Camera Position to Follow Player
  if(app.player){
      app.controls.target = app.player.mesh.position;
      app.controls.update();
      app.player.move(dt, app.inputVector);
  }

  // ------------------------------START BOIDS------------------------------
  // const sepForce_maxD = 10;
  // const attraction_maxD = 10;
  // const alignment_maxD = 10;
  // const sepScale = 1;
  // const attractionScale = 1;
  // const alignScale = 1;

  // for (const ai of AI.AIs) {
  //   const acc = new Vector3();

  //   // separation
  //   for (const other of AI.AIs) {
  //     const dist = ai.position.distanceTo(other.position);
  //     if (dist < 0.01 || dist > sepForce_maxD) continue;
  //     const sepForce = new Vector3();
  //     sepForce.subVectors(ai.position, other.position);
  //     sepForce.setLength(sepScale / Math.pow(dist, 2));
  //     acc.add(sepForce);
  //   }

  //   // cohesion
  //   let num_neigh = 0
  //   const avg_pos = new Vector3();
  //   for (const other of AI.AIs) {
  //     const dist = ai.position.distanceTo(other.position);
  //     if (dist > attraction_maxD) continue;
  //     avg_pos.add(other.position);
  //     num_neigh++;
  //   }
  //   avg_pos.divideScalar(num_neigh);
  //   const attractionForce = new Vector3();
  //   attractionForce.subVectors(avg_pos, ai.position);
  //   attractionForce.setLength(attractionScale);
  //   acc.add(attractionForce);

  //   // alignment
  //   num_neigh = 0;
  //   const avg_vel = new Vector3();
  //   for (const other of AI.AIs) {
  //     const dist = ai.position.distanceTo(other.position);
  //     if (dist > alignment_maxD) continue;
  //     avg_vel.add(other.velocity_vec);
  //     num_neigh++;
  //   }
  //   avg_vel.divideScalar(num_neigh);
  //   const towards = new Vector3();
  //   towards.subVectors(avg_vel, ai.velocity_vec);
  //   towards.setLength(alignScale)
  //   acc.add(towards);

  //   ai.acc = acc;
  // }

  // // apply acceleration to each bot
  // AI.AIs.forEach((ai) => {
  //   ai.applyAcc();
  // })
  // ------------------------------END BOIDS------------------------------

  bots.forEach((bot)=>{
    // bot.move(dt, app.inputVector);
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
  // console.log(carRotation);

  // const arcCos = Math.cos(carRotation);
  // const arcSin = Math.sin(carRotation);

  // console.log(arcCos, arcSin)

  const camPosition = new THREE.Vector3(app.player.mesh.position.x , 3, app.player.mesh.position.z );

  if(app.player.velocity_vec.length() > .25){
    app.camera.position.lerpVectors(app.camera.position, camPosition, 0.035)
  }
  
  app.renderer.render(app.scene, app.camera);
};

render();