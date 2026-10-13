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
        email
        guardianName
        guardianPhone
      }
      room {
        id
        name
      }
      lead {
        id
        nombre
        telefono
        email
        edad
        apoderadoNombre
      }
      notes
    }
  }
`;
