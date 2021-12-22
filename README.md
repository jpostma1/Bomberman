# Bomberman
Bomberman Clone

================ how to run =======================
npm install
npm run start 
-------------
This should host the game on localhost:3000 
And start a hot reload server.
(alter the "start" script in package.json to change the default port)


================ how to configure the game ========
either directly alter the settings in Misc/Settings.ts
or create your own config file in JSON using the template below.

NOTE: 
- all settings should be set!!
- all time related settings are in seconds (fractions are allowed)
- comments are allowed

============== template ==============

{
    "gameSettings": {
        // all duration is in seconds
        "gameDuration": 180,
        "explosionDuration": 3
    },

    "startSkills": {
        "lives"               : 1,
        "speed"               : 0.035,
        "inviAfterHitDuration": 2,

        "maxBombs"            : 5,
        "bombPower"           : 3,
        

        // in seconds (these are both not altered by items currently)
        "reloadTime"          : 5, 
        "detonationTime"      : 3
    },

    "itemSettings": {
         // the chances are relative to each other
        "extraBombChance"       : 30,
        "extraSpeedChance"      : 20,
        "extraFirePowerChance"  : 20,
        "extraLifeChance"       : 10,
        "lessBombChance"        : 5,
        "lessSpeedChance"       : 5,
        "lessFirePowerChance"   : 5,
        "lessLifeChance"        : 5,
        
        // item effect variables
        "speedBoost"      : 0.0125,
        "minBombPower"    : 2,
        
        // should be within 0 and 1
        "itemDropChance"  : 0.15
    },

    
    "levelString": [
        "wwwwwwwwwwwwwwwwwwwwwwww",
        "wcwcwcwcwcwcwcwcwcwcwccw",
        "wc....p1...c.c.c.c.c.ccw",
        "wc.cwcwcwc.cwcwcwcwcwccw",
        "w..cwcwcwc.cwcwcwcwcwccw",
        "wc.c.c.c.c.c.c.c.c.c.ccw",
        "wc.c.c.cwc.cwcwcwcwcwccw",
        "wc.........c.c.c.c.c.ccw",
        "wc.cwcwcwc.cwcwcwcwcwccw",
        "wc.c.c.....c.c.c.c.c.ccw",
        "wcwcwc.cwcwc.cwcwcwcwccw",
        "wc.c.c.....c.c.c.c.c.ccw",
        "wcwcwc.cwc.c.cwcwcwcwccw",
        "w......c.c.c.c.c.c.c.ccw",
        "wc.cwc.cwc.c.cwcwcwcwccw",
        "w......c.c.c.c.c.c.c.ccw",
        "wc.cwc.cwc.c.cwcwcwcwccw",
        "w.....p2...............w",
        "wwwwwwwwwwwwwwwwwwwwwwww"
    ]

}
