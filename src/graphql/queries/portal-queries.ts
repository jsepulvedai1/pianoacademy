import { gql } from "@apollo/client/core/index.js";

export const MY_STUDENT_PROFILE = gql`
  query MyStudentProfile {
    myStudentProfile {
      id
      name
      email
      photo
      status
      phoneNumber
      rut
      birthDate
      level
      startDate
      primaryInstrument {
        id
        name
      }
    }
  }
`;

export const MY_TEACHER_PROFILE = gql`
  query MyTeacherProfile {
    myTeacherProfile {
      id
      name
      description
      photo
      status
      phoneNumber
      rut
      address
      email
      specialties {
        id
        name
      }
    }
  }
`;

export const MY_STUDENTS = gql`
  query MyStudents {
    myStudents {
      id
      name
      email
      photo
      phoneNumber
      level
      startDate
      primaryInstrument {
        id
        name
      }
    }
  }
`;

export const MY_LESSONS = gql`
  query MyLessons($startDate: String, $endDate: String) {
    myLessons(startDate: $startDate, endDate: $endDate) {
      id
      date
      startTime
      endTime
      status
      lessonType
      room {
        id
        name
      }
      teacher {
        id
        name
      }
      student {
        id
        name
      }
    }
  }
`;

export const MY_WALL_MESSAGES = gql`
  query MyWallMessages {
    myWallMessages {
      id
      text
      author
      createdAt
      attachedMaterial {
        id
        title
        type
        url
      }
    }
  }
`;

export const MY_PACKS = gql`
  query MyPacks {
    myPacks {
      id
      totalClasses
      remainingClasses
      purchaseDate
      expirationDate
      isActive
      plan {
        id
        name
      }
    }
  }
`;
