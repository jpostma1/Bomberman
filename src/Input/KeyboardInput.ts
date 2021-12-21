let keyMap:any = {};
let keyTime:any = {};


export let keyCodes:any = {enter:13, shift:16, ctrl:17, alt:18, caps:20, esc:27, a:65, b:66, c:67, d:68, e:69, f:70, g:71, h:72, i:73, j:74, k:75, l:76, m:77, n:78, o:79, p:80, q:81, r:82, s:83, t:84, u:85, v:86, w:87, x:88, y:89, z:90, space:32, left:37, up:38, right:39, down:40,
    1:49, 2:50, 3:51, 4:52, 5:53, 6:54, 7:55, 8:56, 9:57, 0:58, 
};

for(let key in keyCodes)
    keyTime[keyCodes[key]] = -1

class KeyJustPressedListener {
    customKeyJustPressedFunctions:any[] = []

    // NOTE: add type of function with para1:KeyboardEvent, para2:string
    addKeyJustPressedFunction(func:(e:KeyboardEvent) => void) {
        this.customKeyJustPressedFunctions.push(func)
    }
}
//add functions to this list to set keyJustPressed calls from other files.
export let keyJustPressedListener:KeyJustPressedListener = new KeyJustPressedListener()


// begin | ----------------- handle keyboard input -----------------    
onkeydown = onkeyup = keyboardEventHandler
export function keyboardEventHandler (e:KeyboardEvent) {

    let keyIsDown = e.type == 'keydown';
    keyMap[e.keyCode] = keyIsDown;
    
    //TODO: also make a dictionary with custom functions just for certain keyCodes
    for(let func of keyJustPressedListener.customKeyJustPressedFunctions) {
        if (typeof func == 'function') {
            func(e);
        } 
        
    }
    
    if (keyIsDown && keyTime[e.keyCode] == -1)
        keyTime[e.keyCode] = performance.now();
    else if(!keyIsDown) {
        keyTime[e.keyCode] = -1;
    }

}


export function clearKeyMap() {
    // verboseLog("clearing key map");
    for(let key in keyMap) 
        keyMap[key] = false;
}

export function keyJustPressed(keyEvent:KeyboardEvent, keyNum:string | number) {
    return keyEvent.keyCode == keyCodes[keyNum] && keyTime[keyCodes[keyNum]] == -1 && keyEvent.type == "keydown"
}

export function keyJustReleased(keyEvent:KeyboardEvent, keyNum:string | number) {
    return keyEvent.keyCode == keyCodes[keyNum] && keyEvent.type == "keyup"
}

export function keyPressed(key:string | number) {
    return keyMap[keyCodes[key]];
}

export function keyHolded(key:string | number, msConsideredHolding = 200) {
    let keycode = keyCodes[key];

    if(msConsideredHolding <= 0)
        return keyMap[keycode]

    return keyMap[keycode] &&  performance.now() - keyTime[keycode] > msConsideredHolding;
}