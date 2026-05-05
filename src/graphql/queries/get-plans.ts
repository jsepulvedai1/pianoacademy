import { gql } from "@apollo/client";

export const GET_PLANS = gql`
  query GetAllPlans {
    allPlans {
      id
      name
      price
      duration
      classesCount
      isFeatured
    }
  }
`;
