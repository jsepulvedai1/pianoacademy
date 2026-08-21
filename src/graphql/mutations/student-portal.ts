import { gql } from "@apollo/client/core/index.js";

export const CREATE_MATERIAL = gql`
  mutation CreateMaterial($title: String!, $type: String!, $url: String!, $scope: String, $teacherId: Int) {
    createMaterial(title: $title, type: $type, url: $url, scope: $scope, teacherId: $teacherId) {
      material {
        id
        title
        type
        url
        scope
        createdAt
      }
    }
  }
`;

export const CREATE_STUDENT_PRIVATE_NOTE = gql`
  mutation CreateStudentPrivateNote($studentId: Int!, $text: String!, $author: String!) {
    createStudentPrivateNote(studentId: $studentId, text: $text, author: $author) {
      note {
        id
        text
        author
        createdAt
      }
    }
  }
`;

export const CREATE_STUDENT_WALL_MESSAGE = gql`
  mutation CreateStudentWallMessage($studentId: Int!, $text: String!, $author: String!, $attachedMaterialId: Int) {
    createStudentWallMessage(studentId: $studentId, text: $text, author: $author, attachedMaterialId: $attachedMaterialId) {
      message {
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
  }
`;
