import Control from "./Control";
import Button from "../remo/Button";
import Robot from "../Robot";
import Video from "../video/Video";
import StaticImage from "../video/StaticImage";

export default class ConfigControl extends Control {

    config = {};
    robot:Robot;

    constructor(robot: Robot){
        super();
        this.ready = true;
        this.robot = robot;
    }

    doCommand(button: Button) {
        if(!this.ready)return console.warn("Not ready!");
        const split = button.command.split("=");
        if(this["_"+split[0]]){
            this["_"+split[0]](button.command.substring(split[0].length+1))
        }else{
            console.warn("_"+split[0]+" not implemented");
        }
    }

    onConfigUpdated(config: object) {
        throw new Error("Method not implemented.");
    }

    _testCommand(input){
        console.log(input);
    }

    _setVideoStream(input){
        let videoType;
        switch(input){
            case "camera":
                videoType = Video;
                break;
            case "static":
                videoType = StaticImage;
                break;
        }
        this.robot.av.stop();
        this.robot.av = new videoType();
        this.robot.av.start(this.robot.currentChannel);
    }

    _setStaticImage(input){
        this.robot.av.config["input"] = input;
        this.robot.av.startVideoStream(this.robot.currentChannel);
    }

    _setStaticAudio(input){
        this.robot.av.config["inputAudio"] = input;
        this.robot.av.startAudioStream(this.robot.currentChannel);
    }

    _say(input){
        this.robot.tts.speak(input);
    }


}