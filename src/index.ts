
import * as Express from 'express';
import * as Mongo from 'mongo-redux'
import {config} from "dotenv";
import {urlencoded, json} from "body-parser";
import * as cookieParser from 'cookie-parser';
import {Utils} from "./utils/Utils";
import {ignoreCORS} from "./middlewares/IgnoreCors";
import {NextFunction, Request, Response} from "express";
import {moduleRegex, pathRegex} from "./utils/RegexUtils";
import GetRequestModule from "./routes/GetRequestModule";
import GetRequestCodeModule from "./routes/GetRequestCodeModule";
import GetRawTokenedModule from "./routes/GetRawTokenedModule";
import GetRawModule from "./routes/GetRawModule";
import axios from "axios";

config();

(async () => {
    const app: Express.Application = Express();
    const mongo: Mongo = new Mongo();

    app.use(json());
    app.use(urlencoded({ extended: false }));
    app.use(cookieParser())
    app.use(ignoreCORS);
    app.use((req: Request, res: Response, next: NextFunction) => {
        res.locals.mongo = mongo;
        next();
    });

    const getModule = (req: Request, res: Response, next: NextFunction) => {
        const [ , name_1, version, name_2 ] = moduleRegex.exec(req.params.name);
        res.locals.module = {
            login: req.params.login,
            name: name_2 || name_1,
            version: version || '__DEFAULT__',
            token: req.params.token,
            code: req.params.code
        }
        next();
    }

    app.get('/~:login/:name', getModule, GetRequestModule);
    app.get('/~:login/:name/:code', getModule, GetRequestCodeModule);

    app.get('/:token/:login/:name/*', getModule, (req: Request, res: Response, next: NextFunction) => {
        res.locals.module.data = 'url';
        const path = req.params[0];
        if(!pathRegex.test(path))
            return res.sendStatus(400);
        res.locals.module = {
            ...res.locals.module,
            path: path.split('/')
        }
        next()
    }, GetRawTokenedModule, GetRawModule);

    const onStart = () => {
        console.log(`running on port ${process.env.PORT}`)
    }

    try {
        await mongo.connect({
            url: process.env.MONGO_STRING,
            name: process.env.MONGO_DATABASE
        });
        console.log('db ready!')
        app.listen(parseInt(process.env.PORT || '80'), '0.0.0.0', onStart)
    } catch (e) {
        console.error(e)
    }


})()


