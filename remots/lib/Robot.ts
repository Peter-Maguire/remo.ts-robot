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

export default class Robot {
    config: Config;
    remo: Remo;
    server: HttpServer;
    controls: Control;
    av: Video;
    tts: Speech;

    constructor(){
       this.config = new Config();
       this.server = new HttpServer(this);
       this.remo = new Remo();
       this.controls = new SerialControl();
       this.av = new StaticImage();
       this.tts = new Espeak();

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
                return this.remo.joinChannel(channelId);
            let channels = await this.remo.getChannels(evt.server_id);
            let target = (await this.config.get("channelName")).toLowerCase();
            let targetChannel: Channel;
            channels.forEach((channel)=>{
                if(channel.name.toLowerCase() === target)
                    targetChannel = channel;
            });
            if(!targetChannel)
                return console.error("Could not find channel ID to bind to!");
            console.log(`Joining ${targetChannel.name}`);
            this.remo.joinChannel(targetChannel);
            this.av.startAv(targetChannel);

        });

        this.remo.on("message", (evt: MessageReceived)=>{
            const msg = evt.message;
            console.log(`[${msg.created.toLocaleString()}] <${msg.username}> ${msg.content}`);
            this.tts.speak(msg.content);
        });

        this.remo.on("command", (event: ButtonCommand)=>{
            if(!this.controls || !this.controls.ready)return;
            this.controls.doCommand(event.button);
        });

    }
}


new Robot();