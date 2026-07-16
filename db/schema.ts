import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const submissions = sqliteTable("submissions", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  wechat: text("wechat").notNull(),
  bio: text("bio").notNull(),
  channels: text("channels").notNull(),
  otherChannel: text("other_channel").notNull().default(""),
  expectations: text("expectations").notNull().default(""),
  message: text("message").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});
