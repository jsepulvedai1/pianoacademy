import { gql } from "@apollo/client/core/index.js";

export const GET_HOMEPAGE_CONTENT = gql`
  query GetHomepageContent {
    homepageContent {
      id
      heroImage
      heroTitle1
      heroTitleHighlight
      heroTitle2
      heroSubtitle
      heroCta1Text
      heroCta1Link
      heroCta2Text
      heroCta2Link
      features
      methodBadge
      methodTitle
      methodDescription
      methodItems
      methodImage
      testimonials
      locationTitle
      locationDescription
      locationAddress
      locationAddressDetail
      locationMapUrl
      finalCtaTitle
      finalCtaDescription
      finalCtaButtonText
      planesTitle
      planesDescription
      instrumentsTitle
      instrumentsDescription
      galleryTitle
      galleryImages
    }
  }
`;
