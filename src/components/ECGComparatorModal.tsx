"use client";

import React, { useState } from "react";
import { ECGRecord } from "../app/mockData";

interface ECGComparatorModalProps {
  currentECG: ECGRecord;
  previousECG: ECGRecord;
  onClose: () => void;
}

export default function ECGComparatorModal({
  currentECG,
  previousECG,
  onClose,
}: ECGComparatorModalProps) {
  const [layoutMode, setLayoutMode] = useState<"stacked" | "sideBySide">("stacked");

  const renderMiniWave = (ecg: ECGRecord, title: string, color: string, badgeBg: string, badgeText: string) => {
    const points = ecg.leadsData[0]?.wavePoints || [];
    const svgWidth = 700;
    const svgHeight = 140;
    const baselineY = 70;
    const scaleY = 40;

    const stepX = svgWidth / (points.length - 1);
    const pathD = points.reduce((acc, pt, idx) => {
      const x = idx * stepX;
      const y = baselineY - pt * scaleY;
      return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }, "");

    return (
      <div className="border border-brand-border dark:border-brand-dark-border rounded-xl p-4 bg-brand-bg/20 dark:bg-brand-dark-bg/20 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${badgeBg} ${badgeText}`}>
              {title}
            </span>
            <span className="text-xs font-semibold text-brand-text dark:text-brand-dark-text">
              {ecg.date} • {ecg.provider}
            </span>
          </div>
          <div className="text-[11px] font-mono font-bold text-brand-text/70 dark:text-brand-dark-text/70">
            FC: {ecg.heartRateBpm} BPM • ST: {ecg.stElevationMm > 0 ? `+${ecg.stElevationMm}mm` : "Isoelétrico"}
          </div>
        </div>

        {/* SVG Wave com grade de fundo */}
        <div className="relative w-full rounded-lg bg-[#FFF5F5] dark:bg-[#1A0C0E] border border-red-200 dark:border-red-950 overflow-hidden">
          <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-32 select-none" preserveAspectRatio="none">
            <defs>
              <pattern id={`cmpGrid-${ecg.id}`} width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F8B4B4" strokeWidth="0.6" strokeOpacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill={`url(#cmpGrid-${ecg.id})`} />
            <line x1="0" y1={baselineY} x2={svgWidth} y2={baselineY} stroke="#E05252" strokeWidth="0.8" strokeDasharray="3 3" />
            <path d={pathD} fill="none" stroke={color} strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        </div>

        <p className="text-xs text-brand-text/80 dark:text-brand-dark-text/80">
          <strong>Laudo:</strong> {ecg.diagnosis}
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header do Modal */}
        <div className="p-5 border-b border-brand-border dark:border-brand-dark-border flex items-center justify-between sticky top-0 bg-brand-paper/95 dark:bg-brand-dark-paper/95 backdrop-blur-md z-10">
          <div>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
                  <path fillRule="evenodd" d="M1 4.75C1 3.784 1.784 3 2.75 3h14.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0117.25 17H2.75A1.75 1.75 0 011 15.25V4.75zm8.25 1.5a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5z" clipRule="evenodd" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-brand-text dark:text-brand-dark-text">
                Comparador Temporal de ECGs (Evolução Clínica)
              </h3>
            </div>
            <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60 mt-0.5">
              Análise comparativa morfológica de séries temporais cardiológicas entre diferentes datas de atendimento.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setLayoutMode(layoutMode === "stacked" ? "sideBySide" : "stacked")}
              className="hidden md:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-brand-border dark:border-brand-dark-border hover:bg-brand-bg dark:hover:bg-brand-dark-bg transition cursor-pointer"
            >
              {layoutMode === "stacked" ? "Modo Lado a Lado" : "Modo Empilhado"}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-brand-text/60 hover:text-brand-text dark:text-brand-dark-text/60 dark:hover:text-brand-dark-text hover:bg-brand-bg dark:hover:bg-brand-dark-bg transition cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Conteúdo Comparativo */}
        <div className="p-5 space-y-5">
          {/* Tabela de Comparação de Parâmetros Eletrocardiográficos */}
          <div className="overflow-x-auto border border-brand-border dark:border-brand-dark-border rounded-xl">
            <table className="w-full text-xs text-left">
              <thead className="bg-brand-bg dark:bg-brand-dark-bg font-bold text-brand-text/70 dark:text-brand-dark-text/70 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">Parâmetro Clínico</th>
                  <th className="p-2.5 text-red-600 dark:text-red-400">Exame Atual ({currentECG.date})</th>
                  <th className="p-2.5 text-emerald-600 dark:text-emerald-400">Exame Anterior ({previousECG.date})</th>
                  <th className="p-2.5">Variação / Diagnóstico Evolutivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border dark:divide-brand-dark-border text-brand-text dark:text-brand-dark-text">
                <tr>
                  <td className="p-2.5 font-semibold">Frequência Cardíaca</td>
                  <td className="p-2.5 font-bold text-red-600">{currentECG.heartRateBpm} BPM</td>
                  <td className="p-2.5">{previousECG.heartRateBpm} BPM</td>
                  <td className="p-2.5 font-medium text-red-600 dark:text-red-400">+26 BPM (Taquicardia Reativa)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Segmento ST (Parede Anterior)</td>
                  <td className="p-2.5 font-bold text-red-600">Supradesnível +2.8 mm</td>
                  <td className="p-2.5">0.0 mm (Isoelétrico)</td>
                  <td className="p-2.5 font-bold text-red-600 dark:text-red-400">🚨 Alteração Aguda Nova (Não existia no histórico)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-semibold">Intervalo QTc</td>
                  <td className="p-2.5">{currentECG.qtIntervalMs} ms</td>
                  <td className="p-2.5">{previousECG.qtIntervalMs} ms</td>
                  <td className="p-2.5 text-brand-text/70 dark:text-brand-dark-text/70">+40 ms (Limítrofe)</td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Comparação dos Traçados */}
          <div className={layoutMode === "sideBySide" ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}>
            {renderMiniWave(
              currentECG,
              "Exame Atual (Agudo)",
              "#DC2626",
              "bg-red-100 dark:bg-red-950/60",
              "text-red-700 dark:text-red-400"
            )}
            {renderMiniWave(
              previousECG,
              "Exame Anterior (Referência de Linha de Base)",
              "#059669",
              "bg-emerald-100 dark:bg-emerald-950/60",
              "text-emerald-700 dark:text-emerald-400"
            )}
          </div>

          {/* Conclusão Médica da Comparação */}
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 text-xs space-y-1">
            <h4 className="font-bold text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <span>⚠️</span> Parecer Comparativo da Evolução Cardiológica
            </h4>
            <p className="text-amber-900/85 dark:text-amber-200/85 leading-relaxed">
              O paciente apresentava traçado eletrocardiográfico rigorosamente fisiológico em <strong>{previousECG.date}</strong>. O registro atual demonstra o surgimento agudo de supradesnivelamento do segmento ST convexo associado a taquicardia sinusal, descartando hipótese de repolarização precoce crônica ou aneurisma ventricular prévio e confirmando <strong>Síndrome Coronariana Aguda Recente</strong>.
            </p>
          </div>
        </div>

        {/* Footer do Modal */}
        <div className="p-4 border-t border-brand-border dark:border-brand-dark-border flex justify-end gap-2 bg-brand-bg/20 dark:bg-brand-dark-bg/20">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition cursor-pointer"
          >
            Fechar Comparador
          </button>
        </div>
      </div>
    </div>
  );
}
