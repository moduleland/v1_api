
export namespace UserGraphql {

    export const GetUser = () =>`
    {
      viewer {
        id
        login
        name
        email
        avatarUrl
        location
        url
        websiteUrl
        pullRequests {
          totalCount
        }
        repositories {
          totalDiskUsage
          totalCount
        }
        organizations(first: 100) {
          totalCount
          nodes {
            id
            login
            viewerCanAdminister
          }
        }
      }
    }
    `;

}
