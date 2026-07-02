import { gql } from "@apollo/client/core/index.js";

export const GET_ABOUT_CONTENT = gql`
  query GetAboutContent {
    aboutContent {
      id
      heroImage
      heroTitleHighlight1
      heroTitleText1
      heroTitleHighlight2
      historyImage
      historyTitle
      historySubtitle
      historyDescription
      movingTitle
      movingDescription
      movingCards
      teamTitle
      teamDescription
      teamImages
      finalTitle1
      finalTitle2
      finalTitle3
      finalImage
    }
  }
`;
