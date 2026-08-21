import { gql } from "@apollo/client";

export const GET_ANNOUNCEMENTS = gql`
  query GetAnnouncements {
    allAnnouncements {
      id
      title
      content
      targetAudience
      isActive
      createdAt
    }
  }
`;

export const GET_ACTIVE_ANNOUNCEMENTS = gql`
  query GetActiveAnnouncements($targetAudience: String) {
    activeAnnouncements(targetAudience: $targetAudience) {
      id
      title
      content
      targetAudience
      isActive
      createdAt
    }
  }
`;
