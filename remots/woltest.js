/**
 *   ╔════   Copyright 2018 Peter Maguire
 *  ║ ════╗  Created 16/12/2018
 * ╚════ ║   (letsrobot-node) woltest
 *  ════╝
 */

// const GoogleHome = require('node-googlehome');
//
// let device = new GoogleHome.Connecter('192.168.1.121');
// console.log("Connected?");
//
// device.speak("hello world")

var wol = require('node-wol');

setInterval(function(){
    wol.wake("7C:1C:4E:28:B5:3B",console.log);
}, 2000)

//wol.wake("7C:1C:4E:28:B5:3B",console.log);