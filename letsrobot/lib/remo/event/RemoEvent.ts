export default abstract class RemoEvent{
    rawEvent: string;
    eventName: string;
    prettyEventName: string;
    protected constructor(rawEvent){
        this.rawEvent = rawEvent;
        this.eventName = rawEvent.e;
    }
}