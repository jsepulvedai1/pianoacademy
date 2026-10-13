import { gql } from "@apollo/client";

export const GET_DASHBOARD_STATS = gql`
  query GetDashboardStats {
    totalLeads: allLeads {
      id
      estado
    }
    totalStudents: allStudents {
      id
    }
    totalTeachers: allTeachers {
      id
    }
    totalPayments: allPayments {
      id
      amount
      paymentDate
      method
      description
      student {
        id
        name
        email
        phoneNumber
      }
      pack {
        id
        totalClasses
        remainingClasses
        plan {
          id
          name
        }
      }
    }
    totalLessons: allLessons {
      id
      status
      date
      startTime
      endTime
      lessonType
      notes
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
