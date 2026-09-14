"use client";

import React, { useState } from "react";
import { ECGRecord } from "../app/mockData";

interface ECGWaveformViewerProps {
  ecgRecord: ECGRecord;
  onOpenComparator?: () => void;
}

export default function ECGWaveformViewer({
  ecgRecord,
  onOpenComparator,
}: ECGWaveformViewerProps) {
  const [selectedLeadIndex, setSelectedLeadIndex] = useState(0);
  const [paperSpeed, setPaperSpeed] = useState<25 | 50>(25);
  const [voltageScale, setVoltageScale] = useState<10 | 20>(10);
  const [gridTheme, setGridTheme] = useState<"pink" | "dark" | "cyan">("pink");

  const currentLead = ecgRecord.leadsData[selectedLeadIndex] || ecgRecord.leadsData[0];
  const points = currentLead?.wavePoints || [];

  // Gera path SVG a partir dos pontos normalizados (250 pontos)
  // Largura: 1000px, Altura: 220px, Linha base: Y=110
  const svgWidth = 960;
  const svgHeight = 220;
  const baselineY = 110;
  const scaleY = (voltageScale === 20 ? 85 : 55); // Amplitude da voltagem

  const stepX = svgWidth / (points.length - 1);
  const pathD = points.reduce((acc, pt, idx) => {
    const x = idx * stepX;
    const y = baselineY - pt * scaleY;
    return idx === 0 ? `M ${x.toFixed(1)} ${y.toFixed(1)}` : `${acc} L ${x.toFixed(1)} ${y.toFixed(1)}`;
  }, "");

  // Cores do papel milimetrado
  const gridStyles = {
    pink: {
      bg: "bg-[#FFF5F5] dark:bg-[#1A0C0E]",
      smallGrid: "#F8B4B4",
      largeGrid: "#E05252",
      waveColor: "#991B1B dark:#EF4444",
      waveStroke: "#B91C1C",
    },
    dark: {
      bg: "bg-[#090E0B]",
      smallGrid: "#132319",
      largeGrid: "#244230",
      waveColor: "#10B981",
      waveStroke: "#00E676",
    },
    cyan: {
      bg: "bg-[#031525]",
      smallGrid: "#0B2D4A",
      largeGrid: "#1B527E",
      waveColor: "#38BDF8",
      waveStroke: "#00E5FF",
    },
  }[gridTheme];

  return (
    <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm space-y-4">
      {/* Header do Visualizador */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border dark:border-brand-dark-border pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h4 className="text-sm font-bold text-brand-text dark:text-brand-dark-text uppercase tracking-wider">
              Traçado de Eletrocardiograma (12 Derivações)
            </h4>
            <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-brand-bg dark:bg-brand-dark-bg border border-brand-border dark:border-brand-dark-border text-brand-text/70 dark:text-brand-dark-text/70">
              {ecgRecord.date}
            </span>
          </div>
          <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60 mt-0.5">
            Origem: <strong>{ecgRecord.provider}</strong> • Indicação: {ecgRecord.indication}
          </p>
        </div>

        {/* Botões de Ação Rápida */}
        <div className="flex items-center gap-2">
          {onOpenComparator && (
            <button
              onClick={onOpenComparator}
              className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
              title="Comparar traçado atual lado a lado com exames anteriores do paciente"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path fillRule="evenodd" d="M1 4.75C1 3.784 1.784 3 2.75 3h14.5c.966 0 1.75.784 1.75 1.75v10.5A1.75 1.75 0 0117.25 17H2.75A1.75 1.75 0 011 15.25V4.75zm8.25 1.5a.75.75 0 00-1.5 0v7.5a.75.75 0 001.5 0v-7.5zM12 7.75a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75zm0 4a.75.75 0 01.75-.75h2.5a.75.75 0 010 1.5h-2.5a.75.75 0 01-.75-.75z" clipRule="evenodd" />
              </svg>
              Comparar Lado a Lado
            </button>
          )}
        </div>
      </div>

      {/* Métricas Clínicas Calculadas */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
        <div className="p-2.5 rounded-lg bg-brand-bg/60 dark:bg-brand-dark-bg/60 border border-brand-border dark:border-brand-dark-border">
          <span className="text-[10px] text-brand-text/60 dark:text-brand-dark-text/60 uppercase font-semibold">Freq. Cardíaca</span>
          <p className="text-base font-extrabold text-primary dark:text-secondary-light">{ecgRecord.heartRateBpm} <span className="text-xs font-normal">BPM</span></p>
        </div>
        <div className="p-2.5 rounded-lg bg-brand-bg/60 dark:bg-brand-dark-bg/60 border border-brand-border dark:border-brand-dark-border">
          <span className="text-[10px] text-brand-text/60 dark:text-brand-dark-text/60 uppercase font-semibold">Intervalo PR</span>
          <p className="text-base font-extrabold text-brand-text dark:text-brand-dark-text">{ecgRecord.prIntervalMs} <span className="text-xs font-normal">ms</span></p>
        </div>
        <div className="p-2.5 rounded-lg bg-brand-bg/60 dark:bg-brand-dark-bg/60 border border-brand-border dark:border-brand-dark-border">
          <span className="text-[10px] text-brand-text/60 dark:text-brand-dark-text/60 uppercase font-semibold">Complexo QRS</span>
          <p className="text-base font-extrabold text-brand-text dark:text-brand-dark-text">{ecgRecord.qrsDurationMs} <span className="text-xs font-normal">ms</span></p>
        </div>
        <div className="p-2.5 rounded-lg bg-brand-bg/60 dark:bg-brand-dark-bg/60 border border-brand-border dark:border-brand-dark-border">
          <span className="text-[10px] text-brand-text/60 dark:text-brand-dark-text/60 uppercase font-semibold">Intervalo QTc</span>
          <p className="text-base font-extrabold text-brand-text dark:text-brand-dark-text">{ecgRecord.qtIntervalMs} <span className="text-xs font-normal">ms</span></p>
        </div>
        <div className={`p-2.5 rounded-lg border ${ecgRecord.stElevationMm > 1.0 ? "bg-red-50 dark:bg-red-950/40 border-red-200 dark:border-red-900/60" : "bg-brand-bg/60 dark:bg-brand-dark-bg/60 border-brand-border dark:border-brand-dark-border"}`}>
          <span className={`text-[10px] uppercase font-semibold ${ecgRecord.stElevationMm > 1.0 ? "text-red-700 dark:text-red-400" : "text-brand-text/60 dark:text-brand-dark-text/60"}`}>Desnível ST</span>
          <p className={`text-base font-extrabold ${ecgRecord.stElevationMm > 1.0 ? "text-red-600 dark:text-red-400" : "text-emerald-600 dark:text-emerald-400"}`}>
            {ecgRecord.stElevationMm > 0 ? `+${ecgRecord.stElevationMm} mm` : "Isoelétrico"}
          </p>
        </div>
      </div>

      {/* Controles de Derivação e Papel de ECG */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Seletor de Derivação */}
        <div className="flex items-center gap-1.5 overflow-x-auto py-1">
          <span className="text-[11px] font-semibold text-brand-text/70 dark:text-brand-dark-text/70 mr-1">Derivação:</span>
          {ecgRecord.leadsData.map((lead, idx) => (
            <button
              key={lead.lead}
              onClick={() => setSelectedLeadIndex(idx)}
              className={`px-2.5 py-1 rounded-md text-xs font-bold transition cursor-pointer ${
                selectedLeadIndex === idx
                  ? "bg-primary text-white shadow-sm"
                  : "bg-brand-bg dark:bg-brand-dark-bg text-brand-text/70 dark:text-brand-dark-text/70 hover:bg-brand-border"
              }`}
            >
              {lead.lead}
            </button>
          ))}
        </div>

        {/* Ajustes de Calibração Padrão */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPaperSpeed(paperSpeed === 25 ? 50 : 25)}
            className="px-2 py-1 rounded border border-brand-border dark:border-brand-dark-border text-[11px] font-semibold hover:bg-brand-bg dark:hover:bg-brand-dark-bg transition cursor-pointer"
            title="Velocidade padrão de avanço do papel de ECG"
          >
            {paperSpeed} mm/s
          </button>
          <button
            onClick={() => setVoltageScale(voltageScale === 10 ? 20 : 10)}
            className="px-2 py-1 rounded border border-brand-border dark:border-brand-dark-border text-[11px] font-semibold hover:bg-brand-bg dark:hover:bg-brand-dark-bg transition cursor-pointer"
            title="Sensibilidade de amplitude de voltagem do traçado"
          >
            {voltageScale} mm/mV
          </button>
          <button
            onClick={() => setGridTheme(gridTheme === "pink" ? "dark" : gridTheme === "dark" ? "cyan" : "pink")}
            className="px-2 py-1 rounded border border-brand-border dark:border-brand-dark-border text-[11px] font-semibold hover:bg-brand-bg dark:hover:bg-brand-dark-bg transition cursor-pointer"
            title="Alternar estilo do papel milimetrado (Rosa Clássico / Obsidian Dark / Monitor CTI)"
          >
            Papel: {gridTheme === "pink" ? "Rosa Clássico" : gridTheme === "dark" ? "Obsidian Dark" : "Monitor CTI"}
          </button>
        </div>
      </div>

      {/* Grid Milimetrado de ECG com Canvas/SVG */}
      <div className={`relative w-full rounded-lg border border-brand-border dark:border-brand-dark-border overflow-hidden ${gridStyles.bg}`}>
        <svg
          viewBox={`0 0 ${svgWidth} ${svgHeight}`}
          className="w-full h-48 sm:h-56 select-none"
          preserveAspectRatio="none"
        >
          <defs>
            {/* Grade Menor: 1mm x 1mm (a cada 4px) */}
            <pattern id={`smallGrid-${gridTheme}`} width="8" height="8" patternUnits="userSpaceOnUse">
              <path d="M 8 0 L 0 0 0 8" fill="none" stroke={gridStyles.smallGrid} strokeWidth="0.5" strokeOpacity="0.4" />
            </pattern>
            {/* Grade Maior: 5mm x 5mm (a cada 40px) */}
            <pattern id={`largeGrid-${gridTheme}`} width="40" height="40" patternUnits="userSpaceOnUse">
              <rect width="40" height="40" fill={`url(#smallGrid-${gridTheme})`} />
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke={gridStyles.largeGrid} strokeWidth="1.2" strokeOpacity="0.8" />
            </pattern>
          </defs>

          {/* Fundo com a grade */}
          <rect width="100%" height="100%" fill={`url(#largeGrid-${gridTheme})`} />

          {/* Marcador de Calibração (Padrão 1 mV no início) */}
          <path
            d={`M 15 ${baselineY} L 15 ${baselineY - scaleY} L 25 ${baselineY - scaleY} L 25 ${baselineY}`}
            fill="none"
            stroke={gridStyles.waveStroke}
            strokeWidth="1.8"
            strokeLinecap="round"
          />
          <text x="32" y={baselineY - 10} fill={gridStyles.waveStroke} fontSize="10" fontWeight="bold" fontFamily="monospace">
            1 mV ({voltageScale}mm)
          </text>

          {/* Linha Isoelétrica de Referência (suave) */}
          <line x1="0" y1={baselineY} x2={svgWidth} y2={baselineY} stroke={gridStyles.largeGrid} strokeWidth="0.8" strokeDasharray="3 3" />

          {/* Traçado Contínuo do Eletrocardiograma */}
          <path
            d={pathD}
            fill="none"
            stroke={gridStyles.waveStroke}
            strokeWidth="2.2"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </svg>

        {/* Legenda Flutuante da Derivação */}
        <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-xs text-white text-[11px] font-mono font-bold px-2 py-0.5 rounded shadow">
          {currentLead.lead} • {paperSpeed}mm/s • {voltageScale}mm/mV
        </div>
      </div>

      {/* Laudo Médico do Registro */}
      <div className="p-3 rounded-lg bg-brand-bg/40 dark:bg-brand-dark-bg/40 border border-brand-border dark:border-brand-dark-border text-xs space-y-1">
        <p className="font-bold text-brand-text dark:text-brand-dark-text">
          Conclusão do Exame: <span className="font-normal text-brand-text/85 dark:text-brand-dark-text/85">{ecgRecord.diagnosis}</span>
        </p>
        <p className="text-[11px] text-brand-text/60 dark:text-brand-dark-text/60">
          Nota Técnica: {currentLead.description}
        </p>
      </div>
    </div>
  );
}
