
export namespace RepoTypes {

    export type PublicModule = {
        id: string;
        login: string;
        name: string;
        description: string;
        is_private: boolean;
        license: string;
        created_at: Date;
        updated_at: Date;
        primary_language: string;
        branch_name: string;
        release?: {
            tag_name: string;
            is_prerelease: boolean
        }
    }

    export type Repo = {
        creator_id: string;
        //-----
        id: string;
        owner: {
            id: string;
            login: string;
            viewerCanAdminister?: boolean;
        }
        name: string;
        description: string;
        homepageURL: string;
        isPrivate: boolean;
        diskUsage: number;
        licenseInfo: {
            name: string;
            spdxId: string;
        };
        primaryLanguage: {
            name: string;
        };
        createdAt: Date;
        pushedAt: Date;
        updatedAt: Date;
        forkCount: number;
        issues: {
            totalCount: number;
        }
        pullRequests: {
            totalCount: number
        }
        stargazers: {
            totalCount: number
        }
        url: string;
        defaultBranchRef: {
            name: string;
            target: {
                oid: string;
            }
        }
        releases: {
            nodes: Array<{
                tagName: string;
                isPrerelease: boolean;
            }>
        }
    }

    export type ViewerRepos = {
        viewer: {
            repositories: {
                totalCount: number;
                nodes: Array<Repo>,
                pageInfo: {
                    hasNextPage: boolean;
                    endCursor: string
                }
            };
        }
    }

    export type SearchRepo = {
        repository: Repo
    }

    export type SearchRepoRelease = {
        repository: {
            defaultBranchRef: {
                name: string,
                target: {
                    oid: string;
                    abbreviatedOid: string;
                }
            }
            release?: {
                isPrerelease: boolean;
                createdAt: Date;
            }
        }
    }

}
