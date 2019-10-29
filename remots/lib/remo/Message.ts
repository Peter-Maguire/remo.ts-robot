export default class Message {
    id: string;
    sender_id: string;
    chat_id: string;
    server_id: string;
    channel_id: string;
    content: string;
    username: string;
    created: Date;
    broadcast: string; //????
    displayed: boolean;
    badges: string[];
    type: string; //????

    constructor(raw){
        this.content = raw.message;
        this.username = raw.sender;
        this.sender_id = raw.sender_id;
        this.chat_id = raw.chat_id;
        this.server_id = raw.server_id;
        this.id = raw.id;
        this.created = new Date(raw.time_stamp);
        this.broadcast = raw.broadcast;
        this.channel_id = raw.channel_id;
        this.displayed = raw.display_message;
        this.badges = raw.badges;
        this.type = raw.type;
    }

}