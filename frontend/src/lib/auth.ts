/**
 * Auth API helpers — thin wrappers around fetchApi.
 * Used by Login, Register, and ForgotPassword pages.
 */
import { fetchApi } from "./api";

export const loginAPI = (email: string, password: string) =>
  fetchApi("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

export const registerAPI = (userData: {
  name: string;
  email: string;
  password: string;
  role: string;
  phone?: string | null;
  location?: string | null;
}) =>
  fetchApi("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData),
  });

export const getMeAPI = () => fetchApi("/auth/me");

export const forgotPasswordAPI = (email: string) =>
  fetchApi("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
