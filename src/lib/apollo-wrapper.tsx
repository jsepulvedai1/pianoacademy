"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";

/**
 * 🎻 Détaché - Apollo Wrapper (Client Side)
 * This wrapper provides the Apollo context to Client Components.
 */

function makeClient() {
  const httpLink = new HttpLink({
    // ⚠️ IMPORTANT: Replace with your actual Django GraphQL endpoint
    uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8000/graphql",
    fetchOptions: { cache: "no-store" },
  });

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: httpLink,
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}
