"use client";
import { ApolloProvider } from '@apollo/client/react';
import client from '../lib/apollo';

export function Providers({ children }) {
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    );
}

