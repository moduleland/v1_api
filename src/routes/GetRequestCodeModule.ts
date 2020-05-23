import {NextFunction, Request, Response} from "express";
import {RepoGraphql} from "../types/graphql/RepoGraphql";
import {RepoTypes} from "../types/RepoTypes";
import Repo = RepoTypes.Repo;
import {UserTypes} from "../types/UserTypes";
import User = UserTypes.User;
import {ApiConnections} from "../utils/ApiConnections";
import GetGraphql = ApiConnections.GetGraphql;
import {ModuleTypes} from "../types/ModuleTypes";
import Module = ModuleTypes.Module;
import {Utils} from "../utils/Utils";
import VerifyHash = Utils.VerifyHash;
import SearchRepo = RepoTypes.SearchRepo;
import GetRandomString = Utils.GetRandomString;
import CreateHash = Utils.CreateHash;
import Token = ModuleTypes.Token;

export default async (req: Request, res: Response, next: NextFunction) => {
    const {
        login,
        name,
        version,
        code
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
        const modules: Module[] = await mongo.find('modules', {
            isPrivate: true,
            'owner.login': login,
            name
        });
        const module = modules[0];
        if(!module)
            return error('Module not found! If this module is yours, add it in module.land!');
        if(!module.code
            || !VerifyHash(code, module.code.hash)
            || Date.now() > module.code.expire_at
        ) return error('The code is expired or not valid.', 401);

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

        const token = GetRandomString(16);
        const hash = CreateHash(token);

        const tokens: Array<Token> = [
            ...(module?.tokens || []),
            {
                created_at: Date.now(),
                hash,
                id: GetRandomString(16),
                ip: req.headers['x-forwarded-for']?.toString() || req.connection.remoteAddress
            }
        ]

        await mongo.update('modules', 'id', module.id, { $set: { tokens } } );

        res.send({
            alias: `${login}/${name}@${_targetVersion}/`,
            url: `${process.env.URL}${token}/${login}/${name}@${_targetVersionOid}/`
        })
    } catch (e) {
        console.log(e)
        return error();
    }
}


/*
{
  alias: string;
  url: string;
  last_version: string;
  error?: boolean;
  error_message?: string
}
*/
