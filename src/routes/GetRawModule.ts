import {NextFunction, Request, Response} from "express";
import {RepoTypes} from "../types/RepoTypes";
import Repo = RepoTypes.Repo;
import {GithubUtils} from "../utils/GithubUtils";
import GetRawDataFromCreatorId = GithubUtils.GetRawDataFromCreatorId;


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
