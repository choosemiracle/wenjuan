"use client";

import { FormEvent, useEffect, useState } from "react";

type Submission = {
  id: number; name: string; phone: string; wechat: string; bio: string;
  channels: string; otherChannel: string; expectations: string; message: string; createdAt: string;
};

const initialForm = { name: "", phone: "", wechat: "", bio: "", channels: [] as string[], otherChannel: "", expectations: "", message: "" };

export default function QuestionnaireClient() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [adminOpen, setAdminOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [credentials, setCredentials] = useState({ username: "", password: "" });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [adminError, setAdminError] = useState("");

  useEffect(() => {
    if (!adminOpen) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && setAdminOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [adminOpen]);

  const update = (key: string, value: string | string[]) => setForm((current) => ({ ...current, [key]: value }));
  const toggleChannel = (channel: string) => update("channels", form.channels.includes(channel) ? form.channels.filter((item) => item !== channel) : [...form.channels, channel]);

  function nextStep(event: FormEvent) {
    event.preventDefault();
    if (!form.name.trim() || !form.phone.trim() || !form.wechat.trim() || !form.bio.trim()) {
      setError("请完整填写本页的必填信息。"); return;
    }
    if (!/^1\d{10}$/.test(form.phone.trim())) { setError("请输入正确的11位手机号。"); return; }
    setError(""); setStep(2); window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (!form.channels.length) { setError("请至少选择一个了解渠道。"); return; }
    if (form.channels.includes("其他") && !form.otherChannel.trim()) { setError("请填写其他渠道。"); return; }
    setSubmitting(true); setError("");
    try {
      const response = await fetch("/api/submissions", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const data = await response.json() as { error?: string };
      if (!response.ok) throw new Error(data.error || "提交失败，请稍后再试。");
      setStep(3); window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) { setError(err instanceof Error ? err.message : "提交失败，请稍后再试。"); }
    finally { setSubmitting(false); }
  }

  async function login(event: FormEvent) {
    event.preventDefault(); setAdminError("");
    const response = await fetch("/api/admin/login", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(credentials) });
    if (!response.ok) { setAdminError("用户名或密码不正确。"); return; }
    const listResponse = await fetch("/api/admin/submissions");
    const data = await listResponse.json() as { submissions?: Submission[]; error?: string };
    if (!listResponse.ok) { setAdminError(data.error || "暂时无法读取报名信息。"); return; }
    setSubmissions(data.submissions || []); setLoggedIn(true);
  }

  return (
    <main className="site-shell">
      <section className="hero" aria-label="信任圈研修营氛围图">
        <img src="/retreat.jpg" alt="阳光洒进安静的围坐研修空间" />
        <div className="hero-kicker">AUTUMN · 2026</div>
      </section>

      <div className="form-wrap">
        <section className="form-card">
          {step < 3 ? <>
            <p className="eyebrow">信任 · 连接 · 成长</p>
            <h1>2026秋季<br />信任圈研修营报名表</h1>
            <p className="intro">您好，欢迎报名本次研修营，请填写以下信息完成报名。</p>
            <div className="progress-row" aria-label={`第${step}步，共2步`}>
              <div className="progress-track"><div className="progress-fill" style={{ width: step === 1 ? "50%" : "100%" }} /></div>
              <span className="progress-label">{step} / 2</span>
            </div>
          </> : null}

          {step === 1 && <form onSubmit={nextStep}>
            <Field label="姓名"><input className="text-input" value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="请输入您的姓名" autoComplete="name" /></Field>
            <Field label="手机号"><input className="text-input" type="tel" inputMode="numeric" maxLength={11} value={form.phone} onChange={(e) => update("phone", e.target.value.replace(/\D/g, ""))} placeholder="请输入11位手机号" autoComplete="tel" /></Field>
            <Field label="微信号"><input className="text-input" value={form.wechat} onChange={(e) => update("wechat", e.target.value)} placeholder="请输入您的微信号" /></Field>
            <Field label="个人简介"><textarea className="text-area" value={form.bio} onChange={(e) => update("bio", e.target.value)} placeholder="简单介绍一下自己，让我们更好地认识您" /></Field>
            {error && <div className="error-box" role="alert">{error}</div>}
            <div className="form-actions"><button className="primary-btn" type="submit">下一步</button></div>
          </form>}

          {step === 2 && <form onSubmit={submit}>
            <Field label="您是通过什么渠道了解到本次研修营的？（可多选）">
              <div className="channels">
                {["微信公众号", "朋友圈/微信群", "朋友推荐", "其他"].map((channel) => <label className="check-card" key={channel}><input type="checkbox" checked={form.channels.includes(channel)} onChange={() => toggleChannel(channel)} />{channel}</label>)}
              </div>
              {form.channels.includes("其他") && <input className="text-input other-input" value={form.otherChannel} onChange={(e) => update("otherChannel", e.target.value)} placeholder="请填写其他渠道" autoFocus />}
            </Field>
            <Field label="您对本次研修营有什么期待或建议？" required={false}><textarea className="text-area" value={form.expectations} onChange={(e) => update("expectations", e.target.value)} placeholder="欢迎告诉我们您的期待" /></Field>
            <Field label="还有什么想对我们说的吗？" required={false}><textarea className="text-area" value={form.message} onChange={(e) => update("message", e.target.value)} placeholder="任何想说的话都可以写在这里" /></Field>
            {error && <div className="error-box" role="alert">{error}</div>}
            <div className="form-actions"><button className="secondary-btn" type="button" onClick={() => { setStep(1); setError(""); }}>上一步</button><button className="primary-btn" type="submit" disabled={submitting}>{submitting ? "正在提交…" : "提交报名"}</button></div>
          </form>}

          {step === 3 && <div className="success">
            <div className="success-mark">✓</div><h2>报名已提交</h2>
            <p>感谢您的填写，我们已经收到您的报名信息。</p>
            <div className="qr-wrap"><img src="/payment-qr.png" alt="研修营费用支付二维码" /></div>
            <p className="success-note">请尽快支付研修营费用，我们将尽快联系你！</p>
          </div>}
        </section>
      </div>

      <footer className="site-footer">© 2026 信任圈研修营 · <button className="admin-link" onClick={() => setAdminOpen(true)}>管理员登录</button></footer>

      {adminOpen && <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && setAdminOpen(false)}>
        {!loggedIn ? <form className="login-panel" onSubmit={login}>
          <h2>管理员登录</h2>
          <Field label="用户名"><input className="text-input" value={credentials.username} onChange={(e) => setCredentials({ ...credentials, username: e.target.value })} autoComplete="username" /></Field>
          <Field label="密码"><input className="text-input" type="password" value={credentials.password} onChange={(e) => setCredentials({ ...credentials, password: e.target.value })} autoComplete="current-password" /></Field>
          {adminError && <div className="error-box" role="alert">{adminError}</div>}
          <div className="login-actions"><button className="secondary-btn" type="button" onClick={() => setAdminOpen(false)}>取消</button><button className="primary-btn" type="submit">登录</button></div>
        </form> : <section className="admin-panel">
          <div className="admin-head"><div><h2>已报名人员</h2><p>共 {submissions.length} 条报名信息</p></div><button className="close-btn" onClick={() => setAdminOpen(false)} aria-label="关闭">×</button></div>
          {submissions.length ? <div className="table-wrap"><table className="admin-table"><thead><tr><th>提交时间</th><th>姓名</th><th>手机号</th><th>微信号</th><th>个人简介</th><th>了解渠道</th><th>期待或建议</th><th>想说的话</th></tr></thead><tbody>{submissions.map((item) => <tr key={item.id}><td>{formatTime(item.createdAt)}</td><td>{item.name}</td><td>{item.phone}</td><td>{item.wechat}</td><td>{item.bio}</td><td>{[item.channels, item.otherChannel].filter(Boolean).join("；")}</td><td>{item.expectations || "—"}</td><td>{item.message || "—"}</td></tr>)}</tbody></table></div> : <div className="empty-state">还没有人提交报名。</div>}
        </section>}
      </div>}
    </main>
  );
}

function Field({ label, required = true, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return <div className="field"><label className="field-label">{label}{required && <span className="required">*</span>}</label>{children}</div>;
}

function formatTime(value: string) {
  const normalized = value.includes("T") ? value : `${value.replace(" ", "T")}Z`;
  return new Intl.DateTimeFormat("zh-CN", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Shanghai" }).format(new Date(normalized));
}
