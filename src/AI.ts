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
    public reversed: boolean;
    public lastGoal: Vector3;

    constructor(carMesh: Group, app: App, track: Track, player: Player, reversed: boolean){
        super(carMesh, app);
        AI.numAI += 1;

        // this.getObstaclePositions();
        this.velocity_vec = new Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0);
        this.last_ang = 0;
        AI.AIs.push(this);
        this.track = track;
        this.speed = .45;
        this.player = player;
        this.offset_x = Math.random() * 10 - 5;
        this.offset_z = Math.random() * 10 - 5;
        this.movementArr = [...track.getTrackPositions()];
        this.reversed = reversed;
        if (reversed) {
            this.movementArr.reverse();
        }
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
        if (this.movementArr.length === 0) return this.lastGoal;

        // Find new goal position
        const goalPos = new Vector3();
        goalPos.copy(this.movementArr[0]);
        
        // add a little noise to the goal position
        goalPos.x += this.offset_x;
        goalPos.z += this.offset_z;

        this.lastGoal = goalPos;
        return goalPos;
    }

    xz_to_xy(xz: Vector3): Vector3 {
        const xy = new Vector3();
        xy.y = xz.x;
        xy.x = xz.z;
        return xy;
    }


    computeForce(player: Player): void {
        const acc = new Vector3();

        const goalPos = this.getGoalPosition();

        // find new goal velocity
        const curPos = this.mesh.position;
        const goal_vel = new Vector3();
        goal_vel.subVectors(goalPos, curPos);
        goal_vel.setLength(10);
        goal_vel.y = goal_vel.x;
        goal_vel.x = goal_vel.z;

        const goal_force = new Vector3();
        goal_force.subVectors(goal_vel, this.velocity_vec);
        goal_force.setLength(10);

        acc.add(goal_force);

        const sepForce_maxD = 20;
        const sepScale = 5;
        const obstacleSepScale = 10;

        // separation
        for (const other of AI.AIs) {
            const dist = new Vector3();

            const other_pos = this.xz_to_xy(other.position);
            const this_pos = this.xz_to_xy(this.position);
            dist.copy(this_pos);
            dist.sub(other_pos);

            if (dist.length() < 0.01 || dist.length() > sepForce_maxD) continue;

            const sepForce = new Vector3();
            sepForce.copy(dist);
            sepForce.setLength(sepScale / Math.pow(dist.length(), 2));
            acc.add(sepForce);
        }

        // obstacle separation
        for (const obs of this.app.obstacles) {
            const dist = new Vector3();
            const obs_pos = this.xz_to_xy(obs.position);
            const this_pos = this.xz_to_xy(this.position);
            dist.copy(this_pos);
            dist.sub(obs_pos);

            if (dist.length() > 10) {
                continue;
            }

            // console.log("ai obstacle separation force");
            const sepForce = new Vector3();
            sepForce.copy(dist);
            sepForce.setLength(obstacleSepScale / dist.length());
            acc.add(sepForce);
        }

        // player separation
        const dist = new Vector3();
        const player_pos = this.xz_to_xy(this.app.player.position);
        const this_pos = this.xz_to_xy(this.position);
        dist.copy(this_pos);
        dist.sub(player_pos);

        if (dist.length() < sepForce_maxD) {
            // console.log("ai player separation force");
            const sepForce = new Vector3();
            sepForce.copy(dist);
            sepForce.setLength(sepScale * 4 / dist.length());
            acc.add(sepForce);
        }

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

        if (!this.reversed) {
            const newTrack = this.track.getTrackPositions();
            // handle adding a new track
            if (this.movementArr.length != newTrack.length) {
                this.movementArr.push(newTrack[newTrack.length - 1]);
            }
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