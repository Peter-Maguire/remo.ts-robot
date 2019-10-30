import Button from "../remo/Button";
import {EventEmitter} from "events";

export default abstract class Control extends EventEmitter {

    config: any;
    ready: boolean = false;

    abstract doCommand(button: Button);

    abstract onConfigUpdated(config: object);
}