import axios from "axios";
import type { Analytics, AuthResponse, Course, Faculty, NotificationItem, Room, TimeSlot, TimetableEntry } from "../types";
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
  const { data } = await api.post<AuthResponse>("/auth/login", { email, password });
  return data;
}

export async function getFaculty() {
  const { data } = await api.get<{ content: Faculty[] }>("/faculty");
  return data.content;
}

export async function getCourses() {
  const { data } = await api.get<{ content: Course[] }>("/courses");
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
