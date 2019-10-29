import RemoEvent from "./RemoEvent";
import Validated from "./Validated";

export default class RobotValidated extends Validated {
    server_id: string;

    constructor(raw){
        super(raw);
        this.user = false;
        this.server_id = raw.d.host;
    }
}