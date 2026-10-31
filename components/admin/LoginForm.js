"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

/** Only same-site admin paths are allowed as a post-login destination. */
const safeNext = (value) => (typeof value === "string" && /^\/admin(\/|$|\?)/.test(value) ? value : "/admin");

export default function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [password, setPassword] = useState("");
  const [state, setState] = useState({ status: "idle" });

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!password) {
      setState({ status: "error", message: "Unesite lozinku." });
      return;
    }
    setState({ status: "sending" });
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setState({ status: "error", message: data.error || "Prijava nije uspela." });
        return;
      }
      router.replace(safeNext(searchParams.get("next")));
      router.refresh();
    } catch {
      setState({ status: "error", message: "Nema veze sa serverom." });
    }
  };

  return (
    <form className="mt-6 grid gap-4" onSubmit={handleSubmit} noValidate>
      <div className="field">
        <label htmlFor="password" className="label">
          Lozinka
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          className="input"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          aria-invalid={state.status === "error" ? true : undefined}
          aria-describedby={state.status === "error" ? "login-error" : undefined}
          autoFocus
        />
      </div>
      {state.status === "error" ? (
        <p id="login-error" className="notice notice-error" role="alert">
          {state.message}
        </p>
      ) : null}
      <button type="submit" className="btn btn-primary" disabled={state.status === "sending"}>
        {state.status === "sending" ? "Prijavljivanje…" : "Prijavite se"}
      </button>
    </form>
  );
}
