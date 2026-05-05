import { gql } from "@apollo/client";

export const CREATE_AVAILABILITY = gql`
  mutation CreateAvailability($teacherId: Int!, $day: String!, $startTime: Time!, $endTime: Time!) {
    createAvailability(teacherId: $teacherId, day: $day, startTime: $startTime, endTime: $endTime) {
      availability {
        id
        day
        startTime
        endTime
      }
    }
  }
`;

export const UPDATE_AVAILABILITY = gql`
  mutation UpdateAvailability($id: Int!, $day: String, $startTime: Time, $endTime: Time) {
    updateAvailability(id: $id, day: $day, startTime: $startTime, endTime: $endTime) {
      availability {
        id
        day
        startTime
        endTime
      }
    }
  }
`;

export const DELETE_AVAILABILITY = gql`
  mutation DeleteAvailability($id: Int!) {
    deleteAvailability(id: $id) {
      success
    }
  }
`;
