import Scene from "./Scene";
import * as THREE from 'three';
import Player from "./Player";
import { Loader, Mesh, Object3D, Vector3 } from "three";
import AI from "./AI";
import {FBXLoader} from 'three/examples/jsm/loaders/FBXLoader';
import UI from "./UI";

export default class Track{
    public app: Scene;
    public currentTrack: trackPiece;
    public currentRotation: number;
    public coordinates: THREE.Vector3;
    public trackSize: number;
    public cone: Object3D;

    public static trackList: trackPiece[];

    public straightTexture;
    public rightTexture;
    public leftTexture;

    constructor(app: Scene){
        this.app = app;
        this.currentTrack = new trackPiece('start', new THREE.Mesh());
        this.currentRotation = 0;
        this.coordinates = new THREE.Vector3();
        this.trackSize = 20;
        this.cone = new Object3D();
        Track.trackList = [];
        for(let i = 0; i < 4; i++){
            this.generateTrack();
        }

        // this.app.scene.add(this.cone);
        // const texLoader = new THREE.TextureLoader;
        // this.straightTexture = texLoader.load('textures/track_straight.png');
        // this.leftTexture = new THREE.TextureLoader().load('textures/track_lturn.png');
        // this.rightTexture = new THREE.TextureLoader().load('textures/track_rturn.png');
        
    }

    generateTrack() {
        const WIDTH = this.trackSize;
        const LENGTH = this.trackSize;

        const randomNum = ~~(Math.random()* 10);
    
        let texture;
        let dir = "";
        if(randomNum < 6){
            if(!this.straightTexture){
                const loader = new THREE.TextureLoader;
                this.straightTexture = loader.load('textures/fixedhopefully.png')
                texture = this.straightTexture;
            } else {
                texture = this.straightTexture;
            }
            dir = "straight";
        } else if(randomNum >= 6 && randomNum < 8){
            if(!this.leftTexture){
                const loader = new THREE.TextureLoader;
                this.leftTexture = loader.load('textures/lturnActually.png')
                texture = this.leftTexture;
            } else {
                texture = this.leftTexture;
            }
            dir = "left";
        } else if(randomNum >= 8){
            // if(!this.leftTexture){
            //     const loader = new THREE.TextureLoader;
            //     this.rightTexture = loader.load('textures/rturn.png')
            //     texture = this.rightTexture;
            // } else {
            //     texture = this.rightTexture;
            // }
            texture = new THREE.TextureLoader().load('textures/rturn.png');
            dir = "right";
        }
        
        const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 1, 1);
        const material = new THREE.MeshPhongMaterial({map: texture});
    
        const floor = new THREE.Mesh(geometry, material)
        floor.position.x = this.coordinates.x;
        floor.position.y = .075;
        floor.position.z = this.coordinates.z;
        this.coordinates = floor.position;
        floor.receiveShadow = true
        floor.rotation.x = - Math.PI / 2
        floor.rotation.z = Math.PI + this.currentRotation;
        floor.translateY(this.trackSize);

        this.currentTrack = new trackPiece(dir, floor);
        // this.currentTrack.mesh.position.x = this.coordinates.x;
        // this.currentTrack.mesh.position.z = this.coordinates.z;
        
        this.app.scene.add(floor)

        //Update rotation
        if(randomNum < 6){
            this.currentRotation == this.currentRotation;
        } else if(randomNum >= 6 && randomNum < 8){
            this.currentRotation += Math.PI/2;
        } else if(randomNum >= 8){
            this.currentRotation += -Math.PI/2;
        }

        this.currentRotation = this.currentRotation;
        Track.trackList.push(this.currentTrack);

        if(Track.trackList.length == 5){
            if(Track.trackList[0].obstacle){
                this.app.scene.remove(Track.trackList[0].obstacle);
                this.app.obstacles.shift();
            }
            
            this.app.scene.remove(Track.trackList[0].mesh);
            
            Track.trackList.shift();
        }

        //Generate a cone
        const loader = new FBXLoader();
        loader.load('assets/cone2.fbx', (obj) => {
            obj.traverse(function(child){
                child.castShadow = true;
            })
            obj.position.x = this.currentTrack.mesh.position.x + (Math.random() * 14) - 7;
            obj.position.z = this.currentTrack.mesh.position.z + (Math.random() * 14) - 7;
            obj.position.y = .1;
            this.app.scene.add(obj);
            this.app.obstacles.push(obj);
            this.currentTrack.obstacle = obj;
        })
        
    }

    getTrackPositions(){
        const pos = [];
        for(let i in Track.trackList){
            pos.push(Track.trackList[i].mesh.position);
        }

        return pos;
    }


    updateTrack(car: Player){
        const dist = new THREE.Vector3();
        dist.copy(this.currentTrack.mesh.position);
        dist.sub(car.mesh.position);
        if(dist.length() < this.trackSize - 3){
            this.generateTrack();
        }

        for(let i in AI.AIs){
            if (AI.AIs[i].reversed) continue;
            const botDist = new THREE.Vector3();
            botDist.copy(this.currentTrack.mesh.position);
            botDist.sub(AI.AIs[i].mesh.position);

            if(botDist.length() < this.trackSize - 3){
                this.generateTrack();
            }
        }
        
        let onatrack = false;
        for(let i in Track.trackList){
            const dist = new THREE.Vector3();
            dist.copy(Track.trackList[i].mesh.position);
            dist.sub(car.mesh.position);
            if(dist.length() <= 12){
                onatrack = true;
            }
        }

        if(!onatrack && UI.gameStarted){
            const gameOver = document.getElementById("gameOver");
            gameOver?.classList.remove('hiddenNoTransition');
            gameOver?.classList.add('visible');

            const gameOverScore = document.getElementById("gameOverScore");
            const finalScore = UI.score;
            if(gameOverScore){
                gameOverScore.innerText = `${~~finalScore}`;
            }

            this.app.player.acceleration = 0;
            this.app.player.velocity = 0;
            this.app.inputVector = new Vector3(0,0,0);

            const restartButton = document.getElementById("playAgain");
            restartButton?.addEventListener('click', (e)=>{
                e.preventDefault();
                location.reload();
            })
            
            // alert("off track!")
        }
    //     if(this.currentTrack.type == "straight"){
    //         if(car.mesh.position.z > this.currentTrack.position.z - 2){
    //             this.coordinates.x += 0;
    //             this.coordinates.z += 10;
    //             this.generateTrack();
    //         }
    //     }
        
    //     if(this.currentRotation == Math.PI / 2){
    //         if(car.mesh.position.x > this.currentTrack.position.x - 2){
    //             this.coordinates.x += 10;
    //             this.coordinates.z += 0;
    //             this.generateTrack();
    //         }
    //     }

    //     if(this.currentRotation == -Math.PI / 2){
    //         if(car.mesh.position.x > this.currentTrack.position.x - 2){
    //             this.coordinates.x -= 10;
    //             this.coordinates.z += 0;
    //             this.generateTrack();
    //         }
    //     }
    }
}

class trackPiece{
    public type: string;
    public mesh: THREE.Mesh;
    public obstacle: THREE.Group | null;
    constructor(type: string, floor: THREE.Mesh){
        this.type = type;
        this.mesh = floor;
        this.obstacle = null;
        // this.obstacle = new THREE.Group();
    }
}