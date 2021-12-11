var keyMap = {};
var keyTime = {};
var shortcutControl = "inactive"


var keyCode = {enter:13, shift:16, ctrl:17, alt:18, caps:20, esc:27, a:65, b:66, c:67, d:68, e:69, f:70, g:71, h:72, i:73, j:74, k:75, l:76, m:77, n:78, o:79, p:80, q:81, r:82, s:83, t:84, u:85, v:86, w:87, x:88, y:89, z:90, space:32, left:37, up:38, right:39, down:40,
    1:49, 2:50, 3:51, 4:52, 5:53, 6:54, 7:55, 8:56, 9:57, 0:58, 
};

for(var key in keyCode)
    keyTime[keyCode[key]] = -1

//add functions to this list to set keyJustPressed calls from other files.
customKeyJustPressedFunctions = [];

// begin | ----------------- handle keyboard input -----------------    
onkeydown = onkeyup = function (e) {
    e = e || event; // to deal with IE


    var keyIsDown = e.type == 'keydown';
    keyMap[e.keyCode] = keyIsDown;
    
    //TODO: also make a dictionary with custom functions just for certain keyCodes
    for(var func of customKeyJustPressedFunctions) {
        if (typeof func == 'function') {
            func(e);
        }
    }
    
    if (keyIsDown && keyTime[e.keyCode] == -1)
        keyTime[e.keyCode] = performance.now();
    else if(!keyIsDown) {
        keyTime[e.keyCode] = -1;
    }

    if (e.keyCode == keyCode['space']) {
        e.preventDefault();
    }
}


function clearKeyMap() {
    verboseLog("clearing key map");
    for(var key in keyMap) 
        keyMap[key] = false;
}

function keyJustPressed(keyEvent, keyNum) {
    return keyEvent.keyCode == keyNum && keyTime[keyNum] == -1 && keyEvent.type == "keydown"
}

function keyJustReleased(keyEvent, keyNum) {
    return keyEvent.keyCode == keyNum && keyEvent.type == "keyup"
}

function keyPressed(key) {
    return keyMap[keyCode[key]];
}

function keyHolded(key, msConsideredHolding = 200) {
    var keycode = keyCode[key];

    if(msConsideredHolding <= 0)
        return keyMap[keyCode]

    // console.log(Math.floor(performance.now() - keyTime[keycode]), Math.floor(performance.now()), Math.floor(keyTime[keycode]))
    return keyMap[keycode] &&  performance.now() - keyTime[keycode] > msConsideredHolding;
}