import { gql } from "@apollo/client";

export const UPDATE_GLOBAL_SETTINGS = gql`
  mutation UpdateGlobalSettings(
    $phoneNumber: String
    $emailContact: String
    $address: String
    $openingHoursWeekdays: String
    $openingHoursSaturdays: String
    $facebookUrl: String
    $instagramUrl: String
    $trialClassEmailTemplate: String
  ) {
    updateGlobalSettings(
      phoneNumber: $phoneNumber
      emailContact: $emailContact
      address: $address
      openingHoursWeekdays: $openingHoursWeekdays
      openingHoursSaturdays: $openingHoursSaturdays
      facebookUrl: $facebookUrl
      instagramUrl: $instagramUrl
      trialClassEmailTemplate: $trialClassEmailTemplate
    ) {
      globalSettings {
        id
        phoneNumber
        emailContact
        address
        openingHoursWeekdays
        openingHoursSaturdays
        facebookUrl
        instagramUrl
        trialClassEmailTemplate
      }
    }
  }
`;
