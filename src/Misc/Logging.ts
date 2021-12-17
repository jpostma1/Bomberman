


// Logging manages different types of log messages, so they can be altered or turned off easily from this file.


const logStyles = {
    brownText: "color: brown",
    yellowText: "color: yellow",
    redText: "color: red",
    greenText: "color: green"
}


export function logGreen(message:any, objMessage:any = undefined) {
    if (objMessage != undefined)
        console.log("%c"+message, logStyles.greenText, objMessage)
    else 
        console.log("%c"+message, logStyles.greenText)
}

export function logRed(message:any, objMessage:any = undefined) {
    if (objMessage != undefined)
        console.log("%c"+message, logStyles.redText, objMessage)
    else 
        console.log("%c"+message, logStyles.redText)
}

export function logYellow(message:any, objMessage:any = undefined) {
    if (objMessage != undefined)
        console.log("%c"+message, logStyles.yellowText, objMessage)
    else 
        console.log("%c"+message, logStyles.yellowText)
}

export function logBrown(message:any, objMessage:any = undefined) {
    if (objMessage != undefined)
        console.log("%c"+message, logStyles.brownText, objMessage)
    else 
        console.log("%c"+message, logStyles.brownText)
}

export function log(message:any, objMessage:any = undefined) {
    if (objMessage != undefined)
        console.log(message, objMessage)
    else 
        console.log(message)
}

export function verboseLog(message:any, objMessage:any = undefined) {
    if (objMessage != undefined)
        console.log(message, objMessage)
    else 
        console.log(message)
}

export function debugLog(message:any, objMessage:any = undefined) {
    if (objMessage != undefined)
        console.log(message, objMessage)
    else 
        console.log(message)
}

export function importantLog(message:any, objMessage:any = undefined) {
    if (objMessage != undefined)
        console.warn(message, objMessage)
    else 
        console.warn(message)
}

export function logError(message:any, objMessage:any = undefined) {
    if (objMessage != undefined)
        console.error(message, objMessage)
    else 
        console.error(message)
}