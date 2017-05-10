import * as express from "express";
import * as logger from "morgan";
import * as bodyParser from "body-parser";
import Server1 from "./routes/01-router";
import Server2 from "./routes/02-router";
import Server3 from "./routes/03-router";
import Server4 from "./routes/04-router";
import Server5 from "./routes/05-router";
import Docs from './routes/docs';
import {RxHR} from "@akanass/rx-http-request";

class App {

    public express:express.Application;

    constructor() {
        this.express = express();
        this.middleware();
        this.routes();
    }

    private middleware():void {
        this.express.use(logger('dev'));
        this.express.use(bodyParser.json());
        this.express.use(bodyParser.urlencoded({extended: false}));
    }

    private routes():void {
        /* This is just to get up and running, and to make sure what we've got is
         * working so far. This function will change when we start to add more
         * API endpoints */
        let router = express.Router();

        router.get('/', (req, res, next) => {
            RxHR.get('http://localhost:3000/api/1').subscribe(()=>{});
            RxHR.get('http://localhost:3000/api/2').subscribe(()=>{});
            RxHR.get('http://localhost:3000/api/3').subscribe(()=>{});
            RxHR.get('http://localhost:3000/api/4').subscribe(()=>{});
            RxHR.get('http://localhost:3000/api/5').subscribe(()=>{});
            res.json({
                message: 'Start'
            });
        });
        this.express.use('/', router);
        this.express.use('/api/1', Server1);
        this.express.use('/api/2', Server2);
        this.express.use('/api/3', Server3);
        this.express.use('/api/4', Server4);
        this.express.use('/api/5', Server5);
        this.express.use('/api/docs', Docs);
    }

}

export default new App().express;
