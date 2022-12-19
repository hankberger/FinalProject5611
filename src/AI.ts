import Car from "./Car";
import App from "./Scene";
import { Vector3, Group } from "three";
import { getBots, getObstacles } from "./main";
import Track from "./Track";
import Player from "./Player";

export default class AI extends Car{
    public static numAI: number = 0;
    public static AIs: AI[] = [];
    public acc: Vector3;
    public movementArr: Vector3[];
    public speed: number;
    public track: Track;
    public player: Player;
    public offset_x: number;
    public offset_z: number;

    constructor(carMesh: Group, app: App, track: Track, player: Player){
        super(carMesh, app);
        AI.numAI += 1;

        // this.getObstaclePositions();
        this.velocity_vec = new Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0);
        this.last_ang = 0;
        AI.AIs.push(this);
        this.track = track;
        this.movementArr = track.getTrackPositions();
        this.speed = .45;
        this.player = player;
        this.offset_x = Math.random() * 10 - 5;
        this.offset_z = Math.random() * 10 - 5;
    }

    //I copied this function from the Player class. Right now it just moves the bot using the same controls as the player.
    move(dt: number, movementVec: Vector3): void { 
        const ang = Math.atan2(this.velocity_vec.y, this.velocity_vec.x);
        this.mesh.rotateY(ang - this.last_ang);
        this.last_ang = ang;
        this.mesh.translateZ(this.velocity_vec.length() / 10);
        this.position = this.mesh.position;
    }

    moveToTrack(dt: number){
        const newTrack = this.track.getTrackPositions();

        // handle adding a new track
        if (this.movementArr.length != newTrack.length) {
            this.movementArr.push(newTrack[newTrack.length - 1]);
        }

        if (this.movementArr.length == 0) {
            return;
        }

        // set new velocity to make car move towards goal
        const curPos = this.mesh.position;
        const goalPos = new Vector3();
        goalPos.copy(this.movementArr[0]);
        
        // add a little noise to the goal position
        goalPos.x += this.offset_x;
        goalPos.z += this.offset_z;

        const new_vel = new Vector3();
        new_vel.subVectors(goalPos, curPos);
        new_vel.normalize();
        new_vel.y = new_vel.x;
        new_vel.x = new_vel.z;
        this.velocity_vec = new_vel.multiplyScalar(5);
        this.moveVelocity();

        // update track list
        const dist = new Vector3();
        dist.subVectors(goalPos, curPos);
        if (dist.length() < 1){
            this.movementArr.shift();
            return;
        }


        return;

        // this.speed = .1 + (this.player.velocity * Math.random()) ;
        // let curPos = this.mesh.position;
        // let goalPos = this.movementArr[0];

        // let dir = new Vector3();
        // dir.subVectors(goalPos, curPos);

        //  let goalRotation = Math.atan2(dir.x, dir.z);
        // if(Math.abs((this.mesh.rotation.y) - goalRotation) < .15){
        //     //Do nothing
        // } else if(this.mesh.rotation.y < (this.mesh.rotation.y + goalRotation) / 2){
        //     this.mesh.rotation.y += .1;
        // } else {
        //     this.mesh.rotation.y -= .1;
        // }

        // if(dir.length() < .25){
        //     this.movementArr.shift();
        //     return;
        // }

        // if(!((this.speed * dt) > dir.length())){
        //     dir.normalize();
        // } else {
        //     this.mesh.position.x = this.movementArr[0].x;
        //     this.mesh.position.z = this.movementArr[0].z;
        // }

        // const vel = dir.multiplyScalar(this.speed);
        // this.mesh.position.add(new Vector3(vel.x, 0, vel.z));
        // return;
    }

    applyAcc(): void {
        this.velocity_vec.add(this.acc);
        this.velocity_vec.setLength(10);

        // boundary condition
        if (this.position.x > 100 || this.position.x < -100) {
            this.velocity_vec.y = -this.velocity_vec.y;
        }
        if (this.position.z > 100 || this.position.z < -100) {
            this.velocity_vec.x = -this.velocity_vec.x;
        }
    }
}