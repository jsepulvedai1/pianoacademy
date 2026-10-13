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
  mutation UpdateLessonStatus(
    $lessonId: Int!, 
    $status: String!, 
    $notes: String,
    $rescheduleDate: Date,
    $rescheduleStartTime: Time,
    $rescheduleEndTime: Time
  ) {
    updateLessonStatus(
      lessonId: $lessonId, 
      status: $status,
      notes: $notes,
      rescheduleDate: $rescheduleDate,
      rescheduleStartTime: $rescheduleStartTime,
      rescheduleEndTime: $rescheduleEndTime
    ) {
      success
      lesson {
        id
        status
        notes
      }
    }
  }
`;

export const CREATE_PRE_RESERVATION = gql`
  mutation CreatePreReservation(
    $nombre: String!
    $telefono: String!
    $email: String
    $edad: Int
    $apoderadoNombre: String
    $servicio: String
    $profesorNombre: String!
    $fecha: Date!
    $hora: Time!
    $sala: String
    $modalidad: String
    $notas: String
  ) {
    createPreReservation(
      nombre: $nombre
      telefono: $telefono
      email: $email
      edad: $edad
      apoderadoNombre: $apoderadoNombre
      servicio: $servicio
      profesorNombre: $profesorNombre
      fecha: $fecha
      hora: $hora
      sala: $sala
      modalidad: $modalidad
      notas: $notas
    ) {
      success
      lesson {
        id
      }
    }
  }
`;
