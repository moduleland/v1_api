import {graphql} from "@octokit/graphql";

export namespace ApiConnections {

    export const GetGraphql = async <T>(
        token_type: string,
        access_token: string,
        graphqlString: string
    ): Promise<T> => {
        return await graphql.defaults({
            headers: {
                authorization: `${token_type} ${access_token}`
            }
        })(graphqlString) as T;
    }

}
