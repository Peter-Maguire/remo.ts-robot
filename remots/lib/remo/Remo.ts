import fetch from "node-fetch";
import Server from "./Server";
import * as WebSocket from "ws";
import {EventEmitter} from "events";
import RobotServerUpdated from "./event/RobotServerUpdated";
import RemoEvent from "./event/RemoEvent";
import RobotMessageSent from "./event/RobotMessageSent";
import GetControls from "./event/GetControls";
import Validated from "./event/Validated";
import RobotValidated from "./event/RobotValidated";
import Channel from "./Channel";
import SendChat from "./event/SendChat";
import MessageReceived from "./event/MessageReceived";
import ButtonCommand from "./event/ButtonCommand";
export default class Remo extends EventEmitter {
    static HOST: string = "remo.tv";
    static VERSION: string = "dev";
    socket: WebSocket;
    private retries = 0;


    channels: Map<string, Channel> = new Map<string, Channel>();
    servers: Map<string, Server> = new Map<string, Server>();
    isUser: boolean;

    static EVENT_REGISTRY = {
        "ROBOT_SERVER_UPDATED": RobotServerUpdated,
        "ROBOT_MESSAGE_SENT": RobotMessageSent,
        "VALIDATED": Validated,
        "ROBOT_VALIDATED": RobotValidated,
        "GET_CONTROLS": GetControls,
        "SEND_CHAT": SendChat,
        "MESSAGE_RECEIVED": MessageReceived,
        "BUTTON_COMMAND": ButtonCommand,
    };

    constructor(){
        super();
        this.on("ready", async (validate: Validated)=>{
            this.servers = await this.getServers(false);
            this.isUser = validate.user;
            if(!validate.user){
                let robotValidate = <RobotValidated>validate;
                console.log("Getting channels for "+robotValidate.server_id);
                await this.getChannels(robotValidate.server_id, false);
            }
        });

        this.on("channelInfo", (event)=>{
            this.channels[event.channel.id] = event.channel;
            console.log(this.channels);
        });

        this.on("serverUpdated", async()=>{
            if(!this.isUser)return;
            this.servers = await this.getServers(false);
            console.log(this.servers);
        });
        this.on("websocketRaw", function(evt){
            console.info("<-",evt);
        });

        this.on("websocketRawSend", function(evt){
            console.info("->",evt);
        });
    }

    async getServers(cache = true): Promise<Map<string, Server>>{
        if(this.servers.size > 0 && cache)return this.servers;
        const result = await fetch(`https://${Remo.HOST}/api/${Remo.VERSION}/robot-server/list/`);
        this.servers.clear();
        (<Array<any>>(await result.json())).forEach((c)=>this.servers.set(c.id, new Server(c)));
        return this.servers;
    }

    async getChannels(server_id: string, cache = true): Promise<Map<string, Channel>>{
        if(this.channels.size > 0 && cache)return this.channels;
        const result = await fetch(`https://${Remo.HOST}/api/${Remo.VERSION}/channels/list/${server_id}`);
        (<Array<any>>(await result.json()).channels).forEach((c)=> this.channels.set(c.id, new Channel(c)));
        return this.channels;
    }

    connectToWebsocket(): WebSocket{
        this.socket = new WebSocket(`wss://${Remo.HOST}`);
        this.socket.on('open', ()=>{
            console.log("Opened Websocket");
            this.emit('websocketOpened');
        });

        this.socket.on('message', (data)=>{
            try {
                let jsonData = JSON.parse(data.toString());
                if (jsonData.e && Remo.EVENT_REGISTRY[jsonData.e]) {
                    let event: RemoEvent = Reflect.construct(Remo.EVENT_REGISTRY[jsonData.e], [jsonData]);
                    this.emit(event.prettyEventName, event);
                } else {
                    console.warn("Malformed message ", jsonData);
                }
                this.emit('websocketRaw', jsonData);
            }catch(e){
                console.error(e);
            }
        });


        this.socket.on('close', ()=>{
            this.emit('websocketDisconnected', this.retries);
            setTimeout(this.connectToWebsocket, this.retries++*1000)
        });

        return this.socket;
    }


    private sendWebsocketEvent(event){
        this.emit("websocketRawSend", event);
        if(!this.socket || this.socket.readyState !== WebSocket.OPEN){
            throw new Error("Websocket is not yet connected. Run connectToWebsocket() first");
        }
        this.socket.send(JSON.stringify(event));
    }

    loginUser(token: String){
        let that = this;
        return new Promise(function(fulfill, reject){
            that.sendWebsocketEvent({e: "AUTHENTICATE", d: {token}});
            that.once("validate", function(event: Validated){
                if(event.id){
                    fulfill(true);
                    that.emit("ready", event);
                }else{
                    reject("Failed to login.")
                }
            })
        })
    }

    loginRobot(token: String): Promise<boolean>{
        let that = this;
        return new Promise(function(fulfill, reject){
            that.sendWebsocketEvent({e: "AUTHENTICATE_ROBOT", d: {token}});
            const timeout = setTimeout(function(){
                reject("Login timed out.");
            }, 30000);
            that.once("validated", function(event: Validated){
                clearTimeout(timeout);
                if(event.id){
                    fulfill(true);
                    that.emit("ready", event);
                }else{
                    reject("Failed to login.")
                }
            })
        })
    }

    joinChannel(channel: Channel, subscribe = true){
        this.sendWebsocketEvent({e: "JOIN_CHANNEL", d: channel.id});
        if(subscribe)
            this.sendWebsocketEvent({e: "GET_CHAT", d: channel.chat_id});
    }


}