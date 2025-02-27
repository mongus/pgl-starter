import {Admin, ListGuesser, Resource} from "react-admin";
import {ApolloProvider} from "@apollo/client";
import pgDataProvider from 'ra-postgraphile';
import {apolloClient} from "./config";
import {pglAuthProvider} from "./providers";
import {useMemo} from "react";

const App = () => {
    const dataProvider = useMemo(() => {
        return pgDataProvider(apolloClient);
    }, [])

    return (
        <ApolloProvider client={apolloClient}>
            <Admin authProvider={pglAuthProvider} dataProvider={dataProvider}>
                <Resource name="Users" list={ListGuesser}/>
            </Admin>
        </ApolloProvider>
    );
};

export default App;