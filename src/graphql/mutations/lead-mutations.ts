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
