import Control from "./Control";
import Button from "../remo/Button";
import * as net from "net";
import {Socket} from "net";
export default class TelnetControl extends Control {

    client: Socket;

    config: {host: string, port: number} = {
        "host": "",
        "port": 23
    };

    constructor(){
        super();
        this.client = net.createConnection(this.config, ()=>{
            console.log('connected to server!');
            this.emit("ready");
            this.ready = true;
        });
    }


    doCommand(button: Button) {
        this.client.write(button.command+"\r\n");
    }

    onConfigUpdated(config: object) {
    }

}