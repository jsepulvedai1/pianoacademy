import { gql } from "@apollo/client";

export const CREATE_MATERIAL = gql`
  mutation CreateMaterial(
    $title: String!
    $type: String!
    $url: String!
    $description: String
    $scope: String
    $teacherId: Int
    $instrumentId: Int
    $level: String
  ) {
    createMaterial(
      title: $title
      type: $type
      url: $url
      description: $description
      scope: $scope
      teacherId: $teacherId
      instrumentId: $instrumentId
      level: $level
    ) {
      success
      error
      material {
        id
        title
        description
        type
        url
        scope
        level
        createdAt
        teacher {
          id
          name
        }
        instrument {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_MATERIAL = gql`
  mutation UpdateMaterial(
    $id: Int!
    $title: String
    $type: String
    $url: String
    $description: String
    $scope: String
    $teacherId: Int
    $instrumentId: Int
    $level: String
  ) {
    updateMaterial(
      id: $id
      title: $title
      type: $type
      url: $url
      description: $description
      scope: $scope
      teacherId: $teacherId
      instrumentId: $instrumentId
      level: $level
    ) {
      success
      error
      material {
        id
        title
        description
        type
        url
        scope
        level
        teacher {
          id
          name
        }
        instrument {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_MATERIAL = gql`
  mutation DeleteMaterial($id: Int!) {
    deleteMaterial(id: $id) {
      success
      error
    }
  }
`;
