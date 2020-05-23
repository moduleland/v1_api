import {NextFunction, Request, Response} from "express";
import {RepoTypes} from "../types/RepoTypes";
import Repo = RepoTypes.Repo;
import {UserTypes} from "../types/UserTypes";
import User = UserTypes.User;
import {RepoGraphql} from "../types/graphql/RepoGraphql";
import {ApiConnections} from "../utils/ApiConnections";
import GetGraphql = ApiConnections.GetGraphql;
import SearchRepo = RepoTypes.SearchRepo;
import {ModuleTypes} from "../types/ModuleTypes";
import Module = ModuleTypes.Module;

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
        const modules: Module[] = await mongo.find('modules', {
            isPrivate: false,
            'owner.login': login,
            name
        });
        const module = modules[0];
        if(!module) return error('Module not found! If this module is yours, add it in module.land!');

        const moduleUser: User = await mongo.get('users', 'id', module.creator_id);

        const repo = (await GetGraphql<SearchRepo>(
            moduleUser.token_type,
            moduleUser.access_token,
            RepoGraphql.GetRepo(login, name)
        )).repository;

        const isValidVersion = repo.releases.nodes.some(release => release.tagName === version);
        if(!isValidVersion && version !== '__DEFAULT__')
            return error(`Version ${version} was not found!`);

        const defaultBranch = repo.defaultBranchRef;

        const _targetVersion = isValidVersion ? version : defaultBranch.name;
        const _targetVersionOid = isValidVersion ? version : defaultBranch.target.oid;

        res.send({
            alias: `${login}/${name}@${_targetVersion}/`,
            url: `${process.env.URL}public/${login}/${name}@${_targetVersionOid}/`
        })
    } catch (e) {
        return error();
    }
}
