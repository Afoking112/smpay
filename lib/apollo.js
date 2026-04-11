import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from '@apollo/client';

const authLink = new ApolloLink((operation, forward) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token) {
        operation.setContext({
            headers: {
                authorization: `Bearer ${token}`,
            },
        });
    }
    return forward(operation);
});

const client = new ApolloClient({
    link: authLink.concat(new HttpLink({ uri: '/api/graphql' })),
    cache: new InMemoryCache(),
    defaultOptions: {
        watchQuery: {
            errorPolicy: 'all',
        },
    },
});

export default client;

