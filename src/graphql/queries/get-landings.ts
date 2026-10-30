import { gql } from "@apollo/client/core/index.js";

export const GET_ALL_LANDING_PAGES = gql`
  query GetAllLandingPages {
    allLandingPages {
      id
      slug
      title
      subtitle
      problem
      solution
      benefits
      imageUrl
      galleryImages
      cta
      whyLearnTitle
      whyLearnSubtitle
      showHero
      showGallery
      showTeachers
      showMethodology
      showWhyLearn
      showCta
    }
  }
`;

export const GET_LANDING_PAGE_BY_SLUG = gql`
  query GetLandingPageBySlug($slug: String!) {
    landingPageBySlug(slug: $slug) {
      id
      slug
      title
      subtitle
      problem
      solution
      benefits
      imageUrl
      galleryImages
      cta
      whyLearnTitle
      whyLearnSubtitle
      showHero
      showGallery
      showTeachers
      showMethodology
      showWhyLearn
      showCta
    }
  }
`;
