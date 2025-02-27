import {ApolloClient, from, HttpLink, InMemoryCache, ServerError, split} from '@apollo/client';
import {GraphQLWsLink} from "@apollo/client/link/subscriptions";
import {createClient} from "graphql-ws";
import {getMainDefinition} from "@apollo/client/utilities";
import {onError} from "@apollo/client/link/error";
import {setContext} from "@apollo/client/link/context";

const endpoint = `//${document.location.hostname}:${import.meta.env.VITE_GRAPHQL_PORT}/graphql`;

const httpLink = new HttpLink({
    uri: endpoint,
});

const wsLink = new GraphQLWsLink(createClient({
    url: () => `wss:${endpoint}`,
    shouldRetry: () => true,
    connectionParams: () => ({
        Authorization: localStorage.getItem('jwt') ? `Bearer ${localStorage.getItem('jwt')}` : ''
    })
}));

const splitLink = split(
    ({ query }) => {
        const definition = getMainDefinition(query);

        return (
            definition.kind === 'OperationDefinition' &&
            definition.operation === 'subscription'
        );
    },
    wsLink,
    httpLink,
);

export function logout() {
    const lastLogout = Number(sessionStorage.getItem('lastLogout') || 0);

    // don't try to reload more than once every 5 seconds
    if (lastLogout + 5000 < Date.now()) {
        window.localStorage.removeItem('jwt')
        window.sessionStorage.clear();

        sessionStorage.setItem('lastLogout', String(Date.now()));

        apolloClient.clearStore()
            .then(() => {
                document.location = '/login';
            });
    }
}


const errorLink = onError(({graphQLErrors, networkError}) => {
    if (graphQLErrors)
        graphQLErrors.forEach(({ message, locations, path }) =>
            console.error(
                `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`,
            ),
        );

    if (networkError) {
        console.error(`[Network error]: ${networkError}`);

        const e = networkError as ServerError;

        if (e.statusCode === 401 || e.statusCode === 403)
            logout();
    }

    console.log({graphQLErrors, networkError});

    if (graphQLErrors?.find((error: any) => error.errcode === '42501' && !error.message.match(/st_distance/)))
        logout();
});

const authLink = setContext((_, { headers: originalHeaders }) => {
    const headers = Object.assign({}, originalHeaders);

    // get the authentication token from local storage if it exists
    const jwt = localStorage.getItem('jwt');
    // return the headers to the context so httpLink can read them

    if (jwt) {
        const [,b64encoded,] = jwt.split('.');

        const {exp}: any = JSON.parse(atob(b64encoded));
        const expiresAt = exp && (Number(exp) * 1000);

        if (expiresAt < Date.now()) {
            logout();
        }
        else {
            // console.log(`jwt expires at ${new Date(expiresAt)}`);
            Object.assign(headers, {Authorization: `Bearer ${jwt}`});
        }
    }

    return {headers};
});

const apolloClient = new ApolloClient({
    link: from([errorLink, authLink, splitLink]),
    cache: new InMemoryCache(),
});

export default apolloClient;