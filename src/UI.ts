import Player from './Player';
import Scene from './Scene'

export default class UI{
    public score: number;

    constructor(){
        this.score = 0;
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
            
            console.log('yeet');
        })
    }

    updateScore(dt: number, player: Player){
        this.score += player.velocity_vec.length();
        const scoreDiv = document.getElementById('scorenumber');
        if(scoreDiv){
            scoreDiv.innerText = `${~~this.score}`;
        }
        
    }
}





