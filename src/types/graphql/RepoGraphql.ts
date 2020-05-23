
export namespace RepoGraphql {

    const repoQuery = `
    {
        id
        owner {
          id
          login
          ... on Organization {
            id
            viewerCanAdminister
          }
        }
        name
        description
        homepageUrl
        isPrivate
        diskUsage
        licenseInfo {
          name
          spdxId
        }
        primaryLanguage {
          name
        }
        createdAt
        pushedAt
        updatedAt
        forkCount
        issues {
          totalCount
        }
        pullRequests {
          totalCount
        }
        stargazers {
          totalCount
        }
        url
        defaultBranchRef {
          name
          target {
            oid
            abbreviatedOid
          }
        }
        releases(first: 1, orderBy: {direction: DESC, field: NAME}) {
          nodes {
            tagName
            isPrerelease
          }
        }
    }
    `;

    export const GetRepoRelease =
    (
        login: string,
        module: string,
        release: string
    ) => `
    {
      repository(name: "${module}", owner: "${login}") {
        defaultBranchRef {
          name
          target {
            oid
            abbreviatedOid
          }
        }
        release(tagName: "${release}") {
          isPrerelease
          createdAt
        }
      }
    }
    `;

    export const GetRepo =
    (
        login: string,
        module: string
    ) => `
    {
      repository(name: "${module}", owner: "${login}") ${repoQuery}
    }
    `;

    export const GetRepos =
    (
        cursor?: string
    ) =>`
    {
      viewer {
        repositories(affiliations: [OWNER, ORGANIZATION_MEMBER], ownerAffiliations: [OWNER, ORGANIZATION_MEMBER], ${cursor ? `after: "${cursor}" `: ''}first: 100, orderBy: {field: CREATED_AT, direction: DESC}) {
          totalCount
          nodes ${repoQuery}
          pageInfo {
            hasNextPage
            endCursor
          }
        }
      }
    }
    `;

}
