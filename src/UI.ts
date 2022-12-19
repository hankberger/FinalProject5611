// @ts-nocheck
import Player from './Player';
import Scene from './Scene'

export default class UI{
    public static score: number;
    public static gameStarted: boolean;

    constructor(){
        UI.score = 0;
        UI.gameStarted = false;
        this.buildControls();
    }

    buildControls(){
        this.setupDevControls();
        this.startGameControls();
       
    }

    setupDevControls(){
    
    }
    
    startGameControls(){
        const startButton = document.getElementById("start");
        const panel = document.getElementById('startGame')
        console.log(startButton);
        startButton?.addEventListener('click', (e)=>{
            e.preventDefault();
            panel?.classList.remove('visible');
            panel?.classList.add('hidden');
            UI.gameStarted = true;
            // console.log('yeet');
        })
    }

    updateScore(dt: number, player: Player){
        UI.score += player.velocity_vec.length();
        const scoreDiv = document.getElementById('scorenumber');
        if(scoreDiv){
            scoreDiv.innerText = `${~~UI.score}`;
        }
        
    }
}





