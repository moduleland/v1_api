import axios from "axios";
import {CryptoUtils} from "./CryptoUtils";
import {UserTypes} from "../types/UserTypes";

export namespace GithubUtils {

    import DecryptText = CryptoUtils.DecryptText;
    import User = UserTypes.User;

    const rawGithubURL = 'https://raw.githubusercontent.com/';

    export async function GetRawDataFromCreatorId(
        mongo: any,
        creator_id: string,
        login: string,
        name: string,
        version: string,
        params: string
    ): Promise<any> {
        const moduleUser: User = await mongo.get('users', 'id', creator_id);

        const token_type = DecryptText(moduleUser.token_type);
        const access_token = DecryptText(moduleUser.access_token);

        return (await axios.get(
            `${rawGithubURL}${login}/${name}/${version}/${params}`,
            {
                headers: {
                    'Authorization': `${token_type} ${access_token}`,
                    'Accept': 'application/vnd.github.v3.raw'
                }
            }
        ));
    }

}
