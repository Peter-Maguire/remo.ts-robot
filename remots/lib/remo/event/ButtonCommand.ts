import RemoEvent from "./RemoEvent";
import User from "../User";
import Button from "../Button";

export default class ButtonCommand extends RemoEvent {
    prettyEventName = "command";
    user: User;
    button: Button;
    controls_id: string;
    channel_id: string;
    server_id: string;

    constructor(raw){
        super(raw);
        this.user = new User(raw.d.user);
        this.button = new Button(raw.d.button);
        this.controls_id = raw.d.controls_id;
        this.channel_id = raw.d.channel;
        this.server_id = raw.d.server;
    }

}