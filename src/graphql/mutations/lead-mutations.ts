import { gql } from "@apollo/client";

export const CREATE_LEAD = gql`
  mutation CreateLead($nombre: String!, $telefono: String!, $email: String, $servicio: String, $fuente: String) {
    createLead(nombre: $nombre, telefono: $telefono, email: $email, servicio: $servicio, fuente: $fuente) {
      lead {
        id
        nombre
        estado
      }
    }
  }
`;

export const CONVERT_LEAD_TO_STUDENT = gql`
  mutation ConvertLeadToStudent($leadId: ID!) {
    convertLeadToStudent(leadId: $leadId) {
      student {
        id
        name
      }
    }
  }
`;

export const UPDATE_LEAD_STATUS = gql`
  mutation UpdateLeadStatus($leadId: ID!, $status: String!) {
    updateLeadStatus(leadId: $leadId, status: $status) {
      lead {
        id
        estado
      }
    }
  }
`;

export const CREATE_LEAD_NOTE = gql`
  mutation CreateLeadNote($leadId: Int!, $texto: String!, $autor: String) {
    createLeadNote(leadId: $leadId, texto: $texto, autor: $autor) {
      success
      leadNote {
        id
        texto
        autor
        fecha
      }
    }
  }
`;

export const DELETE_LEAD = gql`
  mutation DeleteLead($id: ID!) {
    deleteLead(id: $id) {
      success
    }
  }
`;

export const CONFIRM_LEAD_RESERVATION_WITH_LESSON = gql`
  mutation ConfirmLeadReservationWithLesson(
    $leadId: Int!
    $teacherId: Int!
    $date: Date!
    $startTime: Time!
    $endTime: Time!
    $roomId: Int
    $lessonType: String
  ) {
    confirmLeadReservationWithLesson(
      leadId: $leadId
      teacherId: $teacherId
      date: $date
      startTime: $startTime
      endTime: $endTime
      roomId: $roomId
      lessonType: $lessonType
    ) {
      success
      error
      lead {
        id
        nombre
        estado
      }
      lesson {
        id
        date
        startTime
        endTime
        status
        teacher {
          id
          name
        }
        room {
          id
          name
        }
      }
    }
  }
`;
