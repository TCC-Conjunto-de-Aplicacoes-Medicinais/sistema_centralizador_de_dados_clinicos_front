"use client";

import { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Clinic, ClinicUser, mockDemoRoles } from "../app/mockData";
import { isDemoMode, setDemoMode, loginClinic, getApiBaseUrl, setApiBaseUrl } from "../services/api";

interface LoginViewProps {
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  onLoginSuccess: (user: ClinicUser, clinic: Clinic, token: string) => void;
}

export default function LoginView({ theme, setTheme, onLoginSuccess }: LoginViewProps) {
  const [demoActive, setDemoActive] = useState(isDemoMode());
  const [clinicCode, setClinicCode] = useState("CLI-1001");
  const [email, setEmail] = useState("roberto.silva@vida.com.br");
  const [password, setPassword] = useState("senha123");
  const [authError, setAuthError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showApiConfig, setShowApiConfig] = useState(false);
  const [backendUrl, setBackendUrl] = useState(getApiBaseUrl());

  const handleToggleMode = (enableDemo: boolean) => {
    setDemoActive(enableDemo);
    setDemoMode(enableDemo);
    setAuthError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setIsSubmitting(true);

    try {
      setApiBaseUrl(backendUrl);
      const res = await loginClinic(clinicCode, email, password);
      onLoginSuccess(res.user, res.clinic, res.token);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido ao autenticar.";
      setAuthError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemoLogin = (role: typeof mockDemoRoles[0]) => {
    setDemoMode(true);
    setDemoActive(true);
    const dummyToken = `mock-token-${role.clinic.id}-${role.user.email}-${Date.now()}`;
    onLoginSuccess(role.user, role.clinic, dummyToken);
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

        {/* Alternador de Modo: Apresentação TCC (Mock) vs API Go Real */}
        <div className="bg-brand-bg dark:bg-brand-dark-bg p-1 rounded-xl border border-brand-border dark:border-brand-dark-border grid grid-cols-2 gap-1 text-xs">
          <button
            type="button"
            onClick={() => handleToggleMode(true)}
            className={`py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              demoActive
                ? "bg-emerald-600 text-white shadow-xs"
                : "text-brand-text/60 hover:text-brand-text"
            }`}
          >
            <span>🧪</span>
            <span>Apresentação TCC (Mock)</span>
          </button>
          <button
            type="button"
            onClick={() => handleToggleMode(false)}
            className={`py-2 px-3 rounded-lg font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              !demoActive
                ? "bg-blue-600 text-white shadow-xs"
                : "text-brand-text/60 hover:text-brand-text"
            }`}
          >
            <span>🔌</span>
            <span>API Go Real (:8002)</span>
          </button>
        </div>

        {authError && (
          <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 space-y-2">
            <p className="font-semibold">{authError}</p>
            {!demoActive && (
              <button
                type="button"
                onClick={() => handleToggleMode(true)}
                className="text-xs font-bold underline hover:no-underline text-red-700 dark:text-red-300 block"
              >
                Alternar para o Modo Apresentação TCC (Mock) com 1 clique →
              </button>
            )}
          </div>
        )}

        {/* Conteúdo do Modo Apresentação TCC */}
        {demoActive ? (
          <div className="space-y-4 animate-fadeIn">
            <div className="p-3 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/20 rounded-xl text-xs space-y-1">
              <p className="font-bold text-emerald-800 dark:text-emerald-300">
                Modo Demonstração / Banca Avaliadora Ativo
              </p>
              <p className="text-brand-text/70 dark:text-brand-dark-text/70 text-[11px] leading-relaxed">
                Este modo carrega os cenários clínicos completos de teste (paciente Maria Oliveira Souza, ECG em papel milimetrado, comparador side-by-side e farmacovigilância cruzada) sem necessitar de banco de dados ou infraestrutura externa.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-xs font-bold uppercase tracking-wider text-brand-text/60 dark:text-brand-dark-text/60">
                Selecione um Perfil para Acessar Diretamente:
              </p>
              <div className="grid grid-cols-1 gap-2">
                {mockDemoRoles.map((role) => (
                  <button
                    key={role.user.email}
                    type="button"
                    onClick={() => handleQuickDemoLogin(role)}
                    className="flex items-center justify-between p-3 rounded-xl border border-brand-border dark:border-brand-dark-border bg-brand-paper dark:bg-brand-dark-paper hover:bg-brand-bg dark:hover:bg-brand-dark-bg transition cursor-pointer text-left shadow-xs hover:shadow"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl">
                        {role.user.systemRole === "doctor" ? "🩺" : role.user.systemRole === "clinic_admin" ? "🏥" : "⚖️"}
                      </span>
                      <div>
                        <p className="font-bold text-xs text-brand-text dark:text-brand-dark-text">{role.user.name}</p>
                        <p className="text-[10px] text-brand-text/60 dark:text-brand-dark-text/60">{role.badge} • {role.clinic.name}</p>
                      </div>
                    </div>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs">Entrar →</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          /* Conteúdo do Modo API Go Conectada */
          <form className="space-y-4 animate-fadeIn" onSubmit={handleLogin}>
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
                  className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent px-4 py-2 text-sm text-brand-text dark:text-brand-dark-text focus:border-primary focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                  E-mail do Profissional
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="medico@clinica.com.br"
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
                  className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent px-4 py-2 text-sm text-brand-text dark:text-brand-dark-text focus:border-primary focus:outline-none transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-sm transition cursor-pointer"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Conectando à API Go...</span>
                </>
              ) : (
                <span>Autenticar via API Go (:8002)</span>
              )}
            </button>

            <div className="pt-2 border-t border-brand-border dark:border-brand-dark-border text-center">
              <button
                type="button"
                onClick={() => setShowApiConfig(!showApiConfig)}
                className="text-xs text-brand-text/50 hover:text-brand-text transition"
              >
                {showApiConfig ? "Ocultar URL da API" : "⚙️ Configurar Endpoint da API"}
              </button>
              {showApiConfig && (
                <div className="mt-2 text-left space-y-1 p-2.5 rounded-lg bg-brand-bg dark:bg-brand-dark-bg border border-brand-border dark:border-brand-dark-border">
                  <label className="text-[10px] uppercase font-bold text-brand-text/60">URL Base da API Go</label>
                  <input
                    type="text"
                    value={backendUrl}
                    onChange={(e) => setBackendUrl(e.target.value)}
                    className="w-full text-xs font-mono p-1.5 rounded border border-brand-border bg-transparent"
                  />
                </div>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
