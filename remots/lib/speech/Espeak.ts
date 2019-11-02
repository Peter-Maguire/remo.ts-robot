import Speech from "./Speech";
import {exec} from "child_process";

export default class Espeak extends Speech {

    config = {
        "voice": "en-us+m1",
        "speaker": "0,0"
    };

    speak(message: String) {
        return exec(["espeak",
            `-v ${this.config.voice}`,
            `-s 170`,
            message,
            `--stdout |`,
            `aplay`,
            `-D plughw:${this.config.speaker}`
        ].join(" "));
    }
}