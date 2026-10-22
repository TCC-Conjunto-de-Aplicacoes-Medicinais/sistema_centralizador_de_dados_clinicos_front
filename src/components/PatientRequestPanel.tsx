"use client";

import { formatBirthDate } from "../services/format";
import { useState } from "react";
import type { AuditLog, AuthorizedHistory, Clinic, ClinicUser, Patient } from "../types/clinical";
import { redeemAccessCodeApi, requestPatientDataApi } from "../services/api";

interface PatientRequestPanelProps {
  selectedPatient: Patient | null;
  currentClinic: Clinic;
  currentUser: ClinicUser;
  authorizedHistory?: AuthorizedHistory | null;
  onAuthorizationSuccess: (history: AuthorizedHistory, newLog: AuditLog) => void;
  onRevokeAccess?: () => void;
}

export default function PatientRequestPanel({
  selectedPatient,
  currentClinic,
  currentUser,
  authorizedHistory,
  onAuthorizationSuccess,
  onRevokeAccess,
}: PatientRequestPanelProps) {
  const [requestError, setRequestError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const [justification, setJustification] = useState("");

  if (!selectedPatient) {
    return (
      <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm">
        <div className="flex flex-col items-center justify-center py-12 text-center text-brand-text/40 dark:text-brand-dark-text/40">
          <p className="text-sm font-semibold">Nenhum paciente selecionado</p>
          <p className="text-xs">Busque um paciente pelo CPF ou pelo nome no painel lateral.</p>
        </div>
      </div>
    );
  }

  const isAuthorized = authorizedHistory && authorizedHistory.patient.id === selectedPatient.id;

  const handleRequestData = async (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError("");
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("centralizador_token") || "";
      const code = accessCode.trim();
      if (code) {
        // Código do paciente libera o acesso por prazo curto; sem código, vale só o consentimento permanente.
        await redeemAccessCodeApi(selectedPatient.cpf.replace(/\D/g, ""), code, token);
        setAccessCode("");
      }
      const { history, log } = await requestPatientDataApi(
        selectedPatient,
        token,
        { name: currentUser.name, email: currentUser.email, role: currentUser.role },
        currentClinic
      );
      onAuthorizationSuccess(history, log);
    } catch (err: unknown) {
      setRequestError(err instanceof Error ? err.message : "Erro ao solicitar o histórico do paciente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleBreakGlass = async () => {
    setRequestError("");
    if (justification.trim().length < 10) {
      setRequestError("Informe a justificativa (mínimo de 10 caracteres).");
      return;
    }
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("centralizador_token") || "";
      const { history, log } = await requestPatientDataApi(
        selectedPatient,
        token,
        { name: currentUser.name, email: currentUser.email, role: currentUser.role },
        currentClinic,
        { justification: justification.trim() }
      );
      setJustification("");
      onAuthorizationSuccess(history, log);
    } catch (err: unknown) {
      setRequestError(err instanceof Error ? err.message : "Erro ao acessar o histórico.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border dark:border-brand-dark-border pb-4 gap-2">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 dark:bg-secondary/15 text-primary-dark dark:text-secondary-light px-2 py-0.5 rounded-full">
              Paciente Selecionado
            </span>
            {isAuthorized && (
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                ✓ Histórico Liberado
              </span>
            )}
          </div>
          <h3 className="text-xl font-extrabold text-brand-text dark:text-brand-dark-text mt-1">{selectedPatient.name}</h3>
        </div>
        <div className="text-xs text-brand-text/60 dark:text-brand-dark-text/60 space-y-0.5 sm:text-right">
          <p>CPF: <span className="font-semibold text-brand-text dark:text-brand-dark-text">{selectedPatient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</span></p>
          {selectedPatient.birthDate && (
            <p>Nascimento: <span className="font-semibold text-brand-text dark:text-brand-dark-text">{formatBirthDate(selectedPatient.birthDate)}</span></p>
          )}
        </div>
      </div>

      {isAuthorized ? (
        <div className="p-4 bg-emerald-500/10 dark:bg-emerald-950/30 border border-emerald-500/30 rounded-xl space-y-3 animate-fadeIn">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase tracking-wide">Histórico liberado pelo consentimento do paciente</p>
              <p className="text-xs text-brand-text/70 dark:text-brand-dark-text/70 mt-0.5">
                Acesso registrado às {new Date(authorizedHistory.timestamp).toLocaleTimeString("pt-BR")} na auditoria.
              </p>
            </div>
            {onRevokeAccess && (
              <button
                type="button"
                onClick={onRevokeAccess}
                className="self-start sm:self-auto text-xs text-brand-text/70 hover:text-brand-text font-semibold px-3.5 py-1.5 rounded-lg border border-brand-border dark:border-brand-dark-border transition cursor-pointer"
              >
                Fechar visualização
              </button>
            )}
          </div>
        </div>
      ) : (
        <form onSubmit={handleRequestData} className="space-y-4">
          {requestError && (
            <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50">
              <span>{requestError}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label htmlFor="access-code" className="text-xs font-semibold text-brand-text dark:text-brand-dark-text">
              Código do paciente (opcional)
            </label>
            <input
              id="access-code"
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ""))}
              placeholder="6 dígitos gerados no app"
              className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-bg dark:bg-brand-dark-bg px-3 py-2 text-sm tracking-[0.3em] text-brand-text dark:text-brand-dark-text"
            />
            <p className="text-[11px] text-brand-text/60 dark:text-brand-dark-text/60">
              O código vale por 10 minutos e só pode ser usado uma vez.
            </p>
          </div>

          <div className="p-4 bg-brand-bg/50 dark:bg-brand-dark-bg/50 rounded-lg border border-brand-border dark:border-brand-dark-border text-xs text-brand-text/70 dark:text-brand-dark-text/70 space-y-1">
            <p className="font-semibold text-brand-text dark:text-brand-dark-text">Autorização por consentimento</p>
            <p>
              O histórico só é liberado se o paciente tiver concedido consentimento no aplicativo. Toda tentativa, permitida ou negada, fica registrada na auditoria.
            </p>
          </div>

          <div className="space-y-2 p-4 rounded-lg border border-dashed border-amber-500/50 bg-amber-500/5">
            <p className="text-xs font-semibold text-brand-text dark:text-brand-dark-text">
              Acesso de demonstração (break-the-glass)
            </p>
            <p className="text-[11px] text-brand-text/60 dark:text-brand-dark-text/60">
              Sem consentimento. Só funciona para pacientes de demonstração. A justificativa fica registrada na auditoria.
            </p>
            <textarea
              value={justification}
              onChange={(e) => setJustification(e.target.value)}
              rows={2}
              maxLength={500}
              placeholder="Justificativa (mínimo de 10 caracteres)"
              className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-bg dark:bg-brand-dark-bg px-3 py-2 text-xs text-brand-text dark:text-brand-dark-text"
            />
            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleBreakGlass}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-lg text-xs font-semibold text-amber-800 dark:text-amber-300 border border-amber-500/60 hover:bg-amber-500/10 transition cursor-pointer disabled:opacity-60"
              >
                Acessar como demonstração
              </button>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold text-white shadow-sm hover:shadow transition-all cursor-pointer bg-primary hover:bg-primary-dark disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Consultando histórico...</span>
                </>
              ) : (
                <span>Requisitar histórico clínico</span>
              )}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
