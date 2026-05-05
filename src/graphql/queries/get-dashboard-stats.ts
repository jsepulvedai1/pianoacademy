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
      student {
        name
      }
    }
    totalLessons: allLessons {
      id
      status
      date
      teacher {
        name
      }
      student {
        name
      }
    }
  }
`;
