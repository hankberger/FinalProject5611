import Car from "./Car";
import App from "./Scene";
import { Vector3, Group } from "three";

export default class Player extends Car{
    constructor(carMesh: Group, app: App){
        super(carMesh, app);
    }

    move(dt: number, movementVec: Vector3){
        if(movementVec.z != 0){ //Forward / Backward Movement
            this.velocity += this.acceleration * dt * movementVec.z;
            this.velocity = Math.max(-.5, this.velocity);
            this.velocity = Math.min(.5, this.velocity);
            
        } else { //Slowing down due to friction
            if(this.velocity < -0.01){
                this.velocity += .01;
                
            } else if(this.velocity > 0.01){
                this.velocity -= .01;
            } else if(this.velocity >= -.01 && this.velocity <= .01){
                this.velocity = 0;
            }
        }

        if(movementVec.x === 1){ //Turn Right?
            this.mesh.rotateY(10 * this.velocity * dt);
        }

        if(movementVec.x === -1){ //Turn Left? 
            this.mesh.rotateY(-10 * this.velocity * dt);
        }

        if(movementVec.x === 0){ //Not Turning
            // this.mesh.children[0].children[1].children[0].children[2].rotation.z = 0;
        }

        this.mesh.translateZ(this.velocity);
        this.position = this.mesh.position;
        // this.mesh.children[0].children[0].children[0].rotateY(.1)
        return;
    }
}