export default class Button {
    id: string;
    label: string;
    command: string;
    hotkey: string;

    constructor(raw){
        this.id = raw.id;
        this.label = raw.label;
        this.command = raw.command;
        this.hotkey = raw.hot_key;
    }
}