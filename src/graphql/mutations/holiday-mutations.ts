import { gql } from "@apollo/client";

export const CREATE_HOLIDAY = gql`
  mutation CreateHoliday($date: Date!, $name: String!, $isActive: Boolean) {
    createHoliday(date: $date, name: $name, isActive: $isActive) {
      holiday {
        id
        date
        name
        isActive
        isCustom
      }
      success
      error
    }
  }
`;

export const UPDATE_HOLIDAY = gql`
  mutation UpdateHoliday($id: Int!, $name: String, $date: Date, $isActive: Boolean) {
    updateHoliday(id: $id, name: $name, date: $date, isActive: $isActive) {
      holiday {
        id
        date
        name
        isActive
      }
      success
      error
    }
  }
`;

export const TOGGLE_HOLIDAY = gql`
  mutation ToggleHoliday($id: Int!, $isActive: Boolean) {
    toggleHoliday(id: $id, isActive: $isActive) {
      holiday {
        id
        date
        name
        isActive
      }
      success
    }
  }
`;

export const DELETE_HOLIDAY = gql`
  mutation DeleteHoliday($id: Int!) {
    deleteHoliday(id: $id) {
      success
    }
  }
`;

export const SEED_DEFAULT_HOLIDAYS = gql`
  mutation SeedDefaultHolidays($years: [Int]) {
    seedDefaultHolidays(years: $years) {
      count
      success
    }
  }
`;
