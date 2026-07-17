import { gql } from "@apollo/client";

export const GET_ADMIN_ACCOUNTS = gql`
  query GetAdminAccounts {
    allAdminAccounts {
      id
      username
      email
      isSuperuser
      profile {
        role
        allowedSections
      }
    }
  }
`;

export const GET_AUDIT_LOGS = gql`
  query GetAuditLogs {
    allAuditLogs {
      id
      username
      action
      details
      ipAddress
      timestamp
    }
  }
`;

export const ME_QUERY = gql`
  query MeQuery {
    me {
      id
      username
      isSuperuser
      profile {
        role
        allowedSections
      }
    }
  }
`;

export const GET_CHAT_MESSAGES = gql`
  query GetChatMessages($phone: String!) {
    chatMessages(phone: $phone) {
      id
      sender
      messageText
      timestamp
    }
  }
`;

export const GET_STUDENT_PORTAL_ACCOUNTS = gql`
  query GetStudentPortalAccounts {
    allStudents {
      id
      name
      email
      rut
      level
      user {
        id
        username
      }
    }
  }
`;

export const GET_TEACHER_PORTAL_ACCOUNTS = gql`
  query GetTeacherPortalAccounts {
    allTeachers {
      id
      name
      email
      rut
      user {
        id
        username
      }
    }
  }
`;
