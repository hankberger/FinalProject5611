export default class Car{
    public static id: number;
    public acceleration: number;
    public velocity: number;
    constructor(){
        Car.id += 1;
    }
}