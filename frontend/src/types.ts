export type Role = "ADMIN" | "FACULTY";

export interface AuthResponse {
  token: string;
  email: string;
  role: Role;
}

export interface Faculty {
  id: string;
  fullName: string;
  email: string;
  department: string;
  maxLoad: number;
  availability: string;
  preferences: string;
}

export interface Course {
  id: string;
  code: string;
  title: string;
  credits: number;
  requiredHours: number;
  studentGroup: string;
  roomType: string;
}

export interface Room {
  id: string;
  name: string;
  capacity: number;
  roomType: string;
}

export interface TimeSlot {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  label: string;
}

export interface TimetableEntry {
  id: string;
  courseId: string;
  courseCode: string;
  courseTitle: string;
  studentGroup: string;
  facultyId: string;
  facultyName: string;
  roomId: string;
  roomName: string;
  timeSlotId: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  status: "DRAFT" | "PUBLISHED";
  source: "AUTO" | "MANUAL";
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  readFlag: boolean;
  createdAt: string;
}

export interface Analytics {
  workloadDistribution: Record<string, number>;
  roomUtilization: Record<string, number>;
  totalEntries: number;
  totalConflicts: number;
}

export interface CreateFacultyPayload {
  fullName: string;
  email: string;
  department: string;
  maxLoad: number;
  availability: string;
  preferences: string;
  password?: string;
}

export interface CreateCoursePayload {
  code: string;
  title: string;
  credits: number;
  requiredHours: number;
  studentGroup: string;
  roomType: string;
}

export interface CreateRoomPayload {
  name: string;
  capacity: number;
  roomType: string;
}

export interface CreateTimeSlotPayload {
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  label: string;
}
