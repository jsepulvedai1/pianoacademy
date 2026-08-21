import { gql } from "@apollo/client";

export const GET_ALL_MATERIALS = gql`
  query GetAllMaterials($scope: String, $teacherId: Int, $instrumentId: Int, $search: String) {
    allMaterials(scope: $scope, teacherId: $teacherId, instrumentId: $instrumentId, search: $search) {
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
`;
