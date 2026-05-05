import { gql } from "@apollo/client";

export const GET_ACADEMY_TASKS = gql`
  query GetAcademyTasks {
    allAcademyTasks {
      id
      title
      description
      assignedTo
      priority
      log
      isCompleted
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_ACADEMY_TASK = gql`
  mutation CreateAcademyTask($title: String!, $description: String, $assignedTo: String, $priority: String, $log: String) {
    createAcademyTask(title: $title, description: $description, assignedTo: $assignedTo, priority: $priority, log: $log) {
      task {
        id
        title
      }
    }
  }
`;

export const UPDATE_ACADEMY_TASK = gql`
  mutation UpdateAcademyTask($id: Int!, $title: String, $description: String, $assignedTo: String, $priority: String, $log: String, $isCompleted: Boolean) {
    updateAcademyTask(id: $id, title: $title, description: $description, assignedTo: $assignedTo, priority: $priority, log: $log, isCompleted: $isCompleted) {
      task {
        id
        title
        isCompleted
      }
    }
  }
`;

export const DELETE_ACADEMY_TASK = gql`
  mutation DeleteAcademyTask($id: Int!) {
    deleteAcademyTask(id: $id) {
      success
    }
  }
`;
