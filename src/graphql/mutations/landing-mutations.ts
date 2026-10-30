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
    $galleryImages: String
    $cta: String
    $whyLearnTitle: String
    $whyLearnSubtitle: String
    $showHero: Boolean
    $showGallery: Boolean
    $showTeachers: Boolean
    $showMethodology: Boolean
    $showWhyLearn: Boolean
    $showCta: Boolean
  ) {
    updateLandingPage(
      slug: $slug
      title: $title
      subtitle: $subtitle
      problem: $problem
      solution: $solution
      benefits: $benefits
      imageUrl: $imageUrl
      galleryImages: $galleryImages
      cta: $cta
      whyLearnTitle: $whyLearnTitle
      whyLearnSubtitle: $whyLearnSubtitle
      showHero: $showHero
      showGallery: $showGallery
      showTeachers: $showTeachers
      showMethodology: $showMethodology
      showWhyLearn: $showWhyLearn
      showCta: $showCta
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
