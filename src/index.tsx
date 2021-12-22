import { Application, Container } from 'pixi.js';
import { keyJustPressed, keyJustPressedListener, keyPressed } from './Input/KeyboardInput';
import { Game } from './GameLogic/Game';
import { loadAssets } from './Rendering/LoadAssets';
import { BombermanSettings, gameSettings, itemSettings, levelString, startSkills, viewPortWidth } from './Misc/Settings';
import stripJsonComments from 'strip-json-comments';

let settings:BombermanSettings = {

    gameSettings: gameSettings,
    startSkills: startSkills,
    itemSettings: itemSettings,
    levelString: levelString
}

let tickHandler:(deltaFrames:number) => void 
let app:Application
let initializationComplete:boolean = false
loadAssets(() => {

    app = new Application({
        width: viewPortWidth, 
        height: viewPortWidth*window.innerHeight/window.innerWidth,
        backgroundColor: 0xFFFFFF,
        antialias: false })
    document.body.appendChild(app.view)
    tickHandler = setupGame(app, settings)
    
    initializationComplete = true

    let restartFunc = (event:KeyboardEvent) => {
        if (keyJustPressed(event, 'n')) {
            restart()
        }
    }

    keyJustPressedListener.addKeyJustPressedFunction(restartFunc)
})

let fileInput = document.getElementById("customSettings")
if (fileInput) {
    fileInput.onclick = function () {
        try {
            let element:any = document.activeElement
            // since 'spacebar' is bombplacement, the fileInput gets triggered
            // so we need to blur the focus.
            if (element as any) {
                console.log("before blure")
                element.blur()
                console.log("after blure")
            }
                
        } catch(e) {
            console.error(e)
        }
    }
    fileInput.onchange = function openCustomSettings(this:any) {
        
        let fileInfo = this.files[0];
        let fileReader = new FileReader();
        fileReader.readAsText(fileInfo);
        fileReader.onload = function(event:ProgressEvent<FileReader>) {
            let configString:any = fileReader.result
            if (configString as string) {
                settings = JSON.parse(stripJsonComments(configString))
                restart()
            }
        }
    }
}
    


function restart() {
    if (!initializationComplete) {
        console.warn("initialization not complete")
        return
    }

    // NOTE: doesn't clean up everything! 
    // but the WebGL context is reused so can easily restart >25 times
    app.stage.destroy()
    app.stage = new Container()
    app.ticker.remove(tickHandler)
    tickHandler = setupGame(app, settings)
    app.ticker.start()
}

function setupGame(app:Application, settings:BombermanSettings) : (deltaFrames:number) => void {
// function setupGame(app:Application, lvlString:string[]) : (deltaFrames:number) => void {
    let thisGame = new Game(app, settings);

    let tickHandler = (deltaFrames:number) => {
        if (!thisGame.gameOver) {
            thisGame.runMechanics(deltaFrames)
            thisGame.ui.update(Math.floor(thisGame.getSecondsLeft()))
        } else {
            app.ticker.stop()
        }

        if (keyPressed("esc")) {
            app.ticker.stop()
            console.warn("ticker force stopped!")
        }
    }

    app.ticker.add(tickHandler)

    return tickHandler
}