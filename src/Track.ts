import Scene from "./Scene";
import * as THREE from 'three';
import Player from "./Player";
import { Mesh } from "three";

export default class Track{
    public app: Scene;
    public currentTrack: trackPiece;
    public currentRotation: number;
    public coordinates: THREE.Vector3;

    constructor(app: Scene){
        this.app = app;
        this.currentTrack = new trackPiece('start', new THREE.Mesh());
        this.currentRotation = 0;
        this.coordinates = new THREE.Vector3();
        this.generateTrack();
    }

    generateTrack() {
        const WIDTH = 10
        const LENGTH = 10

        const randomNum = ~~(Math.random()* 10);
    
        let texture;
        let dir = "";
        if(randomNum < 6){
            texture = new THREE.TextureLoader().load( 'textures/track_straight.png' );
            dir = "straight";
        } else if(randomNum >= 6 && randomNum < 8){
            texture = new THREE.TextureLoader().load( 'textures/track_lturn.png' );
            dir = "left";
        } else if(randomNum >= 8){
            texture = new THREE.TextureLoader().load( 'textures/track_rturn.png' );
            dir = "right";
        }
        

    
        const geometry = new THREE.PlaneGeometry(WIDTH, LENGTH, 512, 512);
        const material = new THREE.MeshPhongMaterial({map: texture});
    
        const floor = new THREE.Mesh(geometry, material)
        floor.position.x = this.coordinates.x;
        floor.position.z = this.coordinates.z
        this.coordinates = floor.position;
        floor.receiveShadow = true
        floor.rotation.x = - Math.PI / 2
        floor.rotation.z = Math.PI + this.currentRotation;
        floor.translateY(10);

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
    }


    updateTrack(car: Player){
        const dist = new THREE.Vector3();
        dist.copy(this.currentTrack.mesh.position);
        dist.sub(car.mesh.position);
        if(dist.length() < 7){
            this.generateTrack();
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
    constructor(type: string, floor: THREE.Mesh){
        this.type = type;
        this.mesh = floor;
    }
}