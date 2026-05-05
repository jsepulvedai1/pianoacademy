import { gql } from "@apollo/client";

export const GET_RESERVATIONS = gql`
  query GetReservations {
    allLessons {
      id
      date
      startTime
      endTime
      status
      lessonType
      isPreReservation
      teacher {
        id
        name
      }
      student {
        id
        name
        phoneNumber
      }
      room {
        id
        name
      }
    }
  }
`;
