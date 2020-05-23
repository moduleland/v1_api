import {NextFunction, Request, Response} from "express";
import {Utils} from "../utils/Utils";
import GetDateFormat = Utils.GetDateFormat;

export const ignoreCORS = (req: Request, res: Response, next: NextFunction) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, OPTIONS, DELETE')
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    console.log(GetDateFormat(), '>', req.method, req.path);
    next();
}
