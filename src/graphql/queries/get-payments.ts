import { gql } from "@apollo/client";

export const GET_PAYMENTS_PAGE_DATA = gql`
  query GetPaymentsPageData {
    allPayments {
      id
      amount
      paymentDate
      method
      description
      student {
        id
        name
        phoneNumber
      }
    }
    allStudents {
      id
      name
      phoneNumber
    }
    allPlans {
      id
      name
      price
    }
  }
`;
