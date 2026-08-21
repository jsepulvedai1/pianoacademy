import { gql } from "@apollo/client";

export const CREATE_ANNOUNCEMENT = gql`
  mutation CreateAnnouncement(
    $title: String!
    $content: String!
    $targetAudience: String
    $isActive: Boolean
  ) {
    createAnnouncement(
      title: $title
      content: $content
      targetAudience: $targetAudience
      isActive: $isActive
    ) {
      announcement {
        id
        title
        content
        targetAudience
        isActive
        createdAt
      }
    }
  }
`;

export const UPDATE_ANNOUNCEMENT = gql`
  mutation UpdateAnnouncement(
    $id: Int!
    $title: String
    $content: String
    $targetAudience: String
    $isActive: Boolean
  ) {
    updateAnnouncement(
      id: $id
      title: $title
      content: $content
      targetAudience: $targetAudience
      isActive: $isActive
    ) {
      announcement {
        id
        title
        content
        targetAudience
        isActive
        createdAt
      }
    }
  }
`;

export const DELETE_ANNOUNCEMENT = gql`
  mutation DeleteAnnouncement($id: Int!) {
    deleteAnnouncement(id: $id) {
      success
    }
  }
`;
