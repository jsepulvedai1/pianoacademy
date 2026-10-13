import { gql } from "@apollo/client";

export const GET_STUDENTS_LIST = gql`
  query GetStudentsList {
    allStudents {
      id
      name
      email
      photo
      status
      returnDate
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
      assignedTeachers {
        id
        name
      }
      privateNotes {
        id
        text
        author
        createdAt
      }
      wallMessages {
        id
        text
        author
        createdAt
        attachedMaterial {
          id
          title
          url
        }
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
