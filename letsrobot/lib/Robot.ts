import Config from "./Config";
import HttpServer from "./http/HttpServer";

export default class Robot {
    config: Config;

    constructor(){
        new Config();
        new HttpServer();
    }
}