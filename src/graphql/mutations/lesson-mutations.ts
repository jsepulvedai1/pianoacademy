import { gql } from "@apollo/client";

export const CREATE_LESSON = gql`
  mutation CreateLesson(
    $teacherId: Int!,
    $studentId: Int!,
    $roomId: Int!,
    $date: Date!,
    $startTime: Time!,
    $endTime: Time!,
    $lessonType: String
  ) {
    createLesson(
      teacherId: $teacherId,
      studentId: $studentId,
      roomId: $roomId,
      date: $date,
      startTime: $startTime,
      endTime: $endTime,
      lessonType: $lessonType
    ) {
      lesson {
        id
        date
        startTime
        status
      }
    }
  }
`;

export const UPDATE_LESSON_STATUS = gql`
  mutation UpdateLessonStatus($lessonId: Int!, $status: String!) {
    updateLessonStatus(lessonId: $lessonId, status: $status) {
      success
      lesson {
        id
        status
      }
    }
  }
`;
