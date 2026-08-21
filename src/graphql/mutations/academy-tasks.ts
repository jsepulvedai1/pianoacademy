import { gql } from "@apollo/client";

export const GET_ACADEMY_TASKS = gql`
  query GetAcademyTasks {
    allAcademyTasks {
      id
      title
      description
      assignedTo
      assignedUser {
        id
        username
      }
      priority
      status
      log
      isCompleted
      dueDate
      duration
      completedAt
      createdAt
      updatedAt
    }
  }
`;

export const CREATE_ACADEMY_TASK = gql`
  mutation CreateAcademyTask(
    $title: String!,
    $description: String,
    $assignedTo: String,
    $assignedUserId: Int,
    $priority: String,
    $status: String,
    $dueDate: Date,
    $duration: Int,
    $log: String
  ) {
    createAcademyTask(
      title: $title,
      description: $description,
      assignedTo: $assignedTo,
      assignedUserId: $assignedUserId,
      priority: $priority,
      status: $status,
      dueDate: $dueDate,
      duration: $duration,
      log: $log
    ) {
      task {
        id
        title
        status
      }
    }
  }
`;

export const UPDATE_ACADEMY_TASK = gql`
  mutation UpdateAcademyTask(
    $id: Int!,
    $title: String,
    $description: String,
    $assignedTo: String,
    $assignedUserId: Int,
    $priority: String,
    $status: String,
    $log: String,
    $isCompleted: Boolean,
    $dueDate: Date,
    $duration: Int
  ) {
    updateAcademyTask(
      id: $id,
      title: $title,
      description: $description,
      assignedTo: $assignedTo,
      assignedUserId: $assignedUserId,
      priority: $priority,
      status: $status,
      log: $log,
      isCompleted: $isCompleted,
      dueDate: $dueDate,
      duration: $duration
    ) {
      task {
        id
        title
        status
        isCompleted
        completedAt
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
