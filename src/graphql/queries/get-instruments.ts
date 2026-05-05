import { gql } from "@apollo/client";

export const GET_INSTRUMENTS = gql`
  query GetAllInstruments {
    allInstruments {
      id
      name
    }
  }
`;
