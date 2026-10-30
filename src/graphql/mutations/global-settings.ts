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
    $trialClassDepositAmount: Float
    $trialClassDepositLabel: String
    $trialClassBalanceFooter: String
    $trialClassBadge: String
    $trialClassBadgeRequirement: String
    $trialClassTitle: String
    $trialClassDescription: String
    $trialClassFeatures: String
    $trialClassPriceLabel: String
    $trialClassPriceFooter: String
    $trialClassBookingNotice: String
    $trialClassPaymentRequiredNotice: String
    $trialClassEmailTemplate: String
    $sedeSalasInfo: String
    $bankTransferDetails: String
    $termsAndConditions: String
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
      trialClassDepositAmount: $trialClassDepositAmount
      trialClassDepositLabel: $trialClassDepositLabel
      trialClassBalanceFooter: $trialClassBalanceFooter
      trialClassBadge: $trialClassBadge
      trialClassBadgeRequirement: $trialClassBadgeRequirement
      trialClassTitle: $trialClassTitle
      trialClassDescription: $trialClassDescription
      trialClassFeatures: $trialClassFeatures
      trialClassPriceLabel: $trialClassPriceLabel
      trialClassPriceFooter: $trialClassPriceFooter
      trialClassBookingNotice: $trialClassBookingNotice
      trialClassPaymentRequiredNotice: $trialClassPaymentRequiredNotice
      trialClassEmailTemplate: $trialClassEmailTemplate
      sedeSalasInfo: $sedeSalasInfo
      bankTransferDetails: $bankTransferDetails
      termsAndConditions: $termsAndConditions
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
        trialClassDepositAmount
        trialClassDepositLabel
        trialClassBalanceFooter
        trialClassBadge
        trialClassBadgeRequirement
        trialClassTitle
        trialClassDescription
        trialClassFeatures
        trialClassPriceLabel
        trialClassPriceFooter
        trialClassBookingNotice
        trialClassPaymentRequiredNotice
        trialClassEmailTemplate
        sedeSalasInfo
        bankTransferDetails
        termsAndConditions
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
