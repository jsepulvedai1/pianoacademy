import { gql } from "@apollo/client/core/index.js";

export const GET_STUDENT_PORTAL_DATA = gql`
  query GetStudentPortalData($id: Int!) {
    studentById(id: $id) {
      id
      name
      age: birthDate
      avatar: photo
      pack: level
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
          type
          url
        }
      }
    }
    allMaterials {
      id
      title
      type
      url
      scope
      level
      createdAt
      teacher {
        id
        name
      }
    }
  }
`;
