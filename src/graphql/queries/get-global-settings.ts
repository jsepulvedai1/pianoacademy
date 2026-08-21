import { gql } from "@apollo/client/core/index.js";

export const GET_GLOBAL_SETTINGS = gql`
  query GetGlobalSettings {
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
      whatsappNumber
      whatsappAssignedTo
      evolutionApiUrl
      evolutionApiKey
      evolutionInstanceName
      whatsappAutoReply
      whatsappWelcomeTemplate
    }
  }
`;
