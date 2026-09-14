"use client";

import React, { useState } from "react";
import { mockPatients, Patient } from "../app/mockData";

interface QuickAccessModalProps {
  onClose: () => void;
  onSelectPatient: (patient: Patient, token: string) => void;
}

export default function QuickAccessModal({
  onClose,
  onSelectPatient,
}: QuickAccessModalProps) {
  const [tokenCode, setTokenCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successPatient, setSuccessPatient] = useState<string | null>(null);

  const handleValidate = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleanToken = tokenCode.trim();
    if (cleanToken.length !== 6) {
      setError("O código de acesso temporário possui 6 dígitos numéricos.");
      return;
    }

    // Busca paciente que possua esse token
    const found = mockPatients.find((p) => p.otpToken === cleanToken);
    if (found) {
      setIsLoading(true);
      setTimeout(() => {
        setIsLoading(false);
        setSuccessPatient(found.name);
        setTimeout(() => {
          onSelectPatient(found, cleanToken);
          onClose();
        }, 700);
      }, 800);
    } else {
      setError("Código de acesso temporário não encontrado ou já expirado.");
    }
  };

  const handleSimulateQR = (pat: Patient) => {
    setError("");
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setSuccessPatient(pat.name);
      setTimeout(() => {
        onSelectPatient(pat, pat.otpToken);
        onClose();
      }, 700);
    }, 700);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-brand-border dark:border-brand-dark-border pb-3">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              📱
            </div>
            <div>
              <h3 className="text-base font-bold text-brand-text dark:text-brand-dark-text">
                Validação de Acesso Rápido (Recepção)
              </h3>
              <p className="text-[11px] text-brand-text/60 dark:text-brand-dark-text/60">
                Código OTP gerado no App móvel do paciente
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-brand-text/60 hover:text-brand-text transition cursor-pointer"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <div className="py-10 flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
            <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <p className="text-sm font-bold text-brand-text dark:text-brand-dark-text">
                Validando Assinatura DPoP & Chave Assimétrica...
              </p>
              <p className="text-[11px] text-brand-text/60 dark:text-brand-dark-text/60 mt-1">
                Consultando custódia descentralizada do aplicativo móvel
              </p>
            </div>
          </div>
        ) : successPatient ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-3 animate-fadeIn">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center text-2xl font-bold border border-emerald-300 dark:border-emerald-800 shadow-sm">
              ✓
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-700 dark:text-emerald-300">
                Acesso Autorizado com Sucesso!
              </p>
              <p className="text-xs text-brand-text/70 dark:text-brand-dark-text/70 mt-1">
                Prontuário de <strong>{successPatient}</strong> liberado no painel clínico.
              </p>
            </div>
          </div>
        ) : (
          <>
            <form onSubmit={handleValidate} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-brand-text dark:text-brand-dark-text mb-1">
                  Digite o Código Temporal de 6 Dígitos:
                </label>
                <input
                  type="text"
                  maxLength={6}
                  placeholder="Ex: 123456"
                  value={tokenCode}
                  onChange={(e) => setTokenCode(e.target.value.replace(/\D/g, ""))}
                  className="w-full text-center tracking-[0.4em] text-xl font-mono font-extrabold p-3 rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-bg/50 dark:bg-brand-dark-bg/50 text-brand-text dark:text-brand-dark-text focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {error && <p className="text-xs text-red-600 dark:text-red-400 font-semibold">{error}</p>}

              <button
                type="submit"
                className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition cursor-pointer shadow-sm"
              >
                Validar e Liberar Prontuário
              </button>
            </form>

            {/* Simulação de leitura de QR Code do App */}
            <div className="pt-3 border-t border-brand-border dark:border-brand-dark-border space-y-2 text-xs">
              <span className="text-[10px] font-bold text-brand-text/60 dark:text-brand-dark-text/60 uppercase">
                Demonstração Rápida (Simular Escaneamento de QR Code):
              </span>
              <div className="flex flex-col gap-1.5">
                {mockPatients.slice(0, 2).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => handleSimulateQR(p)}
                    className="text-left p-2 rounded border border-brand-border/60 dark:border-brand-dark-border/60 hover:bg-brand-bg dark:hover:bg-brand-dark-bg transition flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className="font-semibold text-brand-text dark:text-brand-dark-text">{p.name}</p>
                      <p className="text-[10px] text-brand-text/50 dark:text-brand-dark-text/50">Token ativo: {p.otpToken}</p>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">Escanear →</span>
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
