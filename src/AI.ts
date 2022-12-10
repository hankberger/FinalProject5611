import Car from "./Car";
import App from "./Scene";
import { Vector3, Group } from "three";

export default class AI extends Car{
    public static numAI: number = 0;
    constructor(carMesh: Group, app: App){
        super(carMesh, app);
        AI.numAI += 1;
    }

    move(dt: number, movementVec: Vector3): void {
        
    }
}