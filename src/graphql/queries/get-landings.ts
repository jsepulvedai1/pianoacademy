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
      cta
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
      cta
    }
  }
`;
