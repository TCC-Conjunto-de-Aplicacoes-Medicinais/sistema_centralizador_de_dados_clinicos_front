"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import type { Clinic, ClinicUser } from "../types/clinical";
import { loginClinic } from "../services/api";

interface LoginViewProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  onLoginSuccess: (user: ClinicUser, clinic: Clinic, token: string) => void;
}

export default function LoginView({ theme, setTheme, onLoginSuccess }: LoginViewProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    try {
      const res = await loginClinic(email, password);
      onLoginSuccess(res.user, res.clinic, res.token);
    } catch (err: unknown) {
      setAuthError(err instanceof Error ? err.message : "Erro desconhecido ao autenticar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={theme === "dark" ? "dark bg-brand-dark-bg text-brand-dark-text min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200" : "bg-brand-bg text-brand-text min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200"}>
      <div className="absolute top-4 right-4">
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>

      <div className="w-full max-w-lg space-y-6 bg-brand-paper dark:bg-brand-dark-paper p-6 sm:p-8 rounded-2xl border border-brand-border dark:border-brand-dark-border shadow-xl">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-brand-border dark:border-brand-dark-border shadow-md overflow-hidden p-2">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <h2 className="mt-4 text-center text-2xl sm:text-3xl font-bold tracking-tight text-primary dark:text-secondary-light">
            Mediador Clínico POHINC
          </h2>
          <p className="mt-1 text-center text-xs sm:text-sm text-brand-text/60 dark:text-brand-dark-text/60">
            Barramento Centralizador de Interoperabilidade em Saúde
          </p>
        </div>

        {authError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
            <p className="font-semibold">{authError}</p>
          </div>
        )}

        <form className="space-y-4" onSubmit={handleLogin}>
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                E-mail do Profissional
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="profissional@clinica.com.br"
                autoComplete="username"
                className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent px-4 py-2 text-sm text-brand-text dark:text-brand-dark-text focus:border-primary focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent px-4 py-2 text-sm text-brand-text dark:text-brand-dark-text focus:border-primary focus:outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Entrando...</span>
              </>
            ) : (
              <span>Entrar</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
