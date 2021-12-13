


var exampleGame
let viewPortWidth = 1000
let viewPortHeight = 1000
function example4SimpleCollision(lvlString) {
    

    app = new PIXI.Application({
        width: viewPortWidth, 
        height: viewPortHeight,
        backgroundColor: 0x1099bb })
    document.body.appendChild(app.view)
    
    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST


    // examplePlayer = spawnExamplePlayer(isoStage, 0, 0, playerZIndex);
    // examplePlayerManager = spawnExamplePlayerManager(isoStage, sheetWidth, sheetHeight);

    exampleGame = spawnExampleGame(app, lvlString);

    app.ticker.add((deltaFrames) => {
        exampleGame.runMechanics(deltaFrames)
    })
}

