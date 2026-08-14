import apiClient from "./client";
import type { User } from "../types";

// Logs in (or silently creates) a demo user by email.
// There's no real auth backend yet, so this is how the "Continue as
// Demo User" button on the login screen gets a real user id to work with.
export async function loginDemoUser(name: string, email: string): Promise<User> {
  const response = await apiClient.post<{ user: User }>("/users/login", {
    name,
    email,
  });
  return response.data.user;
}
