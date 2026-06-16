"use client";

import { HttpLink, split } from "@apollo/client";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
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

  // Split link: subscriptions go over WebSockets, queries/mutations over HTTP
  const link =
    typeof window !== "undefined"
      ? split(
          ({ query }) => {
            const definition = getMainDefinition(query);
            return (
              definition.kind === "OperationDefinition" &&
              definition.operation === "subscription"
            );
          },
          new GraphQLWsLink(
            createClient({
              url: typeof window !== "undefined"
                ? `${window.location.protocol === "https:" ? "wss:" : "ws:"}//${window.location.host}/ws/graphql/`
                : "ws://localhost:8000/ws/graphql/",
            })
          ),
          httpLink
        )
      : httpLink;

  return new ApolloClient({
    cache: new InMemoryCache(),
    link: link,
  });
}

export function ApolloWrapper({ children }: React.PropsWithChildren) {
  return (
    <ApolloNextAppProvider makeClient={makeClient}>
      {children}
    </ApolloNextAppProvider>
  );
}

