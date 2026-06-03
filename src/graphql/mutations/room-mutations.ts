import { gql } from "@apollo/client";

export const CREATE_ROOM = gql`
  mutation CreateRoom($name: String!, $capacity: Int, $status: String, $instrumentIds: [Int]) {
    createRoom(name: $name, capacity: $capacity, status: $status, instrumentIds: $instrumentIds) {
      room {
        id
        name
        capacity
        status
        instruments {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_ROOM = gql`
  mutation UpdateRoom($id: Int!, $name: String, $capacity: Int, $status: String, $instrumentIds: [Int]) {
    updateRoom(id: $id, name: $name, capacity: $capacity, status: $status, instrumentIds: $instrumentIds) {
      success
      room {
        id
        name
        capacity
        status
        instruments {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_ROOM = gql`
  mutation DeleteRoom($id: Int!) {
    deleteRoom(id: $id) {
      success
    }
  }
`;
