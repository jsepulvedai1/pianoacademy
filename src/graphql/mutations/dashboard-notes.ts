import { gql } from "@apollo/client";

export const GET_DASHBOARD_NOTES = gql`
  query GetDashboardNotes {
    allAcademyTasks {
      id
      title
      isCompleted
      assignedTo
    }
  }
`;

export const CREATE_NOTE = gql`
  mutation CreateNote($text: String!) {
    createAcademyTask(title: $text, priority: "RECORDATORIO", assignedTo: "ADMIN") {
      task {
        id
        title
        isCompleted
      }
    }
  }
`;

export const TOGGLE_NOTE = gql`
  mutation ToggleNote($id: Int!, $isCompleted: Boolean) {
    updateAcademyTask(id: $id, isCompleted: $isCompleted) {
      task {
        id
        isCompleted
      }
    }
  }
`;

export const DELETE_NOTE = gql`
  mutation DeleteNote($id: Int!) {
    deleteAcademyTask(id: $id) {
      success
    }
  }
`;
