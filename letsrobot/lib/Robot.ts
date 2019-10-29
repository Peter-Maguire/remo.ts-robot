import Config from "./Config";
import HttpServer from "./http/HttpServer";
import Remo from "./remo/Remo";
import RobotValidated from "./remo/event/RobotValidated";
import Channel from "./remo/Channel";
import MessageReceived from "./remo/event/MessageReceived";

export default class Robot {
    config: Config;
    remo: Remo;
    server: HttpServer;

    constructor(){
       this.config = new Config();
       this.server = new HttpServer();
       this.remo = new Remo();

       this.remo.connectToWebsocket();

       let that = this;
       this.remo.on("websocketOpened", async function(){
           console.log("Connected!");
           await that.remo.loginRobot(await that.config.get("token"));
       });

        this.remo.on("ready", async function(evt: RobotValidated){
            console.log("Logged in!");
            let channelId = await that.config.get("channelId");
            if(channelId)
                return that.remo.joinChannel(channelId);
            let channels = await that.remo.getChannels(evt.server_id);
            let target = (await that.config.get("channelName")).toLowerCase();
            let targetChannel: Channel;
            channels.forEach((channel)=>{
                if(channel.name.toLowerCase() === target)
                    targetChannel = channel;
            });
            if(!targetChannel)
                return console.error("Could not find channel ID to bind to!");
            console.log(`Joining ${targetChannel.name}`);
            that.remo.joinChannel(targetChannel);
        });

        this.remo.on("message", function(evt: MessageReceived){
            const msg = evt.message;
            console.log(`[${msg.created.toLocaleString()}] <${msg.username}> ${msg.content}`)
        });

    }
}


new Robot();