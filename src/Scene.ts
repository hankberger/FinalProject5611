import * as THREE from 'three';
import Car from "./Car";
import Player from "./Player";
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import * as CANNON from 'cannon-es';
import CannonDebugRenderer from './utils/cannonDebugRenderer'


export default class Scene{
    public clock: THREE.Clock;
    public camera: THREE.PerspectiveCamera;
    public renderer: THREE.WebGLRenderer;
    public scene: THREE.Scene;
    public controls: OrbitControls;
    public player: Player | null;
    public obstacles: THREE.Mesh[];

    //Physics
    public world: CANNON.World;
    public carBox: CANNON.Body | null;
    public cannonDebug: CannonDebugRenderer;

    //Controls
    public inputVector: THREE.Vector3;

    constructor(){
        this.clock = new THREE.Clock();
        this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.scene = new THREE.Scene();
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.player = null;
        this.inputVector = new THREE.Vector3();
        this.obstacles = [];
        this.world = new CANNON.World();
        this.world.gravity.set(0,-9.82, 0);
        this.carBox = null;

        this.cannonDebug = new CannonDebugRenderer(this.scene, this.world)
        
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupObjects();
        this.setupLights();
        this.setupPhysics();

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
        this.controls.minDistance = 2;
        this.controls.maxDistance = 500;
        this.controls.enablePan = false
        this.controls.maxPolarAngle = Math.PI / 2 - 0.05
        this.controls.update();
    }

    setupObjects(){
        this.generateFloor();
        this.createObstacles();
        return;
    }

    generateFloor() {
        const WIDTH = 200
        const LENGTH = 200
    
        const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
        const material = new THREE.MeshPhongMaterial({color: 0x224422});
    
        const floor = new THREE.Mesh(geometry, material)
        floor.receiveShadow = true
        floor.rotation.x = - Math.PI / 2
        this.scene.add(floor)

        // const groundShape = new CANNON.Box(new CANNON.Vec3(50, 1, 50))
        // const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
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

   setupPhysics(){
        const phongMaterial = new THREE.MeshPhongMaterial()
        const groundMaterial = new CANNON.Material('groundMaterial')
        groundMaterial.friction = 0.25
        groundMaterial.restitution = 0.25

        const groundShape = new CANNON.Box(new CANNON.Vec3(50, 1, 50))
        const groundBody = new CANNON.Body({ mass: 0, material: groundMaterial })
        groundBody.addShape(groundShape)
        groundBody.position.set(0, -1, 0)
        this.world.addBody(groundBody)

        //jumps
        for (let i = 0; i < 100; i++) {
            const jump = new THREE.Mesh(
                new THREE.CylinderGeometry(0, 1, .5, 5),
                phongMaterial
            )
            jump.position.x = Math.random() * 100 - 50
            jump.position.y = 0;
            jump.position.z = Math.random() * 100 - 50
            this.scene.add(jump)

            const cylinderShape = new CANNON.Cylinder(0.01, 1, 0.5, 5)
            const cylinderBody = new CANNON.Body({ mass: 0 })
            cylinderBody.addShape(cylinderShape, new CANNON.Vec3())
            cylinderBody.position.x = jump.position.x
            cylinderBody.position.y = jump.position.y
            cylinderBody.position.z = jump.position.z
            this.world.addBody(cylinderBody)

           
        }

   }
}