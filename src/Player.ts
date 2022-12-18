import Car from "./Car";
import App from "./Scene";
import { Vector3, Group, _SRGBAFormat } from "three";

export default class Player extends Car {
    public direction_vec: Vector3;
    constructor(carMesh: Group, app: App){
        super(carMesh, app);
        this.direction_vec = new Vector3(1, 0, 0);
        this.velocity_vec.x = 1;
    }

    move(dt: number, movementVec: Vector3){
        // if(movementVec.z != 0){ //Forward / Backward Movement
        //     this.velocity += this.acceleration * dt * movementVec.z;
        //     this.velocity = Math.max(-this.maxSpeed, this.velocity);
        //     this.velocity = Math.min(this.maxSpeed, this.velocity);
            
        // } else { //Slowing down due to friction
        //     if(this.velocity < -0.01){
        //         this.velocity += .01;
                
        //     } else if(this.velocity > 0.01){
        //         this.velocity -= .01;
        //     } else if(this.velocity >= -.01 && this.velocity <= 0.01){
        //         this.velocity = 0;
        //     }
        // }

        // if(movementVec.x === 1){ //Turn Right?
        //     this.mesh.rotateY(10 * this.velocity * dt);
        // }

        // if(movementVec.x === -1){ //Turn Left? 
        //     this.mesh.rotateY(-10 * this.velocity * dt);
        // }

        // if(movementVec.x === 0){ //Not Turning
        //     // this.mesh.children[0].children[1].children[0].children[2].rotation.z = 0;
        // }

        // this.mesh.translateZ(this.velocity);
        // this.position = this.mesh.position;
        // // this.mesh.children[0].children[0].children[0].rotateY(.1)
        // return;

        // ---------------------------------------------------------------------
        // ----------------- using vectors to deal with movement -----------------
        // ---------------------------------------------------------------------

        // adjust direction vector
        const ANGLE = 0.1;
        const up = new Vector3(0, 0, 1);

        if(movementVec.x === 1) { // Turn Right
            this.direction_vec.applyAxisAngle(up, ANGLE);
        }

        if(movementVec.x === -1) { // Turn Left
            this.direction_vec.applyAxisAngle(up, -ANGLE);
        }

        if (movementVec.z === 1) {
            this.speed = Math.min(this.maxSpeed, this.speed + dt * this.acceleration);
        }
        else if (movementVec.z === -1) {
            this.speed = Math.max(-this.maxSpeed, this.speed - dt * this.acceleration);
        }
        else {
            this.speed = Math.max(0, this.speed * 0.9);
        }

        // compute velocity vec from direction vec and speed
        this.velocity_vec.copy(this.direction_vec);
        this.velocity_vec.normalize();
        this.velocity_vec.multiplyScalar(this.speed);

        this.moveVelocity()
        return;
    }
}