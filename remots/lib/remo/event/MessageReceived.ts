import RemoEvent from "./RemoEvent";
import Message from "../Message";

export default class MessageReceived extends RemoEvent  {
    prettyEventName = "message";
    message: Message;
    constructor(raw){
        super(raw);
        this.message = new Message(raw.d);
    }
}