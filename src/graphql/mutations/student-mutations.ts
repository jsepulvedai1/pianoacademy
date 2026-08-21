import { gql } from "@apollo/client";

export const CREATE_STUDENT = gql`
  mutation CreateStudent(
    $name: String!, 
    $email: String,
    $rut: String, 
    $birthDate: Date, 
    $guardianName: String, 
    $guardianPhone: String, 
    $phoneNumber: String, 
    $level: String, 
    $primaryInstrumentId: Int,
    $assignedTeacherIds: [Int]
  ) {
    createStudent(
      name: $name, 
      email: $email,
      rut: $rut, 
      birthDate: $birthDate, 
      guardianName: $guardianName, 
      guardianPhone: $guardianPhone, 
      phoneNumber: $phoneNumber, 
      level: $level, 
      primaryInstrumentId: $primaryInstrumentId,
      assignedTeacherIds: $assignedTeacherIds
    ) {
      student {
        id
        name
        email
        status
        phoneNumber
        assignedTeachers {
          id
          name
        }
      }
    }
  }
`;

export const REGISTER_PAYMENT = gql`
  mutation RegisterPayment($studentId: Int!, $amount: Float!, $method: String!, $description: String, $planId: Int) {
    registerPayment(studentId: $studentId, amount: $amount, method: $method, description: $description, planId: $planId) {
      success
      payment {
        id
        amount
        paymentDate
        method
      }
      pack {
        id
        totalClasses
        remainingClasses
      }
    }
  }
`;

export const UPDATE_STUDENT = gql`
  mutation UpdateStudent(
    $id: Int!,
    $name: String,
    $email: String,
    $rut: String,
    $birthDate: Date,
    $guardianName: String,
    $guardianPhone: String,
    $status: String,
    $phoneNumber: String,
    $level: String,
    $primaryInstrumentId: Int,
    $assignedTeacherIds: [Int]
  ) {
    updateStudent(
      id: $id,
      name: $name,
      email: $email,
      rut: $rut,
      birthDate: $birthDate,
      guardianName: $guardianName,
      guardianPhone: $guardianPhone,
      status: $status,
      phoneNumber: $phoneNumber,
      level: $level,
      primaryInstrumentId: $primaryInstrumentId,
      assignedTeacherIds: $assignedTeacherIds
    ) {
      student {
        id
        name
        email
        rut
        birthDate
        guardianName
        guardianPhone
        status
        phoneNumber
        level
        primaryInstrument {
          id
          name
        }
        assignedTeachers {
          id
          name
        }
      }
    }
  }
`;

export const CREATE_PAYMENT_PREFERENCE = gql`
  mutation CreatePaymentPreference(
    $planId: Int,
    $isTrialClass: Boolean,
    $name: String!,
    $email: String!,
    $phone: String!,
    $backUrl: String!
  ) {
    createPaymentPreference(
      planId: $planId,
      isTrialClass: $isTrialClass,
      name: $name,
      email: $email,
      phone: $phone,
      backUrl: $backUrl
    ) {
      success
      preferenceId
      initPoint
    }
  }
`;

export const LOGIN_USER = gql`
  mutation LoginUser($username: String!, $password: String!) {
    loginUser(username: $username, password: $password) {
      success
      token
      portalType
      error
      user {
        id
        username
        profile {
          role
          allowedSections
        }
      }
    }
  }
`;

export const CREATE_ADMIN_ACCOUNT = gql`
  mutation CreateAdminAccount(
    $username: String!,
    $password: String!,
    $email: String,
    $role: String!,
    $allowedSections: [String]!
  ) {
    createAdminAccount(
      username: $username,
      password: $password,
      email: $email,
      role: $role,
      allowedSections: $allowedSections
    ) {
      success
      error
      user {
        id
        username
        profile {
          role
          allowedSections
        }
      }
    }
  }
`;

export const UPDATE_ADMIN_ACCOUNT = gql`
  mutation UpdateAdminAccount(
    $id: Int!,
    $password: String,
    $role: String,
    $allowedSections: [String]
  ) {
    updateAdminAccount(
      id: $id,
      password: $password,
      role: $role,
      allowedSections: $allowedSections
    ) {
      success
      error
      user {
        id
        username
        profile {
          role
          allowedSections
        }
      }
    }
  }
`;

export const DELETE_ADMIN_ACCOUNT = gql`
  mutation DeleteAdminAccount($id: Int!) {
    deleteAdminAccount(id: $id) {
      success
      error
    }
  }
`;

export const SEND_WHATSAPP_MUTATION = gql`
  mutation SendWhatsApp($phoneNumber: String!, $message: String!) {
    sendWhatsapp(phoneNumber: $phoneNumber, message: $message) {
      success
      response
    }
  }
`;

export const CREATE_STUDENT_ACCOUNT = gql`
  mutation CreateStudentAccount($studentId: Int!, $password: String!) {
    createStudentAccount(studentId: $studentId, password: $password) {
      success
      error
    }
  }
`;

export const CREATE_TEACHER_ACCOUNT = gql`
  mutation CreateTeacherAccount($teacherId: Int!, $password: String!) {
    createTeacherAccount(teacherId: $teacherId, password: $password) {
      success
      error
    }
  }
`;

export const RESET_PORTAL_PASSWORD = gql`
  mutation ResetPortalPassword($userId: Int!, $newPassword: String!) {
    resetPortalPassword(userId: $userId, newPassword: $newPassword) {
      success
      error
    }
  }
`;

export const CHANGE_MY_PASSWORD = gql`
  mutation ChangeMyPassword($currentPassword: String!, $newPassword: String!) {
    changeMyPassword(currentPassword: $currentPassword, newPassword: $newPassword) {
      success
      error
    }
  }
`;
