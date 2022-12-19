// @ts-nocheck
import * as THREE from 'three';
import Car from "./Car";
import Player from "./Player";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'


export default class Scene{
    public clock: THREE.Clock;
    public camera: THREE.PerspectiveCamera;
    public cameraPivot: THREE.Object3D;
    public renderer: THREE.WebGLRenderer;
    public scene: THREE.Scene;
    public controls: OrbitControls;
    public player: Player;
    public obstacles: THREE.Group[];

    //Controls
    public inputVector: THREE.Vector3;

    constructor(){
        this.clock = new THREE.Clock();
        this.cameraPivot = new THREE.Object3D();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.player = new Player(new THREE.Group, this);
        this.inputVector = new THREE.Vector3();
        this.obstacles = [];
        
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupObjects();
        this.setupLights();

        document.addEventListener('keydown', (e)=>{
            if(e.key == "w"){
                this.inputVector.z = 1;
            } else if(e.key == "s"){
                this.inputVector.z = -1;
            } else if(e.key == "a"){
                this.inputVector.x = 1;
            } else if(e.key == "d"){
                this.inputVector.x = -1;
            }
            })
        
        document.addEventListener('keyup', (e)=>{
            if(e.key == "w"){
                this.inputVector.z = 0;
            } else if(e.key == "s"){
                this.inputVector.z = 0;
            } else if(e.key == "a"){
                this.inputVector.x = 0;
            } else if(e.key == "d"){
                this.inputVector.x = 0;
            }
        })
    }

    setupScene(){
        this.scene.background = new THREE.Color(0xADD8E6);
    }

    setupCamera(){
        this.camera.position.y = 5;
        this.camera.position.z = 5;
        this.camera.position.x = 0;

        const chaseCam = new THREE.Object3D()
        chaseCam.position.set(0, 0, 0)
        const chaseCamPivot = new THREE.Object3D()
        chaseCamPivot.position.set(0, 2, 4)
        chaseCam.add(chaseCamPivot)
        this.scene.add(this.camera);

        this.player.mesh.add(chaseCam);
    }

    setupRenderer(){
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true
        document.body.appendChild(this.renderer.domElement);
    }

    setupControls(){
        // CONTROLS
        this.controls.enableDamping = true;
        this.controls.minDistance = 6;
        this.controls.maxDistance = 8;
        this.controls.enablePan = false
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05
        this.controls.update();
    }

    setupObjects(){
        this.generateFloor();
        // this.createObstacles(); 
        return;
    }

    generateFloor() {
        const WIDTH = 10000
        const LENGTH = 10000
    
        const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 1, 1);
        const material = new THREE.MeshPhongMaterial({color: 0x224422});
    
        const floor = new THREE.Mesh(geometry, material)
        floor.receiveShadow = true
        floor.rotation.x = - Math.PI / 2
        floor.position.y = -.01;
        this.scene.add(floor)
    }

    wrapAndRepeatTexture (map: THREE.Texture) {
        map.wrapS = map.wrapT = THREE.RepeatWrapping
        map.repeat.x = map.repeat.y = 10
        return;
    }

    createObstacles(){
        for(let i = 0; i < 3; i++){
          const posx = Math.random()*16 - 8;
          const posz = Math.random()*16 - 8;
          const rotation = Math.random() * 360;
      
          const obj = new THREE.BoxGeometry(1, 1, 1);
          const objMat = new THREE.MeshStandardMaterial();
      
          const box = new THREE.Mesh(obj, objMat);
          box.position.x = posx;
          box.position.y = .5;
          box.position.z = posz;
          box.castShadow = true;
      
          this.obstacles.push(box);
          this.scene.add(box)
        }
    }
    
    getObstacles(){
        return this.obstacles;
    }

    setupLights() {
        this.scene.add(new THREE.AmbientLight(0xffffff, 0.7))
    
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
        this.scene.add(dirLight);
        return;
    }
   
}