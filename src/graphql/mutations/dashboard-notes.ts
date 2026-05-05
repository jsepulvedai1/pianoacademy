import { gql } from "@apollo/client";

export const GET_DASHBOARD_NOTES = gql`
  query GetDashboardNotes {
    allDashboardNotes {
      id
      text
      isCompleted
      author
    }
  }
`;

export const CREATE_NOTE = gql`
  mutation CreateNote($text: String!, $author: String) {
    createDashboardNote(text: $text, author: $author) {
      note {
        id
        text
        isCompleted
      }
    }
  }
`;

export const TOGGLE_NOTE = gql`
  mutation ToggleNote($id: Int!) {
    toggleDashboardNote(id: $id) {
      success
      note {
        id
        isCompleted
      }
    }
  }
`;

export const DELETE_NOTE = gql`
  mutation DeleteNote($id: Int!) {
    deleteDashboardNote(id: $id) {
      success
    }
  }
`;
