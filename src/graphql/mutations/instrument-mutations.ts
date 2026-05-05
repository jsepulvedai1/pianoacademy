import { gql } from "@apollo/client";

export const CREATE_INSTRUMENT = gql`
  mutation CreateInstrument($name: String!) {
    createInstrument(name: $name) {
      instrument {
        id
        name
      }
    }
  }
`;

export const UPDATE_INSTRUMENT = gql`
  mutation UpdateInstrument($id: Int!, $name: String!) {
    updateInstrument(id: $id, name: $name) {
      instrument {
        id
        name
      }
    }
  }
`;

export const DELETE_INSTRUMENT = gql`
  mutation DeleteInstrument($id: Int!) {
    deleteInstrument(id: $id) {
      success
    }
  }
`;
