import { Group, Mesh, Vector3 } from "three";
import App from "./Scene";

//ABSTRACT CAR CLASS: Should be inherited for different types of players. See AI.ts or Player.ts for example.
export default class Car{
    public id: number;
    public acceleration: number;
    public velocity: number;
    public speed: number = 0;
    public velocity_vec: Vector3;
    public position: Vector3;
    public mesh: Group;
    public app: App;
    public maxSpeed: number;
    public last_ang: number;

    public static numCars = 0;

    constructor(carMesh: Group, app: App){
        this.velocity_vec = new Vector3();
        this.last_ang = 0;
        this.id = Car.numCars;
        Car.numCars += 1;

        this.acceleration = 5;
        this.velocity = 0;
        
        this.mesh = carMesh;
        this.position = new Vector3();

        this.app = app;

        this.maxSpeed = 2;
    }

    //Virtual Function, Implement this in the base class (AI, Player). 
    protected move(dt: number, movementVec: Vector3): void {

    }

    // Moves car based on velocity vector
    moveVelocity(): void {
        if (this.velocity_vec.length() < 0.01) return;
        let ang = Math.atan2(this.velocity_vec.y, this.velocity_vec.x);
        this.mesh.rotateY(ang - this.last_ang);
        if (this.speed < 0) {
            this.mesh.rotateY(Math.PI);
            ang += Math.PI;
        }

        this.last_ang = ang;
        let toTranslate = this.velocity_vec.length() / 10;
        if (this.speed < 0) {
            toTranslate = -toTranslate;
        }
        this.mesh.translateZ(toTranslate);
        this.position = this.mesh.position;
    }
}