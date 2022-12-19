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
            this.speed = Math.min(this.maxSpeed, this.speed + dt * this.acceleration * .6);
        }
        // else if (movementVec.z === -1) {
        //     this.speed = Math.max(-this.maxSpeed, this.speed - dt * this.acceleration * .6);
        // }
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