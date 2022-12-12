import { Group, Mesh, Vector3 } from "three";
import App from "./Scene";

//ABSTRACT CAR CLASS: Should be inherited for different types of players. See AI.ts or Player.ts for example.
export default class Car{
    public id: number;
    public acceleration: number;
    public velocity: number;
    public position: Vector3;
    public mesh: Group;
    public app: App;
    public maxSpeed: number;

    public static numCars = 0;

    constructor(carMesh: Group, app: App){
        this.id = Car.numCars;
        Car.numCars += 1;

        this.acceleration = .2;
        this.velocity = 0;
        
        this.mesh = carMesh;
        this.position = new Vector3();

        this.app = app;

        this.maxSpeed = .25;
    }

    //Virtual Function, Implement this in the base class (AI, Player). 
    protected move(dt: number, movementVec: Vector3): void {

    }
}