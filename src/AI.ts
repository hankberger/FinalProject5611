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

    getGoalPosition(): Vector3 {

        // Find new goal position
        const goalPos = new Vector3();
        goalPos.copy(this.movementArr[0]);
        
        // add a little noise to the goal position
        goalPos.x += this.offset_x;
        goalPos.z += this.offset_z;

        return goalPos;
    }

    computeForce(): void {
        const acc = new Vector3();

        const goalPos = this.getGoalPosition();

        // find new goal velocity
        const curPos = this.mesh.position;
        const goal_vel = new Vector3();
        goal_vel.subVectors(goalPos, curPos);
        goal_vel.setLength(10);
        goal_vel.y = goal_vel.x;
        goal_vel.x = goal_vel.z;
        console.log(goal_vel)

        const goal_force = new Vector3();
        goal_force.subVectors(goal_vel, this.velocity_vec);
        goal_force.setLength(10);
        console.log(goal_force);

        acc.add(goal_force);

        this.acc = acc;
    }

    updateVelocity(): void {
        const add = new Vector3();
        add.copy(this.acc);
        add.setLength(2);

        const beta = 0.9;

        const first = new Vector3();
        first.copy(this.velocity_vec);
        first.multiplyScalar(beta);

        add.multiplyScalar(1 - beta);

        this.velocity_vec.addVectors(first, add);
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

        this.moveVelocity();

        // update track list
        const goalPos = this.getGoalPosition();
        const curPos = this.mesh.position;

        const dist = new Vector3();
        dist.subVectors(goalPos, curPos);
        if (dist.length() < 1){
            this.movementArr.shift();
            return;
        }


        return;
    }
}