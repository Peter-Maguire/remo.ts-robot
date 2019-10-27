import Config from "./Config";
import fetch from "node-fetch";
import Channel from "./Channel";
import Server from "./Server";
export default class Remo {
     static HOST: string = "remo.tv";
     static VERSION: string = "dev";

    constructor(){
    }

    async getServers(): Promise<Server[]>{
        const result = await fetch(`https://${Remo.HOST}/api/${Remo.VERSION}/robot-server/list/`);
        return result.json().map((server)=>new Server(server))
    }

}