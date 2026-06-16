import { gql } from "@apollo/client";

export const ON_LEAD_UPDATED = gql`
  subscription OnLeadUpdated {
    onLeadUpdated {
      lead {
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
          fecha
        }
      }
      eventType
    }
  }
`;
