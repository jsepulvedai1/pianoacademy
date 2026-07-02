import { gql } from "@apollo/client/core/index.js";

export const UPDATE_ABOUT_CONTENT = gql`
  mutation UpdateAboutContent(
    $heroImage: String
    $heroTitleHighlight1: String
    $heroTitleText1: String
    $heroTitleHighlight2: String
    $historyImage: String
    $historyTitle: String
    $historySubtitle: String
    $historyDescription: String
    $movingTitle: String
    $movingDescription: String
    $movingCards: String
    $teamTitle: String
    $teamDescription: String
    $teamImages: String
    $finalTitle1: String
    $finalTitle2: String
    $finalTitle3: String
    $finalImage: String
  ) {
    updateAboutContent(
      heroImage: $heroImage
      heroTitleHighlight1: $heroTitleHighlight1
      heroTitleText1: $heroTitleText1
      heroTitleHighlight2: $heroTitleHighlight2
      historyImage: $historyImage
      historyTitle: $historyTitle
      historySubtitle: $historySubtitle
      historyDescription: $historyDescription
      movingTitle: $movingTitle
      movingDescription: $movingDescription
      movingCards: $movingCards
      teamTitle: $teamTitle
      teamDescription: $teamDescription
      teamImages: $teamImages
      finalTitle1: $finalTitle1
      finalTitle2: $finalTitle2
      finalTitle3: $finalTitle3
      finalImage: $finalImage
    ) {
      success
    }
  }
`;

export const UPDATE_CONTACT_CONTENT = gql`
  mutation UpdateContactContent(
    $bannerTitle1: String
    $bannerTitle2: String
    $bannerTitle3: String
    $bannerTitle4: String
    $locationTitle: String
    $locationDescription: String
    $locationAddressTitle: String
    $locationAddress: String
    $locationMapIframeUrl: String
  ) {
    updateContactContent(
      bannerTitle1: $bannerTitle1
      bannerTitle2: $bannerTitle2
      bannerTitle3: $bannerTitle3
      bannerTitle4: $bannerTitle4
      locationTitle: $locationTitle
      locationDescription: $locationDescription
      locationAddressTitle: $locationAddressTitle
      locationAddress: $locationAddress
      locationMapIframeUrl: $locationMapIframeUrl
    ) {
      success
    }
  }
`;
