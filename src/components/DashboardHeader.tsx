"use client";

import React, { useState } from "react";
import ThemeToggle from "./ThemeToggle";
import { Clinic, ClinicUser, mockDemoRoles } from "../app/mockData";

interface DashboardHeaderProps {
  currentUser: ClinicUser;
  currentClinic: Clinic;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  isDemo?: boolean;
  onToggleDemo?: () => void;
  onRoleSwitch: (user: ClinicUser, clinic: Clinic) => void;
  onOpenQuickAccess: () => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  currentUser,
  currentClinic,
  theme,
  setTheme,
  isDemo = true,
  onToggleDemo,
  onRoleSwitch,
  onOpenQuickAccess,
  onLogout,
}: DashboardHeaderProps) {
  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-brand-paper/95 dark:bg-brand-dark-paper/95 backdrop-blur-md border-b border-brand-border dark:border-brand-dark-border px-4 sm:px-6 py-3 transition-colors duration-200 shadow-xs">
      <div className="w-full max-w-[1720px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Platform Identity */}
        <div className="flex items-center justify-between w-full md:w-auto gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-white font-black text-lg shadow-sm border border-emerald-400/20">
              P
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-primary dark:text-secondary-light tracking-tight leading-tight">
                  POHINC Mediador Clínico
                </h1>
                <span className="text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Open Health
                </span>
              </div>
              <p className="text-[10px] text-brand-text/60 dark:text-brand-dark-text/60 font-medium">
                Barramento Centralizador de Interoperabilidade e Dados Clínicos
              </p>
            </div>
          </div>

          {/* Mobile Right Controls */}
          <div className="flex items-center gap-2 md:hidden">
            <ThemeToggle theme={theme} setTheme={setTheme} />
          </div>
        </div>

        {/* User Context, Role Switcher & Actions */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2.5">
          {/* Badge de Modo Ativo (Apresentação Mock vs API Real) */}
          <button
            type="button"
            onClick={onToggleDemo}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-bg/60 dark:bg-brand-dark-bg/60 text-[11px] font-bold cursor-pointer hover:bg-brand-bg dark:hover:bg-brand-dark-bg transition"
            title="Alternar entre Modo Apresentação TCC (Mock) e Conexão à API Go (:8002)"
          >
            <span className={`h-2 w-2 rounded-full ${isDemo ? "bg-emerald-500 animate-pulse" : "bg-blue-500"}`}></span>
            <span className={`${isDemo ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300"} font-bold hidden sm:inline`}>
              {isDemo ? "🧪 Modo Apresentação TCC" : "🔌 Conectado API Go (:8002)"}
            </span>
            <span className={`${isDemo ? "text-emerald-700 dark:text-emerald-300" : "text-blue-700 dark:text-blue-300"} font-bold sm:hidden`}>
              {isDemo ? "Mock" : "API"}
            </span>
          </button>

          {/* Botão de Recepção / Acesso Rápido */}
          <button
            onClick={onOpenQuickAccess}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 rounded-lg text-xs transition shadow-sm cursor-pointer"
            title="Validar código temporário (OTP) emitido pelo App móvel"
          >
            <span>📱</span>
            <span className="hidden sm:inline">Acesso Rápido (Recepção)</span>
            <span className="sm:hidden">OTP</span>
          </button>

          {/* Seletor Dinâmico de Papel (Demo Mode) */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-paper dark:bg-brand-dark-paper hover:bg-brand-bg dark:hover:bg-brand-dark-bg text-left transition cursor-pointer text-xs"
              title="Alternar perfil para demonstrar permissões clínicas"
            >
              <div className="flex flex-col">
                <span className="text-[9px] font-extrabold uppercase text-primary dark:text-secondary-light tracking-wider">
                  Perfil de Demonstração
                </span>
                <span className="font-bold text-brand-text dark:text-brand-dark-text truncate max-w-[150px] sm:max-w-[190px]">
                  {currentUser.name}
                </span>
              </div>
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-brand-text/50">
                <path fillRule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clipRule="evenodd" />
              </svg>
            </button>

            {/* Dropdown de Papéis */}
            {roleDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 rounded-xl bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border shadow-xl p-2 z-50 animate-fadeIn space-y-1">
                <p className="text-[10px] font-bold text-brand-text/50 dark:text-brand-dark-text/50 px-2 py-1 uppercase">
                  Selecione a Visão da Plataforma:
                </p>
                {mockDemoRoles.map((role) => (
                  <button
                    key={role.user.email}
                    onClick={() => {
                      onRoleSwitch(role.user, role.clinic);
                      setRoleDropdownOpen(false);
                    }}
                    className={`w-full text-left p-2 rounded-lg transition flex flex-col cursor-pointer ${
                      currentUser.email === role.user.email
                        ? "bg-primary/10 dark:bg-secondary/15 border border-primary/20 text-primary dark:text-secondary-light"
                        : "hover:bg-brand-bg dark:hover:bg-brand-dark-bg text-brand-text dark:text-brand-dark-text"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs">{role.label}</span>
                      <span className="text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded bg-brand-bg dark:bg-brand-dark-bg">
                        {role.badge}
                      </span>
                    </div>
                    <span className="text-[10px] text-brand-text/60 dark:text-brand-dark-text/60">
                      {role.clinic.name} ({role.clinic.id})
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Theme Toggle e Logout no Desktop */}
          <div className="hidden md:flex items-center gap-2">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <button
              onClick={onLogout}
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-brand-border dark:border-brand-dark-border text-brand-text/70 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/30 transition cursor-pointer"
              title="Sair da Sessão"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
