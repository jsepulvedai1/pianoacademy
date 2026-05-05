import { gql } from "@apollo/client";

export const GET_LESSONS = gql`
  query GetAllLessons {
    allLessons {
      id
      date
      startTime
      endTime
      status
      lessonType
      teacher {
        id
        name
      }
      student {
        id
        name
      }
      room {
        id
        name
      }
    }
  }
`;
