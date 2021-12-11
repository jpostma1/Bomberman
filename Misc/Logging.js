


// Logging manages different types of log messages, so they can be altered or turned off easily from this file.

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