import { env } from "cloudflare:workers";

const createTableSql = `CREATE TABLE IF NOT EXISTS submissions (
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
)`;

async function ensureTable() {
  await env.DB.prepare(createTableSql).run();
}

export async function POST(request: Request) {
  try {
    const body = await request.json() as Record<string, unknown>;
    const clean = (key: string, max: number) => String(body[key] ?? "").trim().slice(0, max);
    const name = clean("name", 80);
    const phone = clean("phone", 20);
    const wechat = clean("wechat", 100);
    const bio = clean("bio", 2000);
    const otherChannel = clean("otherChannel", 200);
    const expectations = clean("expectations", 3000);
    const message = clean("message", 3000);
    const channels = Array.isArray(body.channels)
      ? body.channels.map((item) => String(item)).filter((item) => ["微信公众号", "朋友圈/微信群", "朋友推荐", "其他"].includes(item))
      : [];

    if (!name || !/^1\d{10}$/.test(phone) || !wechat || !bio || !channels.length) {
      return Response.json({ error: "请完整填写必填信息。" }, { status: 400 });
    }
    if (channels.includes("其他") && !otherChannel) {
      return Response.json({ error: "请填写其他渠道。" }, { status: 400 });
    }

    await ensureTable();
    await env.DB.prepare(`INSERT INTO submissions
      (name, phone, wechat, bio, channels, other_channel, expectations, message)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(name, phone, wechat, bio, channels.join("、"), otherChannel, expectations, message)
      .run();

    return Response.json({ ok: true }, { status: 201 });
  } catch {
    return Response.json({ error: "提交失败，请稍后再试。" }, { status: 500 });
  }
}
