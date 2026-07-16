import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "2026秋季 信任圈研修营报名表",
  description: "填写报名信息，加入2026秋季信任圈研修营。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
