import { gql } from "@apollo/client";

export const GET_STUDENT_PACKS = gql`
  query GetStudentPacks {
    allStudentPacks {
      id
      totalClasses
      remainingClasses
      purchaseDate
      expirationDate
      isActive
      student {
        id
        name
      }
      plan {
        id
        name
        price
      }
    }
  }
`;
