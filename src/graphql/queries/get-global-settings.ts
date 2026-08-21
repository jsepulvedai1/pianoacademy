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

export const GET_WHATSAPP_STATUS_AND_QR = gql`
  query GetWhatsAppStatusAndQr {
    whatsappConnectionStatus
    whatsappQrCode
  }
`;
