import { useEffect, useState } from "react";
import { Button } from "./Button";

export function AuthDialog({ mode, open, onClose, onSubmit, error = "", busy = false }) {
  const [form, setForm] = useState({ username: "", email: "", password: "", password_confirmation: "", date_of_birth: "" });
  useEffect(() => {
    if (open) setForm({ username: "", email: "", password: "", password_confirmation: "", date_of_birth: "" });
  }, [open, mode]);
  if (!open) return null;

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="auth-title">
        <h2 id="auth-title">{mode === "register" ? "Create account" : "Welcome back"}</h2>
        <p className="modal-copy">{mode === "register" ? "Start your personal game diary." : "Continue your saved journey."}</p>
        <form className="form-grid" onSubmit={(event) => { event.preventDefault(); onSubmit(form); }}>
          {mode === "register" && <label className="field">Username<input required minLength="3" value={form.username} onChange={(event) => update("username", event.target.value)} /></label>}
          <label className="field">Email<input required type="email" value={form.email} onChange={(event) => update("email", event.target.value)} /></label>
          <label className="field">Password<input required minLength="8" type="password" value={form.password} onChange={(event) => update("password", event.target.value)} /></label>
          {mode === "register" && <label className="field">Confirm password<input required minLength="8" type="password" value={form.password_confirmation} onChange={(event) => update("password_confirmation", event.target.value)} /></label>}
          {error && <div className="form-error" role="alert">{error}</div>}
          <div className="modal-actions"><Button type="button" variant="ghost" onClick={onClose}>Cancel</Button><Button type="submit" disabled={busy}>{busy ? "Please wait…" : mode === "register" ? "Register" : "Log in"}</Button></div>
        </form>
      </section>
    </div>
  );
}
