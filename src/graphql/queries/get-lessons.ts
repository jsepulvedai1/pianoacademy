import { gql } from "@apollo/client";

export const GET_LESSONS = gql`
  query GetAllLessons {
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
        photo
        phoneNumber
        specialties {
          id
          name
        }
      }
      student {
        id
        name
        photo
        level
        phoneNumber
        guardianPhone
        primaryInstrument {
          id
          name
        }
      }
      lead {
        id
        nombre
        servicio
        telefono
      }
      room {
        id
        name
        capacity
      }
    }
  }
`;
