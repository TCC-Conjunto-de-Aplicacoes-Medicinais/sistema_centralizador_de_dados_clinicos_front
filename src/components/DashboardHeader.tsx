"use client";

import React from "react";
import ThemeToggle from "./ThemeToggle";
import type { Clinic, ClinicUser } from "../types/clinical";

interface DashboardHeaderProps {
  currentUser: ClinicUser;
  currentClinic: Clinic;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  onLogout: () => void;
}

export default function DashboardHeader({ currentUser, currentClinic, theme, setTheme, onLogout }: DashboardHeaderProps) {
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

        {/* Usuário logado e ações */}
        <div className="flex items-center justify-between md:justify-end w-full md:w-auto gap-2.5">
          <div className="flex flex-col text-right">
            <span className="text-xs font-bold text-brand-text dark:text-brand-dark-text truncate max-w-[190px]">{currentUser.name}</span>
            <span className="text-[10px] text-brand-text/60 dark:text-brand-dark-text/60 truncate max-w-[190px]">{currentClinic.name}</span>
          </div>

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
