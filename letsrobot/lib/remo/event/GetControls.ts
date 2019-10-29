import RemoEvent from "./RemoEvent";
import ServerSettings from "../ServerSettings";
import Channel from "../Channel";

export default class GetControls extends RemoEvent {

    prettyEventName = "channelInfo";

    channel: Channel;

    constructor(raw){
        super(raw);
        this.channel = raw.d;
    }

}