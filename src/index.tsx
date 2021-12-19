
import * as PIXI from 'pixi.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { keyPressed } from './Input/KeyboardInput';
import { Game } from './GameLogic/Game';
import { debugLog, logYellow, verboseLog } from './Misc/Logging';
import { loadAssets } from './Rendering/LoadAssets';
import { Player } from './GameLogic/Player/Player';
import { forAll } from './HelperFunctions';



let game:Game 

loadAssets(() => {

    var levelString = [
        "............cwcwcwcwcwcwcwcwcwcwcwcwcwcwcwccw",
        "............c.c.c.c.c.c.........c.c.c.c.c.ccw",
        "............c.cwcwcwcwc.cwcwcwc.cwcwcwcwcwccw",
        "............cwcwc.......cwcwcwc.cwcwcwcwcwccw",
        "............c.c.c.c.c.c.c.c.c.c.c.c.c.c.c.ccw",
        "............cwcwc.cwc.c.c.c.cwc.cwcwcwcwcwccw",
        "............c.c.c.c.c.c.........c.c.c.c.c.ccw",
        "............cwcwc.cwc.c.cwcwcwc.cwcwcwcwcwccw",
        ".....cccccc.c.c.c.c.c.c.c.c.....c.c.c.c.c.ccw",
        "............cwcwc.cwcwcwcwc.cwcwc.cwcwcwcwccw",
        "...ccccc.cc.c.c.c.c.c.c.c.c.....c.c.c.c.c.ccw",
        ".......c.cc.cwcwc.c..wcwcwc.cwc.c.cwcwcwcwccw",
        "...ccc.c.cc.c.c.c.c.........c.c.c.c.c.c.c.ccw",
        ".....c.c....cwc.....cwc.cwc.cwc.c.cwcwcwcwccw",
        "...ccc......c.c.c.c.c.......c.c.c.c.c.c.c.ccw",
        ".........cc.cwc.cwcwcwc.cwc.cwc.c.cwcwcwcwccw",
        "...ccc...cc.c...............................w",
        "...c.....cc.c...............................w",
        "...ccc......c...............................w",
        "...ccc.c.cc.c...............................w",
        "...c.c.c.cc.c...............................w",
        "...c.c.c.cc.c...............................w",
        "............................................w",
        "...c.ccc...c................................w",
        "...c.ccc...c................................w",
        "...ccccc...c................................w",
        "............................................w",
        "............................................w"
    ]

    game = setupGame(levelString)
    // for global use in browser
    verboseLog(app)

    ReactDOM.render(<GameReporter game={game}></GameReporter>, document.getElementById('root'));
})



let viewPortWidth:number = 1000
// let viewPortHeight = 1000

let app:PIXI.Application

function setupGame(lvlString:string[]):Game {
    

    app = new PIXI.Application({
        width: viewPortWidth, 
        height: viewPortWidth*window.innerHeight/window.innerWidth,
        backgroundColor: 0x1099bb,
        antialias: false })
    document.body.appendChild(app.view)


    let thisGame = new Game(app, lvlString);
    verboseLog(thisGame)

    let frames = 0
    let last60frames = performance.now()
    app.ticker.add((deltaFrames) => {
        thisGame.runMechanics(deltaFrames)

        if (keyPressed("esc")) {
            app.ticker.stop()
            console.warn("ticker stopped!")
        }
    })

    return thisGame
}






interface GameState {
    game:Game
    
}

interface GameReporterState {
    gameOver:boolean
    winner:string
}

// hacky component for a quick GUI 
class GameReporter extends React.Component {
    constructor() {
        super({})

        this.state = {
            gameOver: false,
            winner: "No winner!"
        }

        game.setReactComponent(this)
    }
    props:GameState
    state:GameReporterState

    gameOver(players:Player[]) {
        this.state.gameOver = true
        forAll(players, (player:Player) => {
            if (player.alive)
                this.state.winner = player.name +" wins!"
        })
        this.setState(this.state)
    }

    gamePokes() {
        this.setState(this.state);
    }
    render() {
        return (
            <div>
                <div style={{ display: this.state.gameOver ? "block" : "none" }}>
                    <h1>GameOver! </h1>
                    <h2 color="green">{this.state.winner}</h2>
                </div>
                
            </div>
        );
    }
};

