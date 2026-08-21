import { gql } from "@apollo/client";

export const GET_LEADS = gql`
  query GetLeads {
    allLeads {
      id
      nombre
      telefono
      email
      edad
      servicio
      fuente
      estado
      fechaIngreso
      notas {
        id
        texto
        autor
        fecha
      }
      lessons {
        id
        date
        startTime
        endTime
        status
        isPreReservation
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
