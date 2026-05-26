"use client";

import { useState } from "react";
import { Patient, Clinic, ClinicUser, AuditLog, AuthorizedHistory, generateHL7FHIRBundle } from "../app/mockData";

interface PatientRequestPanelProps {
  selectedPatient: Patient | null;
  currentClinic: Clinic;
  currentUser: ClinicUser;
  onAuthorizationSuccess: (history: AuthorizedHistory, newLog: AuditLog) => void;
}

export default function PatientRequestPanel({
  selectedPatient,
  currentClinic,
  currentUser,
  onAuthorizationSuccess,
}: PatientRequestPanelProps) {
  const [authMethod, setAuthMethod] = useState<"token" | "break_the_glass">("token");
  const [otpCode, setOtpCode] = useState("");
  const [justification, setJustification] = useState("");
  const [requesterName, setRequesterName] = useState(currentUser.name);
  const [requesterRole, setRequesterRole] = useState(currentUser.role);
  const [requestError, setRequestError] = useState("");

  // Sync requester details when currentUser changes (during rendering)
  const [prevUser, setPrevUser] = useState(currentUser);
  if (currentUser !== prevUser) {
    setPrevUser(currentUser);
    setRequesterName(currentUser.name);
    setRequesterRole(currentUser.role);
  }

  if (!selectedPatient) {
    return (
      <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center text-brand-text/40 dark:text-brand-dark-text/40">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
          </svg>
          <p className="text-sm font-semibold">Nenhum paciente selecionado</p>
          <p className="text-xs">Busque no painel lateral ou use um registro da Sandbox de demonstração.</p>
        </div>
      </div>
    );
  }

  const handleRequestData = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError("");

    if (authMethod === "token") {
      if (otpCode !== selectedPatient.otpToken) {
        setRequestError("Código de Autorização (OTP) inválido para este paciente.");
        return;
      }
    }

    const hl7Str = generateHL7FHIRBundle(selectedPatient);
    const timestamp = new Date().toISOString();

    const newHistory: AuthorizedHistory = {
      patient: selectedPatient,
      method: authMethod,
      justification: authMethod === "break_the_glass" ? justification : undefined,
      requesterName: authMethod === "break_the_glass" ? requesterName : currentUser.name,
      requesterRole: authMethod === "break_the_glass" ? requesterRole : currentUser.role,
      hl7Bundle: hl7Str,
      timestamp: timestamp,
    };

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      clinicName: currentClinic.name,
      requesterEmail: currentUser.email,
      patientName: selectedPatient.name,
      authMethod: authMethod,
      requestType: currentClinic.type === "partner" ? "hl7_download" : "direct",
      justification: authMethod === "break_the_glass" ? justification : undefined,
      timestamp: timestamp,
    };

    onAuthorizationSuccess(newHistory, newLog);
    
    // Reset forms
    setOtpCode("");
    setJustification("");
  };

  return (
    <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm">
      <div className="space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border dark:border-brand-dark-border pb-4 gap-2">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 dark:bg-secondary/15 text-primary-dark dark:text-secondary-light px-2 py-0.5 rounded-full">
              Paciente Selecionado
            </span>
            <h3 className="text-xl font-extrabold text-brand-text dark:text-brand-dark-text mt-1">{selectedPatient.name}</h3>
          </div>
          <div className="text-xs text-brand-text/60 dark:text-brand-dark-text/60 space-y-0.5 sm:text-right">
            <p>CPF: <span className="font-semibold text-brand-text dark:text-brand-dark-text">{selectedPatient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</span></p>
            <p>Nascimento: <span className="font-semibold text-brand-text dark:text-brand-dark-text">{new Date(selectedPatient.birthDate).toLocaleDateString("pt-BR")}</span></p>
          </div>
        </div>

        {/* Form to Request Data */}
        <form onSubmit={handleRequestData} className="space-y-4">
          {requestError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-start gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              <span>{requestError}</span>
            </div>
          )}

          {/* Mode selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-brand-bg dark:bg-brand-dark-bg p-1 rounded-lg">
            <button
              type="button"
              onClick={() => {
                setAuthMethod("token");
                setRequestError("");
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all ${
                authMethod === "token"
                  ? "bg-brand-paper dark:bg-brand-dark-paper text-primary dark:text-secondary-light shadow-sm"
                  : "text-brand-text/60 dark:text-brand-dark-text/60 hover:text-brand-text dark:hover:text-brand-dark-text"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
              </svg>
              Código OTP do Paciente
            </button>
            <button
              type="button"
              onClick={() => {
                setAuthMethod("break_the_glass");
                setRequestError("");
              }}
              className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-md transition-all ${
                authMethod === "break_the_glass"
                  ? "bg-red-500 text-white shadow-sm"
                  : "text-brand-text/60 dark:text-brand-dark-text/60 hover:text-red-500"
              }`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 shrink-0">
                <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
              Acesso Crítico (Break the Glass)
            </button>
          </div>

          {/* Standard Token Form */}
          {authMethod === "token" ? (
            <div className="space-y-2 p-4 bg-brand-bg/50 dark:bg-brand-dark-bg/50 rounded-lg border border-brand-border dark:border-brand-dark-border animate-fadeIn">
              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75">
                Token de Autorização (6 Dígitos)
              </label>
              <div className="flex gap-4">
                <input
                  type="text"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  className="w-full max-w-xs rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-paper dark:bg-brand-dark-paper px-4 py-2 text-center text-lg font-mono tracking-widest text-brand-text dark:text-brand-dark-text focus:border-primary focus:outline-none transition"
                />
                <div className="text-xs text-brand-text/60 dark:text-brand-dark-text/60 flex items-center">
                  <span>OTP ativo na sandbox: <code className="bg-slate-200 dark:bg-brand-dark-border px-1.5 py-0.5 rounded text-primary dark:text-secondary-light font-mono font-bold">{selectedPatient.otpToken}</code></span>
                </div>
              </div>
            </div>
          ) : (
            // Break the Glass Form
            <div className="space-y-4 p-4 bg-red-500/5 dark:bg-red-500/10 rounded-lg border border-red-500/20 animate-fadeIn">
              <div className="flex items-start gap-3 bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 p-3 rounded-lg border border-red-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <div className="text-xs space-y-1">
                  <p className="font-bold uppercase tracking-wider">Protocolo de Segurança Crítico</p>
                  <p>O acesso forçado registra seus dados profissionais e IP nos servidores centrais. A auditoria médica da clínica e o paciente serão notificados imediatamente.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                    Nome do Solicitante
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterName}
                    onChange={(e) => setRequesterName(e.target.value)}
                    placeholder="Dr. Roberto Silva"
                    className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-paper dark:bg-brand-dark-paper px-3 py-1.5 text-sm text-brand-text dark:text-brand-dark-text focus:border-red-500 focus:outline-none transition"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                    Cargo / Registro Profissional (CRM/Coren)
                  </label>
                  <input
                    type="text"
                    required
                    value={requesterRole}
                    onChange={(e) => setRequesterRole(e.target.value)}
                    placeholder="Médico Cardiologista - CRM 123456/SP"
                    className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-paper dark:bg-brand-dark-paper px-3 py-1.5 text-sm text-brand-text dark:text-brand-dark-text focus:border-red-500 focus:outline-none transition"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                  Justificativa Clínica de Urgência
                </label>
                <textarea
                  required
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  placeholder="Descreva o motivo de emergência clínica (ex: Paciente inconsciente, risco iminente de morte, sem acompanhantes)..."
                  rows={3}
                  className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-paper dark:bg-brand-dark-paper px-3 py-1.5 text-sm text-brand-text dark:text-brand-dark-text focus:border-red-500 focus:outline-none transition"
                />
              </div>
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              className={`px-6 py-2 rounded-lg text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all ${
                authMethod === "break_the_glass"
                  ? "bg-red-600 hover:bg-red-700"
                  : "bg-primary hover:bg-primary-dark"
              }`}
            >
              Requisitar Dados Clínicos
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
