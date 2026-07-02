import { gql } from "@apollo/client/core/index.js";

export const GET_CONTACT_CONTENT = gql`
  query GetContactContent {
    contactContent {
      id
      bannerTitle1
      bannerTitle2
      bannerTitle3
      bannerTitle4
      locationTitle
      locationDescription
      locationAddressTitle
      locationAddress
      locationMapIframeUrl
    }
  }
`;
