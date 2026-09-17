export const ADMIN_EMAILS = ["hank123@gmail.com"];

export function roleForEmail(email: string): "admin" | "user" {
  return ADMIN_EMAILS.includes(email.toLowerCase().trim()) ? "admin" : "user";
}
