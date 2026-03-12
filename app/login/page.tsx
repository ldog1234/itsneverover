"use client";

import { useState } from "react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });

        if (error) throw error;

        setMessage("Account created. Check your email if confirmation is enabled.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        router.push("/dashboard");
        router.refresh();
      }
    } catch (error: any) {
      setMessage(error.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="authPage">
      <div className="authShell">
        <div className="authLeft card">
          <div className="authBadge">GlowUp AI</div>

          <h1 className="authHeroTitle">
            Build your glow-up tracker, routines, and AI reports in one place
          </h1>

          <p className="authHeroText">
            Get appearance reports, track progress over time, and generate
            better self-improvement routines without the toxic forum vibe.
          </p>

          <div className="authFeatureList">
            <div className="authFeatureItem">
              <span className="authDot" />
              <span>AI appearance reports</span>
            </div>
            <div className="authFeatureItem">
              <span className="authDot" />
              <span>Glow-up tracker with score changes</span>
            </div>
            <div className="authFeatureItem">
              <span className="authDot" />
              <span>Routine builder and future premium tools</span>
            </div>
          </div>
        </div>

        <div className="authRight card">
          <div className="authTabs">
            <button
              type="button"
              className={`authTab ${mode === "login" ? "authTabActive" : ""}`}
              onClick={() => setMode("login")}
            >
              Login
            </button>

            <button
              type="button"
              className={`authTab ${mode === "signup" ? "authTabActive" : ""}`}
              onClick={() => setMode("signup")}
            >
              Sign Up
            </button>
          </div>

          <h2 className="authFormTitle">
            {mode === "login" ? "Welcome back" : "Create your account"}
          </h2>

          <p className="mutedText authFormSubtext">
            {mode === "login"
              ? "Log in to view your tracker and saved reports."
              : "Start saving analyses and building your progress history."}
          </p>

          <form onSubmit={handleSubmit} className="authForm">
            <label className="label">Email</label>
            <input
              className="textInput"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <label className="label">Password</label>
            <input
              className="textInput"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            <button className="primaryButton authSubmitButton" type="submit" disabled={loading}>
              {loading
                ? "Please wait..."
                : mode === "login"
                ? "Login"
                : "Create Account"}
            </button>
          </form>

          {message ? <p className="authMessage mutedText">{message}</p> : null}
        </div>
      </div>
    </main>
  );
}