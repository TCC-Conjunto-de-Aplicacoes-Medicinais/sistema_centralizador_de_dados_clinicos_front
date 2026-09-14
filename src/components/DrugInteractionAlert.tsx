"use client";

import React from "react";
import { DrugInteraction } from "../app/mockData";

interface DrugInteractionAlertProps {
  interactions?: DrugInteraction[];
}

export default function DrugInteractionAlert({ interactions }: DrugInteractionAlertProps) {
  if (!interactions || interactions.length === 0) return null;

  return (
    <div className="space-y-3">
      {interactions.map((item) => (
        <div
          key={item.id}
          className="p-4 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50/75 dark:bg-red-950/30 text-xs shadow-xs space-y-2.5 animate-fadeIn"
        >
          {/* Header do Alerta */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-red-200/70 dark:border-red-900/40 pb-2">
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-red-600 text-white font-bold text-xs">
                !
              </span>
              <div>
                <h4 className="font-bold text-red-900 dark:text-red-300 text-sm">
                  Alerta Farmacológico Interinstitucional (Open Health)
                </h4>
                <p className="text-[11px] text-red-700/80 dark:text-red-400/80">
                  Cruzamento automatizado entre prescrições ativas de prestadores distintos
                </p>
              </div>
            </div>

            <span className="self-start sm:self-auto text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-red-200 dark:bg-red-900/80 text-red-900 dark:text-red-200 border border-red-300 dark:border-red-800">
              Gravidade: {item.severity === "high" ? "Alta / Risco Crítico" : "Moderada"}
            </span>
          </div>

          {/* Fármacos Cruzados */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="p-2 rounded bg-white/80 dark:bg-black/30 border border-red-100 dark:border-red-950">
              <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase">Prescrito em {item.clinicA}:</span>
              <p className="font-bold text-brand-text dark:text-brand-dark-text mt-0.5">{item.drugA}</p>
            </div>
            <div className="p-2 rounded bg-white/80 dark:bg-black/30 border border-red-100 dark:border-red-950">
              <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold uppercase">Prescrito em {item.clinicB}:</span>
              <p className="font-bold text-brand-text dark:text-brand-dark-text mt-0.5">{item.drugB}</p>
            </div>
          </div>

          {/* Mecanismo de Risco & Recomendação */}
          <div className="space-y-1.5 pt-1">
            <p className="text-red-950 dark:text-red-200 leading-relaxed font-medium">
              <strong>Impacto Fisiológico:</strong> {item.clinicalImpact}
            </p>
            <div className="p-2.5 rounded-lg bg-red-100/70 dark:bg-red-900/40 border border-red-200 dark:border-red-800 text-red-900 dark:text-red-200 font-semibold">
              💡 <strong>Conduta Recomendada:</strong> {item.recommendation}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
