"use client";

import { Patient } from "../app/mockData";

interface PatientSearchProps {
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: Patient[];
  selectedPatient: Patient | null;
  setSelectedPatient: (p: Patient | null) => void;
  onClear: () => void;
  onSearch: (e: React.FormEvent) => void;
}

export default function PatientSearch({
  searchQuery,
  setSearchQuery,
  searchResults,
  selectedPatient,
  setSelectedPatient,
  onClear,
  onSearch,
}: PatientSearchProps) {
  return (
    <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-brand-text dark:text-brand-dark-text flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary dark:text-secondary-light">
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
        Buscar Paciente
      </h2>

      <form onSubmit={onSearch} className="space-y-3">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Nome ou CPF"
            className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent pl-4 pr-10 py-2 text-sm text-brand-text dark:text-brand-dark-text placeholder-slate-400 focus:border-primary focus:outline-none transition"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3 top-2.5 text-brand-text/40 dark:text-brand-dark-text/40 hover:text-brand-text dark:hover:text-brand-dark-text"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
              </svg>
            </button>
          )}
        </div>
        <button
          type="submit"
          className="w-full rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-2 transition"
        >
          Buscar Prontuário
        </button>
      </form>

      {/* Results list */}
      {searchResults.length > 0 && (
        <div className="space-y-2 pt-2 border-t border-brand-border dark:border-brand-dark-border">
          <p className="text-[11px] font-bold uppercase tracking-wider text-brand-text/50 dark:text-brand-dark-text/50">
            Resultados da Busca ({searchResults.length})
          </p>
          <div className="space-y-1">
            {searchResults.map((patient) => (
              <button
                key={patient.id}
                onClick={() => setSelectedPatient(patient)}
                className={`w-full text-left p-2.5 rounded-lg border transition ${
                  selectedPatient?.id === patient.id
                    ? "bg-primary/5 dark:bg-primary-dark/20 border-primary dark:border-secondary-light text-brand-text dark:text-brand-dark-text"
                    : "bg-brand-bg/50 dark:bg-brand-dark-bg/50 border-brand-border dark:border-brand-dark-border text-brand-text/80 dark:text-brand-dark-text/80 hover:bg-brand-bg dark:hover:bg-brand-dark-bg"
                }`}
              >
                <p className="text-xs font-bold">{patient.name}</p>
                <div className="flex items-center justify-between mt-0.5 text-[10px] text-brand-text/60 dark:text-brand-dark-text/60">
                  <span>CPF: {patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</span>
                  <span>Nasc: {new Date(patient.birthDate).toLocaleDateString("pt-BR")}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
