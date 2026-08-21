import { gql } from "@apollo/client";

export const CREATE_TEACHER = gql`
  mutation CreateTeacher(
    $name: String!, 
    $description: String, 
    $status: String, 
    $phoneNumber: String, 
    $rut: String,
    $address: String,
    $email: String,
    $specialtyIds: [Int],
    $provisionalPassword: String
  ) {
    createTeacher(
      name: $name, 
      description: $description, 
      status: $status, 
      phoneNumber: $phoneNumber, 
      rut: $rut, 
      address: $address, 
      email: $email, 
      specialtyIds: $specialtyIds,
      provisionalPassword: $provisionalPassword
    ) {
      provisionalPassword
      userCreated
      username
      teacher {
        id
        name
        status
        description
        phoneNumber
        rut
        address
        email
        specialties {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_TEACHER = gql`
  mutation UpdateTeacher(
    $id: Int!, 
    $name: String, 
    $description: String, 
    $status: String, 
    $phoneNumber: String, 
    $rut: String,
    $address: String,
    $email: String,
    $specialtyIds: [Int]
  ) {
    updateTeacher(
      id: $id, 
      name: $name, 
      description: $description, 
      status: $status, 
      phoneNumber: $phoneNumber, 
      rut: $rut,
      address: $address,
      email: $email,
      specialtyIds: $specialtyIds
    ) {
      teacher {
        id
        name
        status
        description
        phoneNumber
        rut
        address
        email
        specialties {
          id
          name
        }
      }
    }
  }
`;

export const DELETE_TEACHER = gql`
  mutation DeleteTeacher($id: Int!) {
    deleteTeacher(id: $id) {
      success
      error
    }
  }
`;
