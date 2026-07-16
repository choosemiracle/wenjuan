import { env } from "cloudflare:workers";
import { COOKIE_NAME, sessionToken } from "../auth";

function readCookie(request: Request, name: string) {
  const header = request.headers.get("cookie") || "";
  return header.split(";").map((part) => part.trim()).find((part) => part.startsWith(`${name}=`))?.slice(name.length + 1) || "";
}

export async function GET(request: Request) {
  const expected = await sessionToken();
  if (readCookie(request, COOKIE_NAME) !== expected) {
    return Response.json({ error: "请先登录。" }, { status: 401 });
  }

  try {
    await env.DB.prepare(`CREATE TABLE IF NOT EXISTS submissions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      wechat TEXT NOT NULL,
      bio TEXT NOT NULL,
      channels TEXT NOT NULL,
      other_channel TEXT NOT NULL DEFAULT '',
      expectations TEXT NOT NULL DEFAULT '',
      message TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )`).run();
    const result = await env.DB.prepare(`SELECT id, name, phone, wechat, bio, channels,
      other_channel AS otherChannel, expectations, message, created_at AS createdAt
      FROM submissions ORDER BY created_at DESC, id DESC`).all();
    return Response.json({ submissions: result.results });
  } catch {
    return Response.json({ error: "暂时无法读取报名信息。" }, { status: 500 });
  }
}
