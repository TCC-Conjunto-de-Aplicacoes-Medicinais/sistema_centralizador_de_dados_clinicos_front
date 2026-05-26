"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Clinic, ClinicUser, mockClinics, mockClinicUsers } from "../app/mockData";

interface LoginViewProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  onLoginSuccess: (user: ClinicUser, clinic: Clinic, token: string) => void;
}

export default function LoginView({ theme, setTheme, onLoginSuccess }: LoginViewProps) {
  const [clinicCode, setClinicCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [backendUrl, setBackendUrl] = useState("http://localhost:8002");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const matchedUser = mockClinicUsers.find(
      (u) =>
        u.clinicId.toLowerCase() === clinicCode.trim().toLowerCase() &&
        u.email.toLowerCase() === email.trim().toLowerCase() &&
        u.passwordHash === password
    );

    if (matchedUser) {
      const matchedClinic = mockClinics.find(
        (c) => c.id.toLowerCase() === clinicCode.trim().toLowerCase()
      ) || {
        id: clinicCode.trim().toUpperCase(),
        name: "Clínica Requisitante Demo",
        type: "internal" as const,
      };

      const dummyToken = `mock-token-${matchedClinic.id}-${matchedUser.email}-${Date.now()}`;
      onLoginSuccess(matchedUser, matchedClinic, dummyToken);
    } else {
      setAuthError("Credenciais inválidas. Verifique o código da clínica, e-mail e senha.");
    }
  };

  return (
    <div className={theme === "dark" ? "dark bg-brand-dark-bg text-brand-dark-text min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200" : "bg-brand-bg text-brand-text min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200"}>
      <div className="absolute top-4 right-4">
        <ThemeToggle theme={theme} setTheme={setTheme} />
      </div>
      <div className="w-full max-w-md space-y-6 bg-brand-paper dark:bg-brand-dark-paper p-8 rounded-2xl border border-brand-border dark:border-brand-dark-border shadow-xl hover-scale">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-white dark:bg-slate-900 border border-brand-border dark:border-brand-dark-border shadow-md overflow-hidden p-2">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary dark:text-secondary-light">
            Mediador Clínico
          </h2>
          <p className="mt-2 text-center text-sm text-brand-text/60 dark:text-brand-dark-text/60">
            Centralizador de Dados do Prontuário Unificado
          </p>
        </div>

        <form className="space-y-4" onSubmit={handleLogin}>
          {authError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                Código da Clínica (Ex: CLI-1001)
              </label>
              <input
                type="text"
                required
                value={clinicCode}
                onChange={(e) => setClinicCode(e.target.value)}
                placeholder="CLI-XXXX"
                className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent px-4 py-2 text-brand-text dark:text-brand-dark-text placeholder-slate-400 dark:placeholder-slate-600 focus:border-primary dark:focus:border-secondary focus:outline-none transition"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                E-mail de Acesso
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="nome@clinica.com.br"
                className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent px-4 py-2 text-brand-text dark:text-brand-dark-text placeholder-slate-400 dark:placeholder-slate-600 focus:border-primary dark:focus:border-secondary focus:outline-none transition"
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
                className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent px-4 py-2 text-brand-text dark:text-brand-dark-text placeholder-slate-400 dark:placeholder-slate-600 focus:border-primary dark:focus:border-secondary focus:outline-none transition"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary py-2.5 px-4 text-sm font-semibold text-white shadow-md focus:outline-none hover:shadow-lg transition-all duration-200"
            >
              Autenticar no Mediador (Modo Simulação)
            </button>
          </div>

          <div className="pt-2 border-t border-brand-border dark:border-brand-dark-border">
            <button
              type="button"
              onClick={() => setShowApiConfig(!showApiConfig)}
              className="text-xs text-brand-text/50 dark:text-brand-dark-text/50 hover:text-brand-text flex items-center justify-center w-full gap-1 focus:outline-none py-1 transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h1.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.43l-1.003.828c-.293.241-.438.613-.43.992a7.723 7.723 0 010 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-1.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.43l1.004-.827c.292-.24.437-.613.43-.991a6.936 6.936 0 010-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {showApiConfig ? "Ocultar Configurações (Apenas Visual)" : "Configurar Endereço da API"}
            </button>
            {showApiConfig && (
              <div className="mt-2 space-y-2 p-3 bg-brand-bg/50 dark:bg-brand-dark-bg/50 rounded-lg border border-brand-border dark:border-brand-dark-border animate-fadeIn">
                <label className="block text-[10px] font-bold uppercase tracking-wider text-brand-text/70 dark:text-brand-dark-text/70">
                  Endpoint do Backend Centralizador (Desativado)
                </label>
                <input
                  type="text"
                  disabled
                  value={backendUrl}
                  onChange={(e) => setBackendUrl(e.target.value)}
                  placeholder="http://localhost:8002"
                  className="w-full rounded border border-brand-border dark:border-brand-dark-border bg-brand-bg dark:bg-brand-dark-bg px-2.5 py-1.5 text-xs text-brand-text/50 dark:text-brand-dark-text/50 focus:outline-none cursor-not-allowed"
                />
                <p className="text-[9px] text-brand-text/50 dark:text-brand-dark-text/50 leading-relaxed text-center">
                  O sistema está em modo local/mock. As conexões de rede externa foram desabilitadas por segurança.
                </p>
              </div>
            )}
          </div>
          
          <div className="text-center text-xs text-brand-text/50 dark:text-brand-dark-text/50 pt-2 border-t border-brand-border dark:border-brand-dark-border">
            <p>Demo Logins (Código | E-mail | Senha: senha123):</p>
            <p className="font-mono mt-1 leading-relaxed">
              CLI-1001 | roberto.silva@vida.com.br (Integrada)<br />
              CLI-3003 | ana.paula@cardiocentro.com.br (Parceira)
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
