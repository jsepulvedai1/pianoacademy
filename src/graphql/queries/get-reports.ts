import { gql } from "@apollo/client";

export const GET_REPORTS_DATA = gql`
  query GetReportsData {
    allLeads {
      id
      nombre
      servicio
      fuente
      estado
      fechaIngreso
    }
    allPayments {
      id
      amount
      paymentDate
      method
      description
    }
    allLessons {
      id
      date
      status
      isPreReservation
      lessonType
    }
    allStudents {
      id
      status
    }
  }
`;
