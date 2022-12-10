import Car from "./Car";
import App from "./Scene";
import { Vector3, Group } from "three";
import { getBots, getObstacles } from "./main";

export default class AI extends Car{
    public static numAI: number = 0;
    constructor(carMesh: Group, app: App){
        super(carMesh, app);
        AI.numAI += 1;

        this.getObstaclePositions();
        
    }

    //I copied this function from the Player class. Right now it just moves the bot using the same controls as the player.
    move(dt: number, movementVec: Vector3): void { 
        if(movementVec.z != 0){ //Forward / Backward Movement
            this.velocity += this.acceleration * dt * movementVec.z;
            this.velocity = Math.max(-.5, this.velocity);
            this.velocity = Math.min(.5, this.velocity);
            
        } else { //Slowing down due to friction
            if(this.velocity < -0.01){
                this.velocity += .01;
                
            } else if(this.velocity > 0.01){
                this.velocity -= .01;
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

    //Returns an array of Vec3 positions of all bots except self. 
    getBotPositions(): Vector3[]{
        const bots = getBots();
        const botPositions: Vector3[] = [];

        bots.forEach((bot, i)=>{
            if(i != this.id - 1){
                botPositions.push(bot.position);
            }
        });

        return botPositions;
    }

    //Return an array of Vec3 positions of all obstacles.
    getObstaclePositions(): Vector3[]{
        const obstacleArr = getObstacles();
        const obstaclePositions: Vector3[] = [];

        obstacleArr.forEach((obj) => {
            obstaclePositions.push(obj.position);
        });

        return obstaclePositions;
    }
}