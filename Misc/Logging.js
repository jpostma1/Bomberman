


// Logging manages different types of log messages, so they can be altered or turned off easily from this file.


const logStyles = {
  redText: "color: red",
  greenText: "color: green"
}


function logGreen(message) {
    console.log("%c"+message, logStyles.greenText)
}

function logRed(message) {
    console.log("%c"+message, logStyles.redText)
}

function log(message) {
    console.log(message)
}

function verboseLog(message) {
    console.log(message)
}

function debugLog(message) {
    console.log(message)
}

function importantLog(message) {
    console.warn(message)
}

function logError(message) {
    console.error(message)
}