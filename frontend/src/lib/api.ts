import axios from "axios";
import type { AxiosError } from "axios";
import type {
  Analytics,
  AuditLog,
  AuthResponse,
  Course,
  CreateCoursePayload,
  CreateFacultyPayload,
  CreateLectureDemandPayload,
  CreateRoomPayload,
  CreateTimeSlotPayload,
  Faculty,
  LectureDemand,
  NotificationItem,
  Room,
  TimeSlot,
  TimetableEntry
} from "../types";
import { useAuthStore } from "../store/auth-store";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080/api"
});

api.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export async function login(email: string, password: string) {
  const payload = { email, password };

  try {
    const { data } = await api.post<AuthResponse>("/auth/login", payload);
    return data;
  } catch (error) {
    const response = (error as AxiosError).response;
    const shouldTrySessionFallback = response?.status === 403 || response?.status === 404 || response?.status === 405;

    if (!shouldTrySessionFallback) {
      throw error;
    }
  }

  const { data } = await api.post<AuthResponse>("/session/login", payload);
  return data;
}

export async function getFaculty() {
  const { data } = await api.get<{ content: Faculty[] }>("/faculty?page=0&size=200");
  return data.content;
}

export async function getCourses() {
  const { data } = await api.get<{ content: Course[] }>("/courses?page=0&size=200");
  return data.content;
}

export async function getRooms() {
  const { data } = await api.get<Room[]>("/catalog/rooms");
  return data;
}

export async function getTimeSlots() {
  const { data } = await api.get<TimeSlot[]>("/catalog/timeslots");
  return data;
}

export async function getTimetable() {
  const { data } = await api.get<TimetableEntry[]>("/timetable");
  return data;
}

export async function getConflicts() {
  const { data } = await api.get<string[]>("/timetable/conflicts");
  return data;
}

export async function generateSchedule() {
  const { data } = await api.post<{ generatedEntries: number; warnings: string[] }>("/scheduling/generate");
  return data;
}

export async function publishSchedule() {
  await api.post("/timetable/publish");
}

export async function rescheduleEntry(entryId: string, roomId: string, timeSlotId: string) {
  const { data } = await api.patch<TimetableEntry>(`/timetable/${entryId}/reschedule`, { roomId, timeSlotId });
  return data;
}

export async function getAnalytics() {
  const { data } = await api.get<Analytics>("/analytics");
  return data;
}

export async function getFacultyNotifications(email: string) {
  const { data } = await api.get<NotificationItem[]>(`/faculty/dashboard/${email}/notifications`);
  return data;
}

export async function createFaculty(payload: CreateFacultyPayload) {
  const { data } = await api.post<Faculty>("/faculty", payload);
  return data;
}

export async function createCourse(payload: CreateCoursePayload) {
  const { data } = await api.post<Course>("/courses", payload);
  return data;
}

export async function createRoom(payload: CreateRoomPayload) {
  const { data } = await api.post<Room>("/catalog/rooms", payload);
  return data;
}

export async function createTimeSlot(payload: CreateTimeSlotPayload) {
  const { data } = await api.post<TimeSlot>("/catalog/timeslots", payload);
  return data;
}

export async function getLectureDemands() {
  const { data } = await api.get<LectureDemand[]>("/scheduling/demands");
  return data;
}

export async function createLectureDemand(payload: CreateLectureDemandPayload) {
  const { data } = await api.post<LectureDemand>("/scheduling/demands", payload);
  return data;
}

export async function deleteLectureDemand(demandId: string) {
  await api.delete(`/scheduling/demands/${demandId}`);
}

export async function deleteFaculty(facultyId: string) {
  await api.delete(`/faculty/${facultyId}`);
}

export async function deleteCourse(courseId: string) {
  await api.delete(`/courses/${courseId}`);
}

export async function deleteRoom(roomId: string) {
  await api.delete(`/catalog/rooms/${roomId}`);
}

export async function deleteTimeSlot(timeSlotId: string) {
  await api.delete(`/catalog/timeslots/${timeSlotId}`);
}

export async function getAuditLogs() {
  const { data } = await api.get<AuditLog[]>("/audit/logs?limit=20");
  return data;
}
