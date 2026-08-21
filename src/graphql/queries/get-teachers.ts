import { gql } from "@apollo/client";

/**
 * 🎻 Détaché - Get All Teachers Query
 * Fetches the professional team from the Django backend.
 */

export const GET_TEACHERS = gql`
  query GetTeachers {
    allTeachers {
      id
      name
      status
      description
      photo
      phoneNumber
      rut
      address
      email
      specialties {
        id
        name
      }
      availabilities {
        id
        day
        startTime
        endTime
      }
    }
  }
`;
