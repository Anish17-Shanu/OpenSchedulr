import { create } from "zustand";
import type { Role } from "../types";

interface AuthState {
  token: string | null;
  email: string | null;
  role: Role | null;
  setAuth: (token: string, email: string, role: Role) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  email: null,
  role: null,
  setAuth: (token, email, role) => set({ token, email, role }),
  logout: () => set({ token: null, email: null, role: null })
}));
