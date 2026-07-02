import { gql } from "@apollo/client";

export const CREATE_PLAN = gql`
  mutation CreatePlan($name: String!, $price: Float!, $duration: Int!, $classesCount: Int!, $isFeatured: Boolean, $benefits: [String]) {
    createPlan(name: $name, price: $price, duration: $duration, classesCount: $classesCount, isFeatured: $isFeatured, benefits: $benefits) {
      plan {
        id
        name
        price
        duration
        classesCount
        isFeatured
        benefits
      }
    }
  }
`;

export const DELETE_PLAN = gql`
  mutation DeletePlan($id: Int!) {
    deletePlan(id: $id) {
      success
    }
  }
`;

export const UPDATE_PLAN = gql`
  mutation UpdatePlan($id: Int!, $name: String, $price: Float, $duration: Int, $classesCount: Int, $isFeatured: Boolean, $benefits: [String]) {
    updatePlan(id: $id, name: $name, price: $price, duration: $duration, classesCount: $classesCount, isFeatured: $isFeatured, benefits: $benefits) {
      plan {
        id
        name
        price
        duration
        classesCount
        isFeatured
        benefits
      }
    }
  }
`;
