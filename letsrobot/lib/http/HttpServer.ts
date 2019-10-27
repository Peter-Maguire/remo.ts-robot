import * as express from "express";
import * as bodyParser from "body-parser";

export default class HttpServer {
    public app: express.Application;
    constructor() {
        this.app = express();

        this.app.use(bodyParser.json());
        this.app.use(bodyParser.json());
        //support application/x-www-form-urlencoded post data
        this.app.use(bodyParser.urlencoded({ extended: false }));

        this.app.use(express.static('static'));

        this.app.listen(3000);

    }
}