import RemoEvent from "./RemoEvent";

export default class RobotMessageSent extends RemoEvent {
    //Does nothing
    prettyEventName = "message";

    username: string;
    message: string;
    chat_id: string;
    server_id: string;

    constructor(raw){
        super(raw);
        this.username = raw.d.username;
        this.message = raw.d.message;
        this.chat_id = raw.d.chatId;
        this.server_id = raw.d.server_id;
    }
}