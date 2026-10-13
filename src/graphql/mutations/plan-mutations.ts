import { gql } from "@apollo/client";

export const CREATE_PLAN = gql`
  mutation CreatePlan($name: String!, $category: String, $price: Float!, $duration: Int!, $classesCount: Int!, $isFeatured: Boolean, $benefits: [String]) {
    createPlan(name: $name, category: $category, price: $price, duration: $duration, classesCount: $classesCount, isFeatured: $isFeatured, benefits: $benefits) {
      plan {
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
  mutation UpdatePlan($id: Int!, $name: String, $category: String, $price: Float, $duration: Int, $classesCount: Int, $isFeatured: Boolean, $benefits: [String]) {
    updatePlan(id: $id, name: $name, category: $category, price: $price, duration: $duration, classesCount: $classesCount, isFeatured: $isFeatured, benefits: $benefits) {
      plan {
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
  }
`;
