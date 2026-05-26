"use client";

import ThemeToggle from "./ThemeToggle";
import { Clinic, ClinicUser } from "../app/mockData";

interface DashboardHeaderProps {
  currentUser: ClinicUser;
  currentClinic: Clinic;
  theme: "light" | "dark";
  setTheme: (theme: "light" | "dark") => void;
  onLogout: () => void;
}

export default function DashboardHeader({
  currentUser,
  currentClinic,
  theme,
  setTheme,
  onLogout,
}: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-10 bg-brand-paper/90 dark:bg-brand-dark-paper/90 backdrop-blur-md border-b border-brand-border dark:border-brand-dark-border px-4 sm:px-6 py-4 transition-colors duration-200">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white dark:bg-slate-900 border border-brand-border dark:border-brand-dark-border shadow-sm overflow-hidden p-1.5">
            <img src="/logo.png" alt="Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <h1 className="text-lg sm:text-xl font-bold text-primary dark:text-secondary-light leading-tight">Mediador Clínico</h1>
            <p className="text-[10px] sm:text-xs text-brand-text/60 dark:text-brand-dark-text/60 font-medium">TCC - Centralizador de Registros de Exames e Diagnósticos</p>
          </div>
        </div>

        {/* Connected User Profile & Theme Toggler */}
        <div className="flex items-center justify-between sm:justify-end w-full sm:w-auto gap-4 border-t sm:border-t-0 border-brand-border dark:border-brand-dark-border pt-3 sm:pt-0">
          <div className="flex items-center gap-2">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <button
              onClick={onLogout}
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border dark:border-brand-dark-border text-brand-text/75 dark:text-brand-dark-text/75 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-200"
              title="Sair do Sistema"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
              </svg>
            </button>
          </div>
          
          <div className="text-right">
            <p className="text-xs sm:text-sm font-semibold text-brand-text dark:text-brand-dark-text">{currentUser.name}</p>
            <p className="text-[10px] sm:text-xs text-brand-text/70 dark:text-brand-dark-text/70 leading-normal">
              {currentUser.role} • <span className="font-bold">{currentClinic.name} ({currentClinic.id})</span>
            </p>
            <div className="mt-1 flex items-center justify-end gap-1.5">
              <span className={`inline-block h-2 w-2 rounded-full ${currentClinic.type === "internal" ? "bg-green-500" : "bg-blue-500"}`}></span>
              <span className="text-[9px] font-bold uppercase tracking-wider text-brand-text/60 dark:text-brand-dark-text/60">
                {currentClinic.type === "internal" ? "Clínica Integrada" : "Clínica Parceira (HL7)"}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
