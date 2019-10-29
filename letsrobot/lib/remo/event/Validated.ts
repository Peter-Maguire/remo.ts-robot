import RemoEvent from "./RemoEvent";
import UserStatus from "../UserStatus";

export default class Validated extends RemoEvent {

    prettyEventName = "validated";

    username: string;
    id: string;
    status: UserStatus;
    user: boolean = true;
    constructor(raw){
        super(raw);
        this.username = raw.d.username;
        this.id = raw.d.id;
        if(raw.d.status)
            this.status = new UserStatus(raw.d.status);
    }
}