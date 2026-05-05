import { gql } from "@apollo/client";

export const GET_STUDENTS_LIST = gql`
  query GetStudentsList {
    allStudents {
      id
      name
      photo
      phoneNumber
      rut
      birthDate
      guardianName
      guardianPhone
      level
      startDate
      primaryInstrument {
        id
        name
      }
    }
    allStudentPacks {
      id
      totalClasses
      remainingClasses
      purchaseDate
      expirationDate
      isActive
      student {
        id
      }
      plan {
        id
        name
      }
    }
    allPayments {
      id
      amount
      paymentDate
      method
      description
      student {
        id
      }
    }
  }
`;
