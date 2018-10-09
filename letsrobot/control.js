var config = require('config');
var request = require('request');
var socketio = require('socket.io-client');
var child_process = require('child_process');
var SerialPort = require("serialport");
const fs = require('fs');

var isSpeaking = false;

var serialConnection;
var lastCommand;


var currentChild;

var deviceNum = config.get("SpeakerDevice");
var commandCount = 0;

var soundfx = {
	"hammer down": "hammerdown.wav",
	"nerf this": "nerfthis.wav",
	"doh": "doh.wav",
	"what is my purpose": "whatismypurpose.wav",
	"you pass butter": "youpassbutter.wav",
	"oh my god": "ohmygod.wav",
	"yeah welcome to the club pal": "welcometotheclub.wav",
	"mission failed": "missionfailed.wav",
	"destroy the child": "destorythechild.wav",
	"are you sure about that": "areyousureaboutthat.wav",
	"we are number one": "wearenumberone.wav",
	"now listen closely": "nowlistenclosely.wav",

	"well seymour i made it despite your directions": "wellseymourimadeit.wav",
	"ah superintendent chalmers welcome i hope youre prepared for an unforgettable luncheon": "unforgettableluncheon.wav",
	"oh egads my roast is ruined": "egads.wav", 
	"but what if i were to purchase fast food and disguise it as my own cooking oh ho ho ho ho delightfully devilish seymour": "delvilish.wav",
	"but what if i were to purchase fast food and disguise it as my own cooking delightfully devilish seymour": "delvilish.wav",
	"seymour": "seymour.wav",
	"superintendent i was just uh just stretching my calves on the windowsill isometric exercise care to join me": "isometric.wav",
	"why is there smoke coming out of your oven seymour": "smokeoven.wav",
	"that isnt smoke its steam steam from the steamed clams were having mmm steamed clams": "steamedclams.wav",
	"superintendent i hope youre ready for mouthwatering hamburgers": "hamburgers.wav",
	"i thought we were having steamed clams": "ithoughtwewerehavingsteamedclams.wav",
	"doh no i said steamed hams thats what i call hamburgers": "thatswhaticallhamburgers.wav",
	"oh no i said steamed hams thats what i call hamburgers": "thatswhaticallhamburgers.wav",
	"no i said steamed hams thats what i call hamburgers": "thatswhaticallhamburgers.wav",
	"you call hamburgers steamed hams": "youcallhamburgerssteamedhams.wav",
	"yes its a regional dialect": "yesitsaregionaldialect.wav",
	"what region": "whatregion.wav",
	"uhh upstate new york": "upstatenewyork.wav",
	"really well im from utica and ive never heard anyone use the phrase steamed hams": "wellimfromutica.wav",
	"oh not in utica no its an albany expression": "albanyexpression.wav",
	"you know these hamburgers are quite similar to the ones they have at krusty burger": "crustyburger.wav",
	"no patented skinner burgers old family recipe": "skinnerburgers.wav",
	"oh ho ho ho no patented skinner burgers old family recipe": "skinnerburgers.wav",
	"for steamed hams": "forsteamedhams.wav",
	"yes": "yes.wav",
	"yeah so you call them steamed hams despite the fact they are obviously grilled": "andyoucallthemsteamedhams.wav",
	"ye hey you know the one thing i should excuse me for one second": "excusemeforonesecond.wav",
	"excuse me for one second": "excusemeforonesecond.wav",
	"well that was wonderful a good time was had by all im pooped": "impooped.wav",
	"yes i should be good lord what is happening in there": "goodlordwhatishappeninginthere.wav",
	"aurora borealis": "auroraborialis.wav",
	"aurora borealis at this time of year at this time of day in this part of the country localized entirely within your kitchen": "atthistimeofday.wav",
	"may i see it": "mayiseeit.wav",
	"no": "no.wav",
	"seymour the house is on fire": "seymourthehouseisonfire.wav",
	"no mother its just the northern lights": "nomotheritsjustthenorthernlights.wav",
	"well seymour you are an odd fellow but i must say you steam a good ham": "steamagoodham.wav",

};

function processChatMessage(data){
	var username = data.name;
	var messageRaw = data.message;
	var messageExtracted = messageRaw.split("] ")[1].replace(/(.)\1{9,}/g, "");

	if(!messageRaw)return;
	console.log(`[${new Date()}] <${username}> ${messageExtracted}`);
	var soundEffect = soundfx[messageExtracted.toLowerCase().replace(/[^a-zA-Z ]/g,"")];
	if(messageExtracted.indexOf("killspeech") > -1 && currentChild){
		console.log("Killing speech");
		currentChild.kill();
	}else if(soundEffect){
		isSpeaing = true;
		currentChild = child_process.exec(`aplay ${config.get("SoundFXDir")}${soundEffect}  -D plughw:${deviceNum} `, function(){
			isSpeaking = false;
		});
	}else if(messageExtracted.indexOf("http") === -1 && !messageExtracted.startsWith(".") && !isSpeaking){
		speak(messageExtracted.replace(/([${}<>&|]"'|wget|echo)/g, ""));
	}
}

function processCommand(data){
	if(data.command === lastCommand)return;
	if(!serialConnection)return;
	lastCommand = data.command;



	var writeStart = new Date();

	console.log(`[${writeStart}] Write started ${data.command}`);

	var timeout = setTimeout(function(){
		console.log(`[${new Date()}] !! WRITE FOR ${data.command} TOOK LONGER THAN 1 SECOND`);
		process.exit(1);
	}, 1000);

	serialConnection.write(data.command === "stop" ? "S" : data.command, function(err){
		commandCount++;
		if(err){
			console.error("Write error:");
			console.error(err);
		}else{
			clearTimeout(timeout);
			var writeEnd = new Date();
			var writeTime = writeEnd-writeStart;
			if(writeTime > 1000){
				console.log("Write time exceeded one second. Restarting");
				process.exit(1);
			}
			console.log(`[${writeStart}] Write finished ${data.command} (${writeEnd-writeStart}ms ${commandCount} commands.)`);
		}
	});


}

function speak(message){
	isSpeaking = true;
	currentChild = child_process.exec(`espeak -v ${config.get("Voice")} -p ${config.get("VoicePitch")} -a ${config.get("VoiceVolume")} "${message}" --stdout | aplay -D plughw:${deviceNum}`, function(){
		isSpeaking = false;
	});
}

let warning = false;

function createSerialConnection(port){
	console.log("Creating Serial Connection on "+(port ? port : "/dev/ttyACM0"));
	serialConnection = new SerialPort(port || '/dev/ttyACM0', {baudRate: config.get("SerialBaud")});

	serialConnection.on("data", function(buf){
		const data = buf.toString();
		if(data.indexOf(":") > -1){
		    const split = data.split(":");
		    const sense1 = split[0];
		    const sense2 = split[1];
		    console.log(`L: ${sense2} R: ${sense1}`);
		    if(sense1 > 500 || sense2 > 500){
		        warning = true;
		        console.log("OVERLOAD!!");
		        serialConnection.write("S");
		        let output = "";
		        if(sense1 > 500)output+="Right Wheel Stuck!\n";
                if(sense2 > 500)output+="Left Wheel Stuck!\n";
		        fs.writeFile("/home/pi/osdwarning", output, function(){});
            }else if(warning){
		        warning = false;
		        fs.writeFile("/home/pi/osdwarning", " ", function(){});
            }

        }
	});

	serialConnection.on('error', function(err){
		console.error(err);
		if(!port)
			setTimeout(createSerialConnection, 1000, '/dev/ttyACM1');
		else
			setTimeout(createSerialConnection, 1000)
	});
}

function getControlServer(){
	return new Promise(function(fulfill){
		console.log("Getting control server...");
		request.get(`https://${config.get("Host")}/get_control_host_port/${config.get("RobotID")}`, function(err, resp, body){
			if(err){
				console.error("Error... retrying in 5 seconds");
				console.error(err);
				setTimeout(getControlServer, 5000);
			}else{
				try{
					var result = JSON.parse(body);
					fulfill(result);
				}catch(e){
					console.error("Malformed response from server. Retrying in 5 seconds.");
					console.error(body);
					setTimeout(getControlServer, 5000);
				}
			}
		
		});
	});
}


function getChatServer(){
	return new Promise(function(fulfill){
		console.log("Getting chat server...");
		request.get(`https://${config.get("Host")}/get_chat_host_port/${config.get("RobotID")}`, function(err, resp, body){
			if(err){
				console.error("Error... retrying in 5 seconds");
				console.error(err);
				setTimeout(getChatServer, 5000);
			}else{
				try{
					var result = JSON.parse(body);
					fulfill(result);
				}catch(e){
					console.error("Malformed response from server. Retrying in 5 seconds.");
					console.error(body);
					setTimeout(getChatServer, 5000);
				}
			}
		
		});
	});
}



async function handleChat(){
	var serverInfo = await getChatServer();
	var socket = socketio(`http://${serverInfo.host}:${serverInfo.port}`);

	socket.on("connect", function(){
		console.log("Connected to chat websocket");
		socket.emit("identify_robot_id", config.get("RobotID"));
	});

	socket.on("chat_message_with_name", processChatMessage);
}

async function handleControl(){
	var serverInfo = await getControlServer();
	var socket = socketio(`http://${serverInfo.host}:${serverInfo.port}`);

	socket.on("connect", function(){
		console.log("Connected to control websocket");
		socket.emit("identify_robot_id", config.get("RobotID"));
		speak("Connected")
	});

	socket.on("command_to_robot", processCommand);

}


function start(){
	createSerialConnection();
	handleChat();
	handleControl();	
}


start();
