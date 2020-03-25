import Config from "./Config";
import HttpServer from "./http/HttpServer";
import Remo from "./remo/Remo";
import RobotValidated from "./remo/event/RobotValidated";
import Channel from "./remo/Channel";
import MessageReceived from "./remo/event/MessageReceived";
import Control from "./control/Control";
import SerialControl from "./control/SerialControl";
import ButtonCommand from "./remo/event/ButtonCommand";
import Video from "./video/Video";
import Espeak from "./speech/Espeak";
import Speech from "./speech/Speech";
import StaticImage from "./video/StaticImage";
import ConfigControl from "./control/ConfigControl";
import Stream from "./video/Stream";


export default class Robot {
    config: Config;
    remo: Remo;
    server: HttpServer;
    av: Video;
    tts: Speech;
    controlMap: {[key: string]: Control};
    currentChannel: Channel;

    constructor(){
        this.init();
    }

    async init(){
        this.config = new Config();
        console.log("Loading Database...");
        await this.config.init();
        console.log("Loading HTTP Server...");
        this.server = new HttpServer(this);
        console.log("Loading Remo Integration...");
        this.remo = new Remo();
        console.log("Loading Controls...");
        this.controlMap = {
            "config": new ConfigControl(this),
            "*": new SerialControl(),
        };
        this.av = new Stream();
        //@ts-ignore
        console.log(`Loading AV '${this.av.constructor.getId()}'...`);
        await this.av.init();
        console.log("Loading TTS");
        this.tts = new Espeak();

        console.log("Connecting to Remo...");
        this.remo.connectToWebsocket();

        let that = this;
        this.remo.on("websocketOpened", async ()=>{
            console.log("Connected!");
            await this.remo.loginRobot(await that.config.get("token"));
        });

        this.remo.on("ready", async (evt: RobotValidated)=>{
            console.log("Logged in!");
            let channelId = await this.config.get("channelId");
            if(channelId)
                return this.remo.joinChannel(new Channel({id:channelId}));
            let channels = await this.remo.getChannels(evt.server_id);
            let target = (await this.config.get("channelName")).toLowerCase();
            let targetChannel: Channel = null;
            channels.forEach((channel)=>{
                if(channel.name.toLowerCase() === target)
                    targetChannel = channel;
            });
            if(!targetChannel)
                return console.error("Could not find channel ID to bind to!");
            this.currentChannel = targetChannel;
            console.log(`Joining ${targetChannel.name}`);
            this.remo.joinChannel(targetChannel);
            this.av.start(targetChannel);

        });

        this.remo.on("message", (evt: MessageReceived)=>{
            const msg = evt.message;
            console.log(`[${msg.created.toLocaleString()}] <${msg.username}> ${msg.content}`);
            this.tts.speak(msg.content);
        });

        this.remo.on("command", (event: ButtonCommand)=>{
            if(!this.controlMap)return;
            const split = event.button.command.split(":");
            let control: Control;
            if(split[1])
                event.button.command = split[1];
            if(!split[1] || !this.controlMap[split[0]]){
                control = this.controlMap["*"];
            }else{
                control = this.controlMap[split[0]]
            }
            if(!control.ready)return;
            control.doCommand(event.button);
        });
    }
}


new Robot();