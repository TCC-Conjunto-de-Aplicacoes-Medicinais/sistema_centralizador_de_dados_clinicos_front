"use client";

import React from "react";
import { TimelineEvent } from "../app/mockData";

interface ClinicalTimelineProps {
  events?: TimelineEvent[];
}

export default function ClinicalTimeline({ events }: ClinicalTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="p-8 text-center border border-dashed border-brand-border dark:border-brand-dark-border rounded-xl text-xs text-brand-text/50 dark:text-brand-dark-text/50">
        Nenhum evento registrado na linha do tempo clínica deste paciente.
      </div>
    );
  }

  const badgeConfig = {
    red: {
      dot: "bg-red-500 ring-red-100 dark:ring-red-950",
      badge: "bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border-red-200 dark:border-red-900/50",
      label: "Urgência / Emergência",
    },
    emerald: {
      dot: "bg-emerald-500 ring-emerald-100 dark:ring-emerald-950",
      badge: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50",
      label: "Consulta Ambulatorial",
    },
    blue: {
      dot: "bg-blue-500 ring-blue-100 dark:ring-blue-950",
      badge: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-900/50",
      label: "Diagnóstico / Exame",
    },
    amber: {
      dot: "bg-amber-500 ring-amber-100 dark:ring-amber-950",
      badge: "bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-900/50",
      label: "Internação / Observação",
    },
    purple: {
      dot: "bg-purple-500 ring-purple-100 dark:ring-purple-950",
      badge: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-400 border-purple-200 dark:border-purple-900/50",
      label: "Prescrição / Farmácia",
    },
  };

  return (
    <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-brand-border dark:before:bg-brand-dark-border">
      {events.map((evt) => {
        const style = badgeConfig[evt.badgeColor] || badgeConfig.blue;

        return (
          <div key={evt.id} className="relative group">
            {/* Ponto na Linha do Tempo */}
            <div
              className={`absolute -left-[27px] sm:-left-[35px] top-1.5 h-3.5 w-3.5 rounded-full ring-4 ${style.dot} transition-transform group-hover:scale-125`}
            />

            {/* Card do Evento */}
            <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-4 shadow-xs hover:shadow-md transition space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-brand-border/60 dark:border-brand-dark-border/60 pb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${style.badge}`}>
                    {style.label}
                  </span>
                  <h4 className="text-sm font-bold text-brand-text dark:text-brand-dark-text">
                    {evt.title}
                  </h4>
                </div>
                <span className="text-[11px] font-semibold text-brand-text/60 dark:text-brand-dark-text/60">
                  {evt.date}
                </span>
              </div>

              <div className="text-xs text-brand-text/70 dark:text-brand-dark-text/70 flex items-center gap-2 flex-wrap">
                <span>🏥 <strong>{evt.institution}</strong></span>
                <span>•</span>
                <span>👨‍⚕️ {evt.doctorName} ({evt.crm})</span>
              </div>

              <p className="text-xs text-brand-text/85 dark:text-brand-dark-text/85 leading-relaxed bg-brand-bg/40 dark:bg-brand-dark-bg/40 p-2.5 rounded-lg border border-brand-border/50 dark:border-brand-dark-border/50">
                {evt.summary}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
