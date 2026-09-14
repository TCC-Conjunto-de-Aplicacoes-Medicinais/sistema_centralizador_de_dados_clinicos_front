"use client";

import React, { useState } from "react";
import { Patient } from "../app/mockData";

interface FHIRResourceTreeProps {
  patient: Patient;
  hl7BundleString: string;
  onDownloadHL7: () => void;
}

export default function FHIRResourceTree({
  patient,
  hl7BundleString,
  onDownloadHL7,
}: FHIRResourceTreeProps) {
  const [viewMode, setViewMode] = useState<"tree" | "raw">("tree");
  const [activeTab, setActiveTab] = useState<"all" | "Patient" | "Observation" | "DiagnosticReport" | "MedicationStatement" | "AllergyIntolerance">("all");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(hl7BundleString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* Header do Inspetor FHIR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-brand-border dark:border-brand-dark-border pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 font-bold text-xs border border-blue-200 dark:border-blue-900/50">
            FHIR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-brand-text dark:text-brand-dark-text">
                Recursos HL7 FHIR Release 4 (v4.0.1)
              </h4>
              <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                Padrão Interoperável
              </span>
            </div>
            <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60">
              Bundle do tipo <span className="font-mono font-semibold">document</span> normalizado para tráfego seguro inter-clínicas.
            </p>
          </div>
        </div>

        {/* Alternador de Modo: Cartões Estruturados vs JSON Bruto */}
        <div className="flex items-center gap-2">
          <div className="flex rounded-lg border border-brand-border dark:border-brand-dark-border p-0.5 bg-brand-bg dark:bg-brand-dark-bg text-xs font-semibold">
            <button
              onClick={() => setViewMode("tree")}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                viewMode === "tree"
                  ? "bg-brand-paper dark:bg-brand-dark-paper text-primary dark:text-secondary-light shadow-xs"
                  : "text-brand-text/60 dark:text-brand-dark-text/60 hover:text-brand-text"
              }`}
            >
              Árvore de Recursos
            </button>
            <button
              onClick={() => setViewMode("raw")}
              className={`px-3 py-1 rounded-md transition cursor-pointer ${
                viewMode === "raw"
                  ? "bg-brand-paper dark:bg-brand-dark-paper text-primary dark:text-secondary-light shadow-xs"
                  : "text-brand-text/60 dark:text-brand-dark-text/60 hover:text-brand-text"
              }`}
            >
              JSON R4 Bruto
            </button>
          </div>

          <button
            onClick={onDownloadHL7}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-sm transition cursor-pointer"
            title="Download do arquivo JSON padrão HL7 FHIR"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.275a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.089V2.75z" />
              <path d="M16.25 11.75a.75.75 0 00-1.5 0v3.5a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75v-3.5a.75.75 0 00-1.5 0v3.5A2.25 2.25 0 006 17.5h8a2.25 2.25 0 002.25-2.25v-3.5z" />
            </svg>
            Download
          </button>
        </div>
      </div>

      {viewMode === "tree" ? (
        <div className="space-y-4">
          {/* Filtro de Categorias de Recursos */}
          <div className="flex flex-wrap gap-1.5 text-xs">
            {[
              { id: "all", label: "Todos os Recursos" },
              { id: "Patient", label: "Patient (1)" },
              { id: "DiagnosticReport", label: `DiagnosticReport (${patient.exams.length})` },
              { id: "MedicationStatement", label: `MedicationStatement (${patient.medications.length})` },
              { id: "AllergyIntolerance", label: `AllergyIntolerance (${patient.allergies.length})` },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                  activeTab === tab.id
                    ? "bg-primary/10 dark:bg-secondary/15 text-primary-dark dark:text-secondary-light border-primary/30 dark:border-secondary/30"
                    : "border-brand-border dark:border-brand-dark-border text-brand-text/70 dark:text-brand-dark-text/70 hover:bg-brand-bg dark:hover:bg-brand-dark-bg"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Cards dos Recursos FHIR */}
          <div className="space-y-3">
            {/* Recurso Patient */}
            {(activeTab === "all" || activeTab === "Patient") && (
              <div className="p-4 rounded-xl border border-brand-border dark:border-brand-dark-border bg-brand-bg/30 dark:bg-brand-dark-bg/30 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-900">
                      Resource: Patient
                    </span>
                    <span className="text-xs font-bold text-brand-text dark:text-brand-dark-text">
                      id: {patient.id}
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">status: active</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 text-brand-text/80 dark:text-brand-dark-text/80">
                  <div><strong>Name:</strong> {patient.name}</div>
                  <div><strong>Identifier (CPF):</strong> {patient.cpf}</div>
                  <div><strong>BirthDate:</strong> {patient.birthDate}</div>
                </div>
              </div>
            )}

            {/* Recursos DiagnosticReport */}
            {(activeTab === "all" || activeTab === "DiagnosticReport") &&
              patient.exams.map((ex, idx) => (
                <div key={ex.id} className="p-4 rounded-xl border border-brand-border dark:border-brand-dark-border bg-brand-bg/30 dark:bg-brand-dark-bg/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-mono font-bold bg-purple-100 dark:bg-purple-950 text-purple-800 dark:text-purple-300 px-2 py-0.5 rounded border border-purple-200 dark:border-purple-900">
                        Resource: DiagnosticReport #{idx + 1}
                      </span>
                      <span className="text-xs font-bold text-brand-text dark:text-brand-dark-text">{ex.title}</span>
                    </div>
                    <span className="text-[10px] text-brand-text/60 dark:text-brand-dark-text/60 font-medium">status: final</span>
                  </div>
                  <p className="text-xs text-brand-text/80 dark:text-brand-dark-text/80">
                    <strong>Performer:</strong> {ex.provider} • <strong>Issued:</strong> {ex.date}
                  </p>
                  <div className="p-2.5 rounded bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border text-xs italic text-brand-text dark:text-brand-dark-text">
                    <strong>Conclusion:</strong> {ex.result}
                  </div>
                </div>
              ))}

            {/* Recursos MedicationStatement */}
            {(activeTab === "all" || activeTab === "MedicationStatement") &&
              patient.medications.map((med, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-brand-border dark:border-brand-dark-border bg-brand-bg/30 dark:bg-brand-dark-bg/30 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-900">
                      MedicationStatement
                    </span>
                    <span className="font-semibold text-brand-text dark:text-brand-dark-text">{med}</span>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">status: active</span>
                </div>
              ))}

            {/* Recursos AllergyIntolerance */}
            {(activeTab === "all" || activeTab === "AllergyIntolerance") &&
              patient.allergies.map((all, idx) => (
                <div key={idx} className="p-3 rounded-xl border border-red-200 dark:border-red-950 bg-red-50/40 dark:bg-red-950/20 flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono font-bold bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-300 px-2 py-0.5 rounded border border-red-200 dark:border-red-900">
                      AllergyIntolerance
                    </span>
                    <span className="font-semibold text-red-900 dark:text-red-300">{all}</span>
                  </div>
                  <span className="text-[10px] text-red-600 dark:text-red-400 font-semibold">clinicalStatus: active</span>
                </div>
              ))}
          </div>
        </div>
      ) : (
        /* Visualização do JSON Bruto com botão de copiar */
        <div className="relative">
          <button
            onClick={handleCopy}
            className="absolute top-3 right-3 z-10 px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold transition cursor-pointer flex items-center gap-1 shadow"
          >
            {copied ? "✓ Copiado!" : "Copiar JSON"}
          </button>
          <pre className="p-4 rounded-xl bg-slate-950 text-slate-300 text-[11px] font-mono overflow-auto max-h-96 border border-slate-800 leading-relaxed">
            {hl7BundleString}
          </pre>
        </div>
      )}
    </div>
  );
}
