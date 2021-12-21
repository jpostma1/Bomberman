import { Application } from 'pixi.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { keyPressed } from './Input/KeyboardInput';
import { Game } from './GameLogic/Game';
import { verboseLog } from './Misc/Logging';
import { loadAssets } from './Rendering/LoadAssets';



loadAssets(() => {

    var levelString = [
        "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww",
        "w............cwcwcwcwcwcwcwcwcwcwcwcwcwcwcwccw",
        "w............c.c.c.c.c.c.........c.c.c.c.c.ccw",
        "w....p1......c.cwcwcwcwc.cwcwcwc.cwcwcwcwcwccw",
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
        "w...c.ccc...c...............p2...............w",
        "w...c.ccc...c................................w",
        "w...ccccc...c................................w",
        "w............................................w",
        "wwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwwww"
    ]

    let game = setupGame(levelString)

    ReactDOM.render(<GameReporter game={game}></GameReporter>, document.getElementById('root'));
})



let viewPortWidth:number = 1000
// let viewPortHeight = 1000


function setupGame(lvlString:string[]):Game {
    let app = new Application({
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
        thisGame.ui.update()

        if (keyPressed("esc") || thisGame.gameOver) {
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
    constructor(props:GameState) {
        super(props)

        this.state = {
            gameOver: false,
            winner: "No winner!",
            secondsLeft: 0,
        }

        // I thought this would happen in super(props)
        // but TS requires this with "strictPropertyInitialization = true"
        this.props = props

        props.game.setReactComponent(this)
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

