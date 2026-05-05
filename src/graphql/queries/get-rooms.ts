import { gql } from "@apollo/client";

export const GET_ROOMS = gql`
  query GetAllRooms {
    allRooms {
      id
      name
      capacity
      instruments {
        id
        name
      }
    }
  }
`;

export const GET_ROOM_BY_ID = gql`
  query GetRoomById($id: Int!) {
    roomById(id: $id) {
      id
      name
      capacity
      instruments {
        id
        name
      }
    }
  }
`;
