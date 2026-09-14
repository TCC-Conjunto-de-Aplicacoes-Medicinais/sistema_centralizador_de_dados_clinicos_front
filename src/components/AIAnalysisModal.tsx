"use client";

import React, { useState, useEffect } from "react";
import { ECGRecord } from "../app/mockData";

interface AIAnalysisModalProps {
  ecgRecord: ECGRecord;
  patientName: string;
  doctorName: string;
  onClose: () => void;
  onAttachToRecord?: (diagnosis: string) => void;
}

export default function AIAnalysisModal({
  ecgRecord,
  patientName,
  doctorName,
  onClose,
  onAttachToRecord,
}: AIAnalysisModalProps) {
  const [analyzing, setAnalyzing] = useState(true);
  const [progress, setProgress] = useState(15);
  const [isAttached, setIsAttached] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setAnalyzing(false);
          return 100;
        }
        return prev + 25;
      });
    }, 250);

    return () => clearInterval(timer);
  }, []);

  const ai = ecgRecord.aiAnalysis || {
    infarctRisk: 88.5,
    overloadRisk: 15.0,
    primaryFinding: "Alteração Isquêmica Aguda de Parede Anterior",
    consensus: "Alerta Crítico: Isquemia Miocárdica Aguda",
    certaintyScore: 0.885,
    disclaimer: "⚠️ Suporte à Decisão Clínica POHINC (SaMD — RDC ANVISA nº 657/2022).",
  };

  const handleAttach = () => {
    setIsAttached(true);
    if (onAttachToRecord) {
      onAttachToRecord(ai.consensus);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl space-y-0">
        {/* Header do Modal */}
        <div className="p-5 border-b border-brand-border dark:border-brand-dark-border flex items-center justify-between bg-purple-500/10 dark:bg-purple-950/30">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                <path d="M15.98 1.804a1 1 0 00-1.96 0l-.24 1.192a8.001 8.001 0 01-4.78 6.014L7.8 9.5a1 1 0 000 1.96l1.2.49a8.001 8.001 0 014.78 6.014l.24 1.192a1 1 0 001.96 0l.24-1.192a8.001 8.001 0 014.78-6.014l1.2-.49a1 1 0 000-1.96l-1.2-.49a8.001 8.001 0 01-4.78-6.014l-.24-1.192z" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-brand-text dark:text-brand-dark-text">
                  Suporte à Decisão Médica — IA Multi-Agente
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900/80 text-purple-900 dark:text-purple-200">
                  ONNX Runtime
                </span>
              </div>
              <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60">
                Redes Neurais 1D-CNN paralelas para triagem de ECG • Paciente: <strong>{patientName}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-brand-text/60 hover:text-brand-text dark:text-brand-dark-text/60 dark:hover:text-brand-dark-text hover:bg-brand-bg dark:hover:bg-brand-dark-bg transition cursor-pointer"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Conteúdo da Análise */}
        <div className="p-6 space-y-5 text-xs">
          {analyzing ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-4 text-center">
              <div className="relative">
                <div className="w-16 h-16 border-4 border-purple-200 dark:border-purple-950 border-t-purple-600 rounded-full animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center font-bold text-purple-600 text-xs">
                  {progress}%
                </div>
              </div>
              <div>
                <p className="font-bold text-sm text-brand-text dark:text-brand-dark-text">
                  Executando Inferência Concorrente em Go/ONNX...
                </p>
                <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60 mt-1">
                  Agente 1 (Infarto) e Agente 2 (Sobrecarga) processando 1.000 pontos a 100 Hz
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Veredito do Consenso Estatístico */}
              <div className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-red-700 dark:text-red-300">
                    Consenso Multi-Agente de Maior Certeza
                  </span>
                  <span className="text-xs font-mono font-extrabold text-red-600 dark:text-red-400">
                    Confiança: {(ai.certaintyScore * 100).toFixed(1)}%
                  </span>
                </div>
                <h4 className="text-base font-extrabold text-red-950 dark:text-red-200">
                  {ai.consensus}
                </h4>
                <p className="text-xs text-red-900/80 dark:text-red-300/80">
                  <strong>Achado Morfológico:</strong> {ai.primaryFinding}
                </p>
              </div>

              {/* Detalhamento Individual dos Dois Agentes Especialistas */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Agente 1: Infarto */}
                <div className="p-3.5 rounded-xl border border-brand-border dark:border-brand-dark-border bg-brand-bg/40 dark:bg-brand-dark-bg/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-text dark:text-brand-dark-text">
                      Agente 1 — Infarto (IAM)
                    </span>
                    <span className="font-extrabold text-red-600 dark:text-red-400 font-mono">
                      {ai.infarctRisk.toFixed(1)}%
                    </span>
                  </div>
                  {/* Barra de Progresso */}
                  <div className="w-full bg-brand-border dark:bg-brand-dark-border rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ai.infarctRisk > 50 ? "bg-red-600" : "bg-emerald-500"
                      }`}
                      style={{ width: `${ai.infarctRisk}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-brand-text/70 dark:text-brand-dark-text/70">
                    Calibrado para elevações de segmento ST e isquemia transmural.
                  </p>
                </div>

                {/* Agente 2: Sobrecarga */}
                <div className="p-3.5 rounded-xl border border-brand-border dark:border-brand-dark-border bg-brand-bg/40 dark:bg-brand-dark-bg/40 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-brand-text dark:text-brand-dark-text">
                      Agente 2 — Sobrecarga
                    </span>
                    <span className="font-extrabold text-brand-text dark:text-brand-dark-text font-mono">
                      {ai.overloadRisk.toFixed(1)}%
                    </span>
                  </div>
                  {/* Barra de Progresso */}
                  <div className="w-full bg-brand-border dark:bg-brand-dark-border rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        ai.overloadRisk > 50 ? "bg-amber-500" : "bg-emerald-500"
                      }`}
                      style={{ width: `${ai.overloadRisk}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-brand-text/70 dark:text-brand-dark-text/70">
                    Calibrado para hipertrofia cavitária e bloqueios de condução.
                  </p>
                </div>
              </div>

              {/* Aviso Regulatório Obrigatório ANVISA SaMD */}
              <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-[11px] text-amber-900 dark:text-amber-200 space-y-1">
                <p className="font-semibold flex items-center gap-1.5">
                  <span>⚖️</span> Conformidade Regulatória (Software como Dispositivo Médico)
                </p>
                <p className="leading-relaxed text-amber-900/80 dark:text-amber-200/80">
                  {ai.disclaimer}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer do Modal */}
        {!analyzing && (
          <div className="p-4 border-t border-brand-border dark:border-brand-dark-border flex flex-col sm:flex-row items-center justify-between gap-3 bg-brand-bg/20 dark:bg-brand-dark-bg/20">
            <span className="text-[11px] text-brand-text/60 dark:text-brand-dark-text/60">
              Profissional Responsável: <strong>{doctorName}</strong>
            </span>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <button
                onClick={onClose}
                className="px-3.5 py-2 text-xs font-semibold rounded-lg border border-brand-border dark:border-brand-dark-border hover:bg-brand-bg dark:hover:bg-brand-dark-bg transition cursor-pointer"
              >
                Descartar
              </button>
              <button
                onClick={handleAttach}
                disabled={isAttached}
                className={`flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg text-white shadow-sm transition cursor-pointer ${
                  isAttached ? "bg-emerald-600 opacity-90 cursor-default" : "bg-purple-600 hover:bg-purple-700"
                }`}
              >
                {isAttached ? "✓ Assinado e Anexado ao Laudo" : "Validar e Anexar com CRM"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
