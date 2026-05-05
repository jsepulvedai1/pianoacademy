"use client";

import { HttpLink } from "@apollo/client";
import {
  ApolloNextAppProvider,
  ApolloClient,
  InMemoryCache,
} from "@apollo/client-integration-nextjs";

/**
 * 🎻 Détaché - Apollo Wrapper (Client Side)
 * This wrapper provides the Apollo context to Client Components.
 */

function makeClient() {
  const httpLink = new HttpLink({
    // 🎻 Use relative path for client side to leverage Next.js proxy (bypasses CORS)
    uri: "/graphql/",
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
