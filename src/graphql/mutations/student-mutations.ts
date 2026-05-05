import { gql } from "@apollo/client";

export const CREATE_STUDENT = gql`
  mutation CreateStudent(
    $name: String!, 
    $rut: String, 
    $birthDate: Date, 
    $guardianName: String, 
    $guardianPhone: String, 
    $phoneNumber: String, 
    $level: String, 
    $primaryInstrumentId: Int
  ) {
    createStudent(
      name: $name, 
      rut: $rut, 
      birthDate: $birthDate, 
      guardianName: $guardianName, 
      guardianPhone: $guardianPhone, 
      phoneNumber: $phoneNumber, 
      level: $level, 
      primaryInstrumentId: $primaryInstrumentId
    ) {
      student {
        id
        name
        status
        phoneNumber
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
