export default class ServerStatus {
    count: Number;
    public: boolean;
    liveDevices: string[];


    constructor(obj){
        this.count = obj.count;
        this.public = obj.public;
        this.liveDevices = obj.liveDevices;
    }
}