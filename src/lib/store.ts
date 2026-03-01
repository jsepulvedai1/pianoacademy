import { create } from 'zustand';
import { ClassType, Teacher } from '@/types/domain';

interface BookingState {
  step: number;
  selectedClass: ClassType | null;
  selectedTeacher: Teacher | null;
  selectedDate: Date | null;
  selectedTimeSlot: string | null; // ISO String or specific format
  
  // Actions
  setStep: (step: number) => void;
  setSelectedClass: (classType: ClassType | null) => void;
  setSelectedTeacher: (teacher: Teacher | null) => void;
  setSelectedDate: (date: Date | null) => void;
  setSelectedTimeSlot: (timeSlot: string | null) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>((set) => ({
  step: 1,
  selectedClass: null,
  selectedTeacher: null,
  selectedDate: null,
  selectedTimeSlot: null,

  setStep: (step) => set({ step }),
  setSelectedClass: (classType) => set({ selectedClass: classType }),
  setSelectedTeacher: (teacher) => set({ selectedTeacher: teacher }),
  setSelectedDate: (date) => set({ selectedDate: date }),
  setSelectedTimeSlot: (timeSlot) => set({ selectedTimeSlot: timeSlot }),
  reset: () => set({
    step: 1,
    selectedClass: null,
    selectedTeacher: null,
    selectedDate: null,
    selectedTimeSlot: null
  })
}));
