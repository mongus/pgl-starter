import {graphql} from "../../generated/graphql";

graphql(`
    mutation Authenticate($input: AuthenticateInput!) {
        authenticate(input: $input) {
            result
        }
    }
`);