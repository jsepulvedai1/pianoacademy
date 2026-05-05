import { create } from 'zustand';
import { ClassType, Teacher } from '@/types/domain';

interface BookingState {
  step: number;
  selectedClass: ClassType | null;
  selectedTeacher: Teacher | null;
  selectedDate: Date | null;
  selectedTimeSlot: string | null;
  utmParams: {
    source?: string;
    medium?: string;
    campaign?: string;
  };
  acceptedTerms: boolean;
  
  // Actions
  setStep: (step: number) => void;
  setSelectedClass: (classType: ClassType | null) => void;
  setSelectedTeacher: (teacher: Teacher | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTimeSlot: (timeSlot: string | null) => void;
  setUtmParams: (params: { source?: string; medium?: string; campaign?: string }) => void;
  setAcceptedTerms: (accepted: boolean) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  selectedClass: null,
  selectedTeacher: null,
  selectedDate: null,
  selectedTimeSlot: null,
  utmParams: {},
  acceptedTerms: false,

  setStep: (step) => set({ step }),
  setSelectedClass: (classType) => set({ selectedClass: classType }),
  setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (timeSlot) => set({ selectedTimeSlot: timeSlot }),
  setUtmParams: (utmParams) => set({ utmParams }),
  setAcceptedTerms: (acceptedTerms) => set({ acceptedTerms }),
  reset: () => set({
    step: 1,
    selectedClass: null,
    selectedTeacher: null,
    selectedDate: null,
    selectedTimeSlot: null,
    utmParams: {},
    acceptedTerms: false
  })
}));
