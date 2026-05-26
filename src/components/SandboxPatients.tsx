"use client";

import { Patient } from "../app/mockData";

interface SandboxPatientsProps {
  mockPatients: Patient[];
  onFill: (cpf: string) => void;
  onInstantExport: (patient: Patient) => void;
}

export default function SandboxPatients({
  mockPatients,
  onFill,
  onInstantExport,
}: SandboxPatientsProps) {
  return (
    <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary dark:text-secondary-light">
          <path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 002 4.5v11A2.5 2.5 0 004.5 18h11a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0015.5 2h-11zM4.337 9.17a.75.75 0 011.06 0L8.5 12.273l6.103-6.103a.75.75 0 111.06 1.06l-6.633 6.634a.75.75 0 01-1.06 0L4.337 10.23a.75.75 0 010-1.06z" clipRule="evenodd" />
        </svg>
        <h2 className="text-sm font-bold uppercase tracking-wider text-brand-text dark:text-brand-dark-text">Base de Pacientes (Sandbox)</h2>
      </div>
      <p className="text-[11px] text-brand-text/60 dark:text-brand-dark-text/60">
        Banco de simulação. Clique em <strong className="text-primary dark:text-secondary-light">Preencher</strong> para buscar, ou <strong className="text-blue-600 dark:text-blue-400">HL7</strong> para baixar o JSON modelo.
      </p>

      <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
        {mockPatients.map((patient) => (
          <div
            key={patient.id}
            className="p-3 rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-bg/25 dark:bg-brand-dark-bg/25 space-y-2 hover:border-slate-300 dark:hover:border-brand-dark-border transition"
          >
            <div className="flex items-start justify-between gap-1">
              <div>
                <h4 className="text-xs font-bold text-brand-text dark:text-brand-dark-text">{patient.name}</h4>
                <p className="text-[10px] text-brand-text/50 dark:text-brand-dark-text/50 font-mono">
                  CPF: {patient.cpf}
                </p>
              </div>
              <span className="bg-primary/10 dark:bg-secondary/15 text-primary-dark dark:text-secondary-light text-[9px] font-bold px-1.5 py-0.5 rounded font-mono" title="Token OTP Ativo">
                OTP: {patient.otpToken}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => onFill(patient.cpf)}
                className="flex-1 text-center bg-brand-paper dark:bg-brand-dark-paper hover:bg-slate-50 dark:hover:bg-brand-dark-border border border-brand-border dark:border-brand-dark-border text-brand-text dark:text-brand-dark-text text-[10px] py-1 rounded font-semibold transition"
              >
                Preencher
              </button>
              <button
                onClick={() => onInstantExport(patient)}
                className="flex-1 text-center bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] py-1 rounded font-semibold transition"
                title="Exportar exemplo HL7 FHIR deste paciente"
              >
                Exportar HL7
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
