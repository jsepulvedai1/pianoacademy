import { gql } from "@apollo/client";

export const GET_ALL_HOLIDAYS = gql`
  query GetAllHolidays($year: Int) {
    allHolidays(year: $year) {
      id
      date
      name
      isActive
      isCustom
      createdAt
    }
  }
`;

export const GET_ACTIVE_HOLIDAYS = gql`
  query GetActiveHolidays($year: Int) {
    activeHolidays(year: $year) {
      id
      date
      name
      isActive
      isCustom
    }
  }
`;
