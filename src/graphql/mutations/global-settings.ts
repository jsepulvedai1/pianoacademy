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
    $trialClassPrice: Float
    $trialClassEmailTemplate: String
    $whatsappNumber: String
    $whatsappAssignedTo: String
    $evolutionApiUrl: String
    $evolutionApiKey: String
    $evolutionInstanceName: String
    $whatsappAutoReply: Boolean
    $whatsappWelcomeTemplate: String
  ) {
    updateGlobalSettings(
      phoneNumber: $phoneNumber
      emailContact: $emailContact
      address: $address
      openingHoursWeekdays: $openingHoursWeekdays
      openingHoursSaturdays: $openingHoursSaturdays
      facebookUrl: $facebookUrl
      instagramUrl: $instagramUrl
      trialClassPrice: $trialClassPrice
      trialClassEmailTemplate: $trialClassEmailTemplate
      whatsappNumber: $whatsappNumber
      whatsappAssignedTo: $whatsappAssignedTo
      evolutionApiUrl: $evolutionApiUrl
      evolutionApiKey: $evolutionApiKey
      evolutionInstanceName: $evolutionInstanceName
      whatsappAutoReply: $whatsappAutoReply
      whatsappWelcomeTemplate: $whatsappWelcomeTemplate
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
        trialClassPrice
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
  }
`;

export const SEND_WHATSAPP_TEST = gql`
  mutation SendWhatsAppTest($phoneNumber: String!, $message: String!) {
    sendWhatsapp(phoneNumber: $phoneNumber, message: $message) {
      success
      response
    }
  }
`;
