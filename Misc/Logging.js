


// Logging manages different types of log messages, so they can be altered or turned off easily from this file.


const logStyles = {
    brownText: "color: brown",
    yellowText: "color: yellow",
    redText: "color: red",
    greenText: "color: green"
}


function logGreen(message, objMessage) {
    console.log("%c"+message, logStyles.greenText, objMessage)
}

function logRed(message, objMessage) {
    console.log("%c"+message, logStyles.redText, objMessage)
}

function logYellow(message, objMessage) {
    console.log("%c"+message, logStyles.yellowText, objMessage)
}

function logBrown(message, objMessage) {
    console.log("%c"+message, logStyles.brownText, objMessage)
}

function log(message, objMessage) {
    console.log(message, objMessage)
}

function verboseLog(message, objMessage) {
    console.log(message, objMessage)
}

function debugLog(message, objMessage) {
    console.log(message, objMessage)
}

function importantLog(message, objMessage) {
    console.warn(message, objMessage)
}

function logError(message, objMessage) {
    console.error(message, objMessage)
}