import {NextFunction, Request, Response} from "express";
import {ModuleTypes} from "../types/ModuleTypes";
import Module = ModuleTypes.Module;
import axios from "axios";
import {UserTypes} from "../types/UserTypes";
import User = UserTypes.User;
import {Utils} from "../utils/Utils";
import VerifyHash = Utils.VerifyHash;

const rawGithubURL = 'https://raw.githubusercontent.com/';

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

        const moduleUser: User = await mongo.get('users', 'id', module.creator_id);

        let apiResponse;
        try {
            apiResponse = (await axios.get(
                `${rawGithubURL}${login}/${name}/${version}/${req.params[0]}`,
                {
                    headers: {
                        'Authorization': `${moduleUser.token_type} ${moduleUser.access_token}`,
                        'Accept': 'application/vnd.github.v3.raw'
                    }
                }
            ));
        } catch (e) {
            return res
                .status(e.response.status)
                .send(e.response.statusText)
        }
        [
            'content-type',
            'content-length'
        ].forEach(k => {
            res.setHeader(k, apiResponse.headers[k])
        });
        res.setHeader('X-Powered-By', 'module.land');

        res.status(200).send(apiResponse.data);
    } catch (e) {
        console.error(e)
        return error();
    }
}
