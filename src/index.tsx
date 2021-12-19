
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
        "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
        "w............cwcwcwcwcwcwcwcwcwcwcwcwcwcwcwccw",
        "w............c.c.c.c.c.c.........c.c.c.c.c.ccw",
        "w............c.cwcwcwcwc.cwcwcwc.cwcwcwcwcwccw",
        "w............cwcwc.......cwcwcwc.cwcwcwcwcwccw",
        "w............c.c.c.c.c.c.c.c.c.c.c.c.c.c.c.ccw",
        "w............cwcwc.cwc.c.c.c.cwc.cwcwcwcwcwccw",
        "w............c.c.c.c.c.c.........c.c.c.c.c.ccw",
        "w............cwcwc.cwc.c.cwcwcwc.cwcwcwcwcwccw",
        "w.....cccccc.c.c.c.c.c.c.c.c.....c.c.c.c.c.ccw",
        "w............cwcwc.cwcwcwcwc.cwcwc.cwcwcwcwccw",
        "w...ccccc.cc.c.c.c.c.c.c.c.c.....c.c.c.c.c.ccw",
        "w.......c.cc.cwcwc.c..wcwcwc.cwc.c.cwcwcwcwccw",
        "w...ccc.c.cc.c.c.c.c.........c.c.c.c.c.c.c.ccw",
        "w.....c.c....cwc.....cwc.cwc.cwc.c.cwcwcwcwccw",
        "w...ccc......c.c.c.c.c.......c.c.c.c.c.c.c.ccw",
        "w.........cc.cwc.cwcwcwc.cwc.cwc.c.cwcwcwcwccw",
        "w...ccc...cc.c...............................w",
        "w...c.....cc.c...............................w",
        "w...ccc......c...............................w",
        "w...ccc.c.cc.c...............................w",
        "w...c.c.c.cc.c...............................w",
        "w...c.c.c.cc.c...............................w",
        "w............................................w",
        "w...c.ccc...c................................w",
        "w...c.ccc...c................................w",
        "w...ccccc...c................................w",
        "w............................................w",
        "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"
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
        backgroundColor: 0xFFFFFF,
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
    secondsLeft:number
}

// hacky component for a quick GUI 
class GameReporter extends React.Component {
    constructor() {
        super({})

        this.state = {
            gameOver: false,
            winner: "No winner!",
            secondsLeft: 0,
        }

        game.setReactComponent(this)
    }
    props:GameState
    state:GameReporterState

    gameOver(winnerMessage:string) {
        this.state.gameOver = true
        this.state.winner = winnerMessage
        this.setState(this.state)
    }

    updateClock(secondsLeft:number) {
        this.state.secondsLeft = secondsLeft
        this.setState(this.state)
    }

    gamePokes() {
        this.setState(this.state);
    }
    render() {
        return (
            <div>
                <div style={{ display: this.state.secondsLeft > 0 ? "block" : "none" }}>
                    <h2 color="black">{Math.ceil(this.state.secondsLeft)}</h2>
                </div>
                <div style={{ display: this.state.gameOver ? "block" : "none" }}>
                    <h1>GameOver! </h1>
                    <h2 color="green">{this.state.winner}</h2>
                </div>
                
            </div>
        );
    }
};

