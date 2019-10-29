import RemoEvent from "./RemoEvent";
import Message from "../Message";

export default class SendChat extends RemoEvent {
    prettyEventName = "chatHistoryReceived";
    id: string;
    server_id: string;
    messages: Message[];
    created: Date;

    constructor(raw){
        super(raw);
        this.id = raw.d.id;
        this.server_id = raw.d.host_id;
        this.messages = raw.d.messages.map((o)=>new Message(o));
        this.created = new Date(raw.d.created);
    }
}