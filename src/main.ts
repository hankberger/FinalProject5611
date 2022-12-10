import './style.css';

import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

import App from './Scene';
import Player from './Player';
import AI from './AI';


const app = new App();

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
const bots: AI[] = [];
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

//RENDER LOOP!
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


  app.renderer.render(app.scene, app.camera);
};

render();