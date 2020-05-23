import {NextFunction, Request, Response} from "express";
import {RepoTypes} from "../types/RepoTypes";
import Repo = RepoTypes.Repo;
import {UserTypes} from "../types/UserTypes";
import User = UserTypes.User;
import axios from "axios";

const rawGithubURL = 'https://raw.githubusercontent.com/';

export default async (req: Request, res: Response, next: NextFunction) => {
    const {
        login,
        name,
        version
    } = res.locals.module;
    const mongo = res.locals.mongo;

    const error = (message: string = 'Something went wrong!') => res.send({
        error: true,
        error_message: message
    });

    try {
        const modules: Repo[] = await mongo.find('modules', { isPrivate: false, 'owner.login': login, name });
        const module = modules[0];
        if(!module) return error('Module not found! If this module is yours, add it in module.land!');

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
