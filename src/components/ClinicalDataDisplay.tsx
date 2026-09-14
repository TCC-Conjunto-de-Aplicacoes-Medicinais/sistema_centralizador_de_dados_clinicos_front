"use client";

import React, { useState } from "react";
import { Clinic, ClinicUser, AuthorizedHistory, AuditLog } from "../app/mockData";
import ECGWaveformViewer from "./ECGWaveformViewer";
import ECGComparatorModal from "./ECGComparatorModal";
import DrugInteractionAlert from "./DrugInteractionAlert";
import ClinicalTimeline from "./ClinicalTimeline";
import FHIRResourceTree from "./FHIRResourceTree";

interface ClinicalDataDisplayProps {
  authorizedHistory: AuthorizedHistory | null;
  currentClinic: Clinic;
  currentUser: ClinicUser;
  auditLogs?: AuditLog[];
  onShowPrintPreview: () => void;
  onDownloadHL7: () => void;
}

export default function ClinicalDataDisplay({
  authorizedHistory,
  currentClinic,
  currentUser,
  auditLogs = [],
  onShowPrintPreview,
  onDownloadHL7,
}: ClinicalDataDisplayProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "ecg" | "timeline" | "fhir" | "audit">("summary");
  const [comparatorOpen, setComparatorOpen] = useState(false);

  if (!authorizedHistory) return null;

  const patient = authorizedHistory.patient;
  const currentECG = patient.ecgRecords && patient.ecgRecords.length > 0 ? patient.ecgRecords[0] : null;
  const previousECG = patient.ecgRecords && patient.ecgRecords.length > 1 ? patient.ecgRecords[1] : currentECG;

  // Filtra logs de auditoria relacionados a este paciente
  const patientAuditLogs = auditLogs.filter(
    (l) => l.patientName.toLowerCase() === patient.name.toLowerCase()
  );

  return (
    <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-2xl p-5 sm:p-6 shadow-sm space-y-5 animate-fadeIn">
      {/* Top Banner de Autorização & Ações Globais */}
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-border dark:border-brand-dark-border pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg font-bold text-brand-text dark:text-brand-dark-text">
                Prontuário Digital Descentralizado: {patient.name}
              </h2>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                authorizedHistory.method === "break_the_glass"
                  ? "bg-red-100 text-red-700 dark:bg-red-950/60 dark:text-red-400 border border-red-200 dark:border-red-900"
                  : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
              }`}>
                {authorizedHistory.method === "break_the_glass" ? "🚨 Acesso Crítico (Break the Glass)" : "✓ Autorizado via OTP / DPoP"}
              </span>
            </div>
            <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60 mt-0.5">
              CPF: <strong>{patient.cpf}</strong> • Nasc: {patient.birthDate} • Custódia soberana validada via chave assimétrica móvel
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onShowPrintPreview}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3.5 py-2 rounded-lg text-xs transition shadow-sm cursor-pointer"
            title="Visualizar documento sumarizado e gerar impressão em PDF"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Imprimir Sumário A4
          </button>

          <button
            onClick={onDownloadHL7}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3.5 py-2 rounded-lg text-xs transition shadow-sm cursor-pointer"
            title="Download do prontuário no formato internacional HL7 FHIR Release 4"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.275a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.089V2.75z" />
              <path d="M16.25 11.75a.75.75 0 00-1.5 0v3.5a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75v-3.5a.75.75 0 00-1.5 0v3.5A2.25 2.25 0 006 17.5h8a2.25 2.25 0 002.25-2.25v-3.5z" />
            </svg>
            Baixar HL7 FHIR
          </button>
        </div>
      </div>

      {/* Navegação por Abas Especializadas */}
      <div className="flex border-b border-brand-border dark:border-brand-dark-border gap-1 sm:gap-2 overflow-x-auto text-xs font-bold">
        {[
          { id: "summary", label: "📋 Resumo Clínico & Alertas", icon: "🩺" },
          { id: "ecg", label: "⚡ Eletrocardiograma & Laudos", icon: "📊" },
          { id: "timeline", label: "⏱️ Linha do Tempo Unificada", icon: "🏥" },
          { id: "fhir", label: "🌐 Interoperabilidade FHIR R4", icon: "🔗" },
          { id: "audit", label: `🛡️ Auditoria LGPD (${patientAuditLogs.length})`, icon: "⚖️" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-2.5 px-3 py-1.5 border-b-2 transition cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === tab.id
                ? "border-primary text-primary dark:text-secondary-light font-extrabold"
                : "border-transparent text-brand-text/60 dark:text-brand-dark-text/60 hover:text-brand-text hover:border-brand-border"
            }`}
          >
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ─── ABA 1: RESUMO CLÍNICO & ALERTAS ─── */}
      {activeTab === "summary" && (
        <div className="space-y-5 animate-fadeIn">
          {/* Alerta de Interações Medicamentosas (Destaque do Open Health) */}
          <DrugInteractionAlert interactions={patient.drugInteractions} />

          {/* Cards de Alergias, Uso Contínuo e Dados de Contato */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Alergias */}
            <div className="bg-brand-bg/40 dark:bg-brand-dark-bg/40 p-4 rounded-xl border border-brand-border dark:border-brand-dark-border space-y-3">
              <h3 className="text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                Alergias Diagnosticadas
              </h3>
              {patient.allergies.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {patient.allergies.map((allergy, i) => (
                    <span
                      key={i}
                      className="bg-red-50 dark:bg-red-950/50 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-xs font-bold px-2.5 py-1 rounded-md"
                    >
                      {allergy}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-brand-text/50 dark:text-brand-dark-text/50">Nenhuma alergia cadastrada.</p>
              )}
            </div>

            {/* Medicamentos de Uso Contínuo */}
            <div className="bg-brand-bg/40 dark:bg-brand-dark-bg/40 p-4 rounded-xl border border-brand-border dark:border-brand-dark-border space-y-3">
              <h3 className="text-xs font-bold text-primary dark:text-secondary-light flex items-center gap-1.5 uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A.75.75 0 008.8 8v4a.75.75 0 00.755.832l2.5-1a.75.75 0 00-.01-1.392l-2.49-1.272V8a.75.75 0 00-.01-.832z" clipRule="evenodd" />
                </svg>
                Medicamentos de Uso Contínuo
              </h3>
              {patient.medications.length > 0 ? (
                <ul className="space-y-2">
                  {patient.medications.map((med, i) => (
                    <li key={i} className="text-xs flex items-start gap-1.5 text-brand-text dark:text-brand-dark-text leading-snug">
                      <span className="text-primary dark:text-secondary-light mt-0.5">•</span>
                      <span>{med}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-brand-text/50 dark:text-brand-dark-text/50">Nenhum medicamento ativo informado.</p>
              )}
            </div>

            {/* Dados Cadastrais & Governança */}
            <div className="bg-brand-bg/40 dark:bg-brand-dark-bg/40 p-4 rounded-xl border border-brand-border dark:border-brand-dark-border space-y-3">
              <h3 className="text-xs font-bold text-brand-text dark:text-brand-dark-text flex items-center gap-1.5 uppercase tracking-wider">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary dark:text-secondary-light">
                  <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM8 8a5 5 0 00-1 1v3a.75.75 0 001.5 0V9a1.5 1.5 0 003 0v3a.75.75 0 001.5 0V9a5 5 0 00-1-1H8z" />
                </svg>
                Contatos & Governança
              </h3>
              <div className="text-xs space-y-1.5 text-brand-text/80 dark:text-brand-dark-text/80">
                <p>E-mail: <strong className="text-brand-text dark:text-brand-dark-text">{patient.email}</strong></p>
                <p>Telefone: <strong className="text-brand-text dark:text-brand-dark-text">{patient.phone}</strong></p>
                <p>Protocolo Atual: <span className="font-mono font-bold text-primary dark:text-secondary-light">{authorizedHistory.method.toUpperCase()}</span></p>
                <p>Responsável Técnico: <strong>{currentUser.name} ({currentUser.crmOrBadge || currentUser.role})</strong></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── ABA 2: ELETROCARDIOGRAMA & EXAMES ─── */}
      {activeTab === "ecg" && (
        <div className="space-y-6 animate-fadeIn">
          {/* Se houver registro de ECG detalhado, exibe o componente interativo */}
          {currentECG ? (
            <ECGWaveformViewer
              ecgRecord={currentECG}
              onOpenComparator={() => setComparatorOpen(true)}
            />
          ) : (
            <div className="p-8 text-center border border-dashed border-brand-border rounded-xl text-xs text-brand-text/50">
              Nenhum traçado eletrocardiográfico vetorial anexado a este paciente.
            </div>
          )}

          {/* Lista Completa de Laudos e Exames Complementares */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-brand-text dark:text-brand-dark-text uppercase tracking-wider">
              Histórico Completo de Laudos e Exames Complementares
            </h3>
            <div className="overflow-x-auto border border-brand-border dark:border-brand-dark-border rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-brand-bg dark:bg-brand-dark-bg font-bold text-brand-text/70 dark:text-brand-dark-text/70 uppercase text-[10px]">
                  <tr>
                    <th className="p-3">Exame / Procedimento</th>
                    <th className="p-3">Data</th>
                    <th className="p-3">Prestador / Laboratório</th>
                    <th className="p-3">Conclusão Médica / Laudo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border dark:divide-brand-dark-border text-brand-text dark:text-brand-dark-text">
                  {patient.exams.map((ex) => (
                    <tr key={ex.id} className="hover:bg-brand-bg/30 dark:hover:bg-brand-dark-bg/30 transition">
                      <td className="p-3 font-semibold flex items-center gap-2">
                        {ex.type === "cardiology" ? "⚡" : "🧪"} {ex.title}
                      </td>
                      <td className="p-3 whitespace-nowrap">{ex.date}</td>
                      <td className="p-3">{ex.provider}</td>
                      <td className="p-3 max-w-md italic">{ex.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ─── ABA 3: LINHA DO TEMPO UNIFICADA ─── */}
      {activeTab === "timeline" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-brand-border dark:border-brand-dark-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-brand-text dark:text-brand-dark-text">
                Jornada Clínica Interinstitucional Unificada
              </h3>
              <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60">
                Histórico consolidado de atendimentos, exames e internações em múltiplos hospitais e clínicas da rede Open Health.
              </p>
            </div>
          </div>
          <ClinicalTimeline events={patient.timeline} />
        </div>
      )}

      {/* ─── ABA 4: INTEROPERABILIDADE HL7 FHIR R4 ─── */}
      {activeTab === "fhir" && (
        <div className="space-y-4 animate-fadeIn">
          <FHIRResourceTree
            patient={patient}
            hl7BundleString={authorizedHistory.hl7Bundle}
            onDownloadHL7={onDownloadHL7}
          />
        </div>
      )}

      {/* ─── ABA 5: AUDITORIA & CONFORMIDADE LGPD ─── */}
      {activeTab === "audit" && (
        <div className="space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between border-b border-brand-border dark:border-brand-dark-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-brand-text dark:text-brand-dark-text">
                Trilha de Auditoria e Governança LGPD do Prontuário
              </h3>
              <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60">
                Registros imutáveis de cada acesso a este paciente, método de autenticação e identificação de quebra de sigilo.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto border border-brand-border dark:border-brand-dark-border rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-brand-bg dark:bg-brand-dark-bg font-bold text-brand-text/70 dark:text-brand-dark-text/70 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Data/Hora</th>
                  <th className="p-3">Instituição Solicitante</th>
                  <th className="p-3">Profissional / Responsável</th>
                  <th className="p-3">Método de Custódia</th>
                  <th className="p-3">Justificativa / Motivo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border dark:divide-brand-dark-border text-brand-text dark:text-brand-dark-text">
                {patientAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-bg/30 dark:hover:bg-brand-dark-bg/30">
                    <td className="p-3 font-mono text-[11px] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleString("pt-BR")}
                    </td>
                    <td className="p-3 font-semibold">{log.clinicName}</td>
                    <td className="p-3">
                      <div>{log.requesterEmail}</div>
                      <span className="text-[10px] text-brand-text/60 dark:text-brand-dark-text/60">
                        {log.requesterRole || "Profissional Clínico"}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        log.authMethod === "break_the_glass"
                          ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                          : "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300"
                      }`}>
                        {log.authMethod === "break_the_glass" ? "🚨 Break the Glass" : "✓ OTP / DPoP"}
                      </span>
                    </td>
                    <td className="p-3 max-w-xs text-[11px]">
                      {log.justification || "Consulta ambulatorial regular autorizada pelo paciente."}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de Comparação de ECGs */}
      {comparatorOpen && currentECG && previousECG && (
        <ECGComparatorModal
          currentECG={currentECG}
          previousECG={previousECG}
          onClose={() => setComparatorOpen(false)}
        />
      )}
    </div>
  );
}
