import {NextFunction, Request, Response} from "express";
import {ModuleTypes} from "../types/ModuleTypes";
import Module = ModuleTypes.Module;
import {Utils} from "../utils/Utils";
import VerifyHash = Utils.VerifyHash;
import {GithubUtils} from "../utils/GithubUtils";
import GetRawDataFromCreatorId = GithubUtils.GetRawDataFromCreatorId;

export default async (req: Request, res: Response, next: NextFunction) => {
    if(res.locals.module.token === 'public') return next();

    const {
        login,
        name,
        version,
        token
    } = res.locals.module;
    const mongo = res.locals.mongo;

    const error = (
        message: string = 'Something went wrong!',
        status: number = 404
    ) => res
        .status(status)
        .send({
            error: true,
            error_message: message
        });

    try {
        console.log(token)
        const modules: Module[] = await mongo.find('modules', {
            isPrivate: true,
            'owner.login': login,
            name
        });
        const module = modules[0];
        if(!module) return error('Module not found! If this module is yours, add it in module.land!');

        if(!module.tokens || !module.tokens.some(_token => VerifyHash(token, _token.hash)))
            return error('The token is not valid.', 401);

        try {
            const apiResponse = await GetRawDataFromCreatorId(
                mongo,
                module.creator_id,
                login,
                name,
                version,
                req.params[0]
            );
            [
                'content-type',
                'content-length'
            ].forEach(k => {
                res.setHeader(k, apiResponse.headers[k])
            });
            res.setHeader('X-Powered-By', 'module.land');

            res.status(200).send(apiResponse.data);
        } catch (e) {
            return res
                .status(e.response.status)
                .send(e.response.statusText)
        }
    } catch (e) {
        console.error(e)
        return error();
    }
}
