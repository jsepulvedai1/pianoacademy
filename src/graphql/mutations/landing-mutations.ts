import { gql } from "@apollo/client/core/index.js";

export const UPDATE_LANDING_PAGE = gql`
  mutation UpdateLandingPage(
    $slug: String!
    $title: String
    $subtitle: String
    $problem: String
    $solution: String
    $benefits: [String]
    $imageUrl: String
    $cta: String
  ) {
    updateLandingPage(
      slug: $slug
      title: $title
      subtitle: $subtitle
      problem: $problem
      solution: $solution
      benefits: $benefits
      imageUrl: $imageUrl
      cta: $cta
    ) {
      success
      landingPage {
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
  }
`;

export const CLONE_LANDING_PAGE = gql`
  mutation CloneLandingPage($sourceSlug: String!, $newSlug: String!, $newTitle: String!) {
    cloneLandingPage(sourceSlug: $sourceSlug, newSlug: $newSlug, newTitle: $newTitle) {
      success
      error
      landingPage {
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
  }
`;
