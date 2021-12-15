


// Logging manages different types of log messages, so they can be altered or turned off easily from this file.


const logStyles = {
    brownText: "color: brown",
    yellowText: "color: yellow",
    redText: "color: red",
    greenText: "color: green"
}


function logGreen(message, objMessage) {
    if (objMessage != undefined)
        console.log("%c"+message, logStyles.greenText, objMessage)
    else 
        console.log("%c"+message, logStyles.greenText)
}

function logRed(message, objMessage) {
    if (objMessage != undefined)
        console.log("%c"+message, logStyles.redText, objMessage)
    else 
        console.log("%c"+message, logStyles.redText)
}

function logYellow(message, objMessage) {
    if (objMessage != undefined)
        console.log("%c"+message, logStyles.yellowText, objMessage)
    else 
        console.log("%c"+message, logStyles.yellowText)
}

function logBrown(message, objMessage) {
    if (objMessage != undefined)
        console.log("%c"+message, logStyles.brownText, objMessage)
    else 
        console.log("%c"+message, logStyles.brownText)
}

function log(message, objMessage) {
    if (objMessage != undefined)
        console.log(message, objMessage)
    else 
        console.log(message)
}

function verboseLog(message, objMessage) {
    if (objMessage != undefined)
        console.log(message, objMessage)
    else 
        console.log(message)
}

function debugLog(message, objMessage) {
    if (objMessage != undefined)
        console.log(message, objMessage)
    else 
        console.log(message)
}

function importantLog(message, objMessage) {
    if (objMessage != undefined)
        console.warn(message, objMessage)
    else 
        console.warn(message)
}

function logError(message, objMessage) {
    if (objMessage != undefined)
        console.error(message, objMessage)
    else 
        console.error(message)
}