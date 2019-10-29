import * as express from "express";
import * as bodyParser from "body-parser";
import Config from "../Config";

export default class HttpServer {
    public app: express.Application;
    constructor() {
        this.app = express();

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: false }));

        this.app.use(express.static('static'));

        // noinspection JSIgnoredPromiseFromCall
        this.startServer();
    }


    async startServer(){
        const port = await Config.instance().get("port");
        this.app.listen(port, function(){
            console.log("Listening on port "+port)
        });
    }
}