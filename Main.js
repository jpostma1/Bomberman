



// set for global use
var random = new Math.seedrandom('41849194');
var app; 



loadAssets(() => {
    verboseLog("Assets Loaded")
    var levelString = [
        "............c..",
        "............c..",
        "............c..",
        "............c..",
        "............c..",
        "............c..",
        "............c..",
        "............c..",
        ".....cccccc.c..",
        "............c..",
        "...ccccc.cc.c..",
        ".......c.cc.c..",
        "...ccc.c.cc.c..",
        ".....c.c....c..",
        "...ccc......c..",
        ".........cc.c..",
        "...ccc...cc.c..",
        "...c.....cc.c..",
        "...ccc......c..",
        "...ccc.c.cc.c..",
        "...c.c.c.cc.c..",
        "...c.c.c.wc.c..",
        "...............",
        "...c.ccc...c...",
        "...c.ccc...c...",
        "...ccccc...c...",
        "...............",
        "..............."
    ]
    newGame(levelString)

    // example2ParseSpriteSheet()
    // example3IsometricTiling(levelString)
    // example4SimpleCollision(levelString)
    // exampleIsometricWithSideView(levelString)

    exampleSideViewGame(levelString)
})