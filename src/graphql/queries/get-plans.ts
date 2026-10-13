import { gql } from "@apollo/client";

export const GET_PLANS = gql`
  query GetAllPlans {
    allPlans {
      id
      name
      category
      price
      duration
      classesCount
      isFeatured
      benefits
    }
  }
`;
