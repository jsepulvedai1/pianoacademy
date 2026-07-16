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
