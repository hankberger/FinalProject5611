import { Group, Mesh, Vector3 } from "three";
import App from "./Scene";
import * as CANNON from 'cannon-es';
import CannonDebugRenderer from "./utils/cannonDebugRenderer";

//ABSTRACT CAR CLASS: Should be inherited for different types of players. See AI.ts or Player.ts for example.
export default class Car{
    public id: number;
    public acceleration: number;
    public velocity: number;
    public mesh: Group;
    public hitbox: CANNON.Body | null;
    public app: App;

    public static numCars = 0;

    constructor(carMesh: Group, app: App){
        this.id = Car.numCars;
        Car.numCars += 1;

        this.acceleration = .2;
        this.velocity = 0;
        
        this.mesh = carMesh;

        const carBodyShape = new CANNON.Box(new CANNON.Vec3(0.5, 0.5, 1))   
        const carBody = new CANNON.Body({ mass: 1 })
        carBody.addShape(carBodyShape)
        carBody.position.y = 0;
        this.hitbox = carBody;

        this.app = app;


    }

    //Virtual Function, Implement this in the base class (AI, Player). 
    protected move(dt: number, movementVec: Vector3): void {

    }
}