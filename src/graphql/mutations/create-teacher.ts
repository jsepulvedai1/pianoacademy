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
    $birthDate: Date,
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
      birthDate: $birthDate,
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
        birthDate
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
    $birthDate: Date,
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
      birthDate: $birthDate,
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
        birthDate
        specialties {
          id
          name
        }
      }
    }
  }
`;

export const UPDATE_MY_TEACHER_PROFILE = gql`
  mutation UpdateMyTeacherProfile(
    $phoneNumber: String
    $email: String
    $birthDate: Date
    $description: String
  ) {
    updateMyTeacherProfile(
      phoneNumber: $phoneNumber
      email: $email
      birthDate: $birthDate
      description: $description
    ) {
      success
      teacher {
        id
        name
        email
        phoneNumber
        birthDate
        description
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
