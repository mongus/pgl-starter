import {AuthProvider} from "react-admin";

import {apolloClient} from "../../config";
import {
    AuthenticateDocument,
    AuthenticateMutation,
    AuthenticateMutationVariables
} from "../../generated/graphql/graphql.ts";

export const pglAuthProvider: AuthProvider = {
    async checkAuth() {
        if (!localStorage.getItem('jwt'))
            throw new Error('Not authenticated');
    },
    async checkError(error: { status?: number }): Promise<void> {
        const status = error.status;

        if (status === 401 || status === 403) {
            localStorage.removeItem('jwt');
            throw new Error('Session expired');
        }
    },
    async login({username, password}: {username: string; password: string;}): Promise<void> {
        return apolloClient.mutate<AuthenticateMutation, AuthenticateMutationVariables>({
            mutation: AuthenticateDocument,
            variables: {
                input: {
                    username,
                    password
                }
            }
        }).then((response) => {
            localStorage.setItem('jwt', response.data?.authenticate?.result ?? '');
        });
    },
    async logout(): Promise<void | false | string> {
        localStorage.removeItem('jwt');
    }
}
