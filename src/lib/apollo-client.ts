import { HttpLink } from "@apollo/client";
import {
  registerApolloClient,
  ApolloClient,
  InMemoryCache,
} from "@apollo/experimental-nextjs-app-support";

/**
 * 🎻 Détaché - Apollo Client (Server Side)
 * This client is used in React Server Components to fetch data from the Django GraphQL API.
 */

export const { getClient, query, PreloadQuery } = registerApolloClient(() => {
  return new ApolloClient({
    cache: new InMemoryCache(),
    link: new HttpLink({
      // ⚠️ IMPORTANT: Replace with your actual Django GraphQL endpoint
      uri: process.env.NEXT_PUBLIC_GRAPHQL_ENDPOINT || "http://localhost:8000/graphql",
    }),
  });
});
