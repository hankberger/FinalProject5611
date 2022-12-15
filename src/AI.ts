import Car from "./Car";
import App from "./Scene";
import { Vector3, Group } from "three";
import { getBots, getObstacles } from "./main";

export default class AI extends Car{
    public static numAI: number = 0;
    public static AIs: AI[] = [];
    public velocity_vec: Vector3;
    public last_ang: number = 0;
    public acc: Vector3;

    constructor(carMesh: Group, app: App){
        super(carMesh, app);
        AI.numAI += 1;

        this.getObstaclePositions();
        this.velocity_vec = new Vector3((Math.random() - 0.5) * 3, (Math.random() - 0.5) * 3, 0);
        this.last_ang = 0;
        AI.AIs.push(this);
    }

    //I copied this function from the Player class. Right now it just moves the bot using the same controls as the player.
    move(dt: number, movementVec: Vector3): void { 
        const ang = Math.atan2(this.velocity_vec.y, this.velocity_vec.x);
        this.mesh.rotateY(ang - this.last_ang);
        this.last_ang = ang;
        this.mesh.translateZ(this.velocity_vec.length() / 10);
        this.position = this.mesh.position;
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