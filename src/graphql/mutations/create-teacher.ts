import { gql } from "@apollo/client";

export const CREATE_TEACHER = gql`
  mutation CreateTeacher($name: String!, $description: String, $status: String, $phoneNumber: String, $specialtyIds: [Int]) {
    createTeacher(name: $name, description: $description, status: $status, phoneNumber: $phoneNumber, specialtyIds: $specialtyIds) {
      teacher {
        id
        name
        status
        description
        phoneNumber
        specialties {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_TEACHER = gql`
  mutation UpdateTeacher($id: Int!, $name: String, $description: String, $status: String, $phoneNumber: String, $specialtyIds: [Int]) {
    updateTeacher(id: $id, name: $name, description: $description, status: $status, phoneNumber: $phoneNumber, specialtyIds: $specialtyIds) {
      teacher {
        id
        name
        status
        description
        phoneNumber
        specialties {
          id
          name
        }
      }
    }
  }
`;
