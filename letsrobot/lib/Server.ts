import Channel from "./Channel";
import ServerStatus from "./ServerStatus";
import ServerSettings from "./ServerSettings";
import fetch from "node-fetch";
import Remo from "./Remo";
export default class Server {
    owner_id: string;
    id: string;
    name: string;
    users: Array<object>;
    settings: ServerSettings;
    status: ServerStatus;
    channels: {string: Channel};

    private hasFetchedChannels: boolean = false;

    constructor(obj){
        this.owner_id = obj.owner_id;
        this.id = obj.server_id;
        this.name = obj.server_name;
        this.users = obj.users;
        this.settings = new ServerSettings(obj.settings);
        this.status = new ServerStatus(obj.status);
        this.channels = obj.channels.reduce((o, c)=>o[c.id]= new Channel(c, this), {});
    }

    async getChannels(cache = true): Promise<{ string: Channel }>{
        if(!cache && this.hasFetchedChannels)
            return this.channels;
        const result = await fetch(`https://${Remo.HOST}/api/${Remo.VERSION}/channels/list/${this.id}`);
        this.hasFetchedChannels = true;
        return this.channels = result.json().reduce((o,c)=>o[c.id] = new Channel(c), {});
    }
}