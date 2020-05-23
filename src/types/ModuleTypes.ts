import {RepoTypes} from "./RepoTypes";

export namespace ModuleTypes {

    import Repo = RepoTypes.Repo;

    export type Code = {
        hash: string,
        expire_at: number
    }

    export type Token = {
        id: string
        hash: string;
        created_at: number;
        ip: string; //ip
    }

    export type Module = Repo & {
        creator_id: string;
        code?: Code
        tokens?: Array<Token>
    }

}
