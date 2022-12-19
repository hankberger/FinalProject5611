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

        // avoidance force with player
        const pos1 = this.xz_to_xy(this.position);
        const pos2 = this.xz_to_xy(player.position);

        const t = this.ttc(pos1, this.velocity_vec, pos2, player.velocity_vec);
        // console.log(t);

        if (false) {
            //A_future = A_current + A_vel*ttc; B_future + B_current + B_vel*ttc;
            const a_dist = new Vector3();
            a_dist.copy(this.velocity_vec);
            a_dist.multiplyScalar(t);

            const af = new Vector3();
            af.addVectors(pos1, a_dist);

            const b_dist = new Vector3();
            b_dist.copy(player.velocity_vec);
            b_dist.multiplyScalar(t);

            const bf = new Vector3();
            
            bf.addVectors(pos2, b_dist);

            const rel = new Vector3();
            rel.subVectors(af, bf);
            const k_avoid = 200;
            rel.setLength(k_avoid * (1 / t));

            acc.add(rel);
        }

        this.acc = acc;
    }

    ttc(pos1: Vector3, vel1: Vector3, pos2: Vector3, vel2: Vector3): number {
        const dist = new Vector3();
        dist.subVectors(pos2, pos1)
        if (dist.length() <= 1) {
            return 0;
        }
        const rel_vel = new Vector3()
        rel_vel.subVectors(vel2, vel1);

        const time = this.rayCircleIntersectTime(pos1, 10, pos2, rel_vel);

        return time;
    }

    rayCircleIntersectTime(center: Vector3, r: number, l_start: Vector3, l_dir: Vector3) {
 
        //Compute displacement vector pointing from the start of the line segment to the center of the circle
        const toCircle = new Vector3();
        toCircle.subVectors(center, l_start);
       
        //Solve quadratic equation for intersection point (in terms of l_dir and toCircle)
        const a = l_dir.length();

        // const b = -2*dot(l_dir,toCircle); //-2*dot(l_dir,toCircle)
        const b = l_dir.dot(toCircle) * -2;

        const c = toCircle.lengthSq() - (r*r); //different of squared distances

        const d = b*b - 4*a*c; //discriminant
       
        if (d >=0 ){
          //If d is positive we know the line is colliding
          const t = (-b - Math.sqrt(d))/(2*a); //Optimization: we typically only need the first collision!
          if (t >= 0) return t;
          return -1;
        }
       
        return -1; //We are not colliding, so there is no good t to return
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