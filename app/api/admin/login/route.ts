import { COOKIE_NAME, sessionToken } from "../auth";

export async function POST(request: Request) {
  const body = await request.json() as { username?: string; password?: string };
  if (body.username !== "admin" || body.password !== "weijia77") {
    return Response.json({ error: "用户名或密码不正确。" }, { status: 401 });
  }
  const token = await sessionToken();
  return new Response(JSON.stringify({ ok: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `${COOKIE_NAME}=${token}; HttpOnly; SameSite=Strict; Secure; Path=/; Max-Age=28800`,
    },
  });
}
