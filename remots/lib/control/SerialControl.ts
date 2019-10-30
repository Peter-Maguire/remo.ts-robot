import Control from "./Control";
import Button from "../remo/Button";
import * as SerialPort from "serialport";
export default class SerialControl extends Control {

    config: {port: string, baud: number}  = {
        "baud": 115200,
        "port": "/dev/ttyACM0"
    };

    retries: number = 0;

    serialConnection: SerialPort;

    constructor(){
        super();
        this.connect();
    }

    connect(){
        this.emit("connecting");
        this.serialConnection = new SerialPort(this.config.port, {baudRate: this.config.baud});
        this.emit("ready");
        this.ready = true;
        this.serialConnection.on("error", (err)=>{
            this.emit("error", err);
            this.ready = false;
            setTimeout(this.connect, this.retries++*1000);
        });

        this.serialConnection.on("data", (buf)=>{
            this.emit("data", buf.toString());
        });
    }

    doCommand(button: Button) {
        if(!this.ready)return console.warn("Not ready!");
        this.serialConnection.write(button.command);
    }

    onConfigUpdated(config: object) {
        throw new Error("Method not implemented.");
    }

}