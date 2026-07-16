export const COOKIE_NAME = "trust_circle_admin";

export async function sessionToken() {
  const data = new TextEncoder().encode("trust-circle-2026:admin:weijia77");
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
}
