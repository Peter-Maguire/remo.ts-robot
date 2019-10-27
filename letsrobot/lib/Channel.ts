import Server from "./Server";

export default class Channel{
    //Preliminary values given
    owner_id: string;
    name: string;
    server_id: string;

    preliminary: boolean;

    chat_id: string;
    controls_id: string;
    created: Date;
    display: any; //????
    robot_id: string;
    id: string;

    server: Server;

    constructor(obj, server = null){
        this.server = server;
        this.id = obj.id;
        this.owner_id = obj.owner_id;
        this.server_id = obj.server_id || obj.host_id;
        this.name = obj.name;
        this.preliminary = !! obj.controls;
        this.chat_id = obj.chat;
        this.controls_id = obj.controls;
        this.created = new Date(obj.created);
        this.display = obj.display;
        this.robot_id = obj.robot;
    }
}