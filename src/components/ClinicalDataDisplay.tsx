"use client";

import { Clinic, AuthorizedHistory } from "../app/mockData";

interface ClinicalDataDisplayProps {
  authorizedHistory: AuthorizedHistory | null;
  currentClinic: Clinic;
  onShowPrintPreview: () => void;
  onDownloadHL7: () => void;
}

export default function ClinicalDataDisplay({
  authorizedHistory,
  currentClinic,
  onShowPrintPreview,
  onDownloadHL7,
}: ClinicalDataDisplayProps) {
  if (!authorizedHistory) return null;

  return (
    <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-6 shadow-sm space-y-6 animate-fadeIn">
      <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-brand-border dark:border-brand-dark-border pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-lg font-bold text-brand-text dark:text-brand-dark-text">Acesso Liberado ao Prontuário</h2>
            <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60">
              Autorizado via {authorizedHistory.method === "token" ? "Código OTP" : "Acesso Crítico"}
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <button
            onClick={onShowPrintPreview}
            className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 rounded-lg text-xs transition shadow-sm w-full sm:w-auto font-sans cursor-pointer"
            title="Visualizar documento sumarizado em tela e gerar PDF para impressão"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
            Visualizar PDF / Sumário
          </button>

          <button
            onClick={authorizedHistory.method === "break_the_glass" ? undefined : onDownloadHL7}
            disabled={authorizedHistory.method === "break_the_glass"}
            className={`flex items-center justify-center gap-1.5 font-semibold px-3 py-2 rounded-lg text-xs transition shadow-sm w-full sm:w-auto font-sans ${
              authorizedHistory.method === "break_the_glass"
                ? "bg-slate-300 dark:bg-slate-800 text-slate-500 dark:text-slate-600 cursor-not-allowed opacity-60 border border-brand-border dark:border-brand-dark-border"
                : "bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            }`}
            title={
              authorizedHistory.method === "break_the_glass"
                ? "Download desabilitado em acessos de emergência (Break the Glass)"
                : "Baixar prontuário completo no formato de interoperabilidade HL7 FHIR JSON"
            }
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path d="M10.75 2.75a.75.75 0 00-1.5 0v8.614L6.295 8.275a.75.75 0 10-1.09 1.03l4.25 4.5a.75.75 0 001.09 0l4.25-4.5a.75.75 0 00-1.09-1.03l-2.955 3.089V2.75z" />
              <path d="M16.25 11.75a.75.75 0 00-1.5 0v3.5a.75.75 0 01-.75.75H6a.75.75 0 01-.75-.75v-3.5a.75.75 0 00-1.5 0v3.5A2.25 2.25 0 006 17.5h8a2.25 2.25 0 002.25-2.25v-3.5z" />
            </svg>
            Baixar HL7 FHIR
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Allergies list */}
        <div className="bg-brand-bg/50 dark:bg-brand-dark-bg/50 p-4 rounded-xl border border-brand-border dark:border-brand-dark-border space-y-3">
          <h3 className="text-sm font-bold text-red-600 dark:text-red-400 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Alergias e Alérgenos
          </h3>
          {authorizedHistory.patient.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {authorizedHistory.patient.allergies.map((allergy, i) => (
                <span
                  key={i}
                  className="bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-900/50 text-[10px] font-semibold px-2 py-0.5 rounded"
                >
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-brand-text/50 dark:text-brand-dark-text/50">Nenhuma alergia cadastrada.</p>
          )}
        </div>

        {/* Medications list */}
        <div className="bg-brand-bg/50 dark:bg-brand-dark-bg/50 p-4 rounded-xl border border-brand-border dark:border-brand-dark-border space-y-3">
          <h3 className="text-sm font-bold text-primary dark:text-secondary-light flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A.75.75 0 008.8 8v4a.75.75 0 00.755.832l2.5-1a.75.75 0 00-.01-1.392l-2.49-1.272V8a.75.75 0 00-.01-.832z" clipRule="evenodd" />
            </svg>
            Uso Contínuo
          </h3>
          {authorizedHistory.patient.medications.length > 0 ? (
            <ul className="space-y-1.5">
              {authorizedHistory.patient.medications.map((med, i) => (
                <li key={i} className="text-xs flex items-start gap-1.5 text-brand-text dark:text-brand-dark-text">
                  <span className="text-primary dark:text-secondary-light mt-0.5">•</span>
                  <span className="leading-tight">{med}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-brand-text/50 dark:text-brand-dark-text/50">Nenhum medicamento ativo informado.</p>
          )}
        </div>

        {/* General Health info */}
        <div className="bg-brand-bg/50 dark:bg-brand-dark-bg/50 p-4 rounded-xl border border-brand-border dark:border-brand-dark-border space-y-2">
          <h3 className="text-sm font-bold text-brand-text dark:text-brand-dark-text flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-primary dark:text-secondary-light">
              <path d="M10 8a3 3 0 100-6 3 3 0 000 6zM8 8a5 5 0 00-1 1v3a.75.75 0 001.5 0V9a1.5 1.5 0 003 0v3a.75.75 0 001.5 0V9a5 5 0 00-1-1H8z" />
            </svg>
            Informações de Contato
          </h3>
          <div className="text-xs space-y-1 text-brand-text/80 dark:text-brand-dark-text/80">
            <p>E-mail: <span className="font-semibold text-brand-text dark:text-brand-dark-text">{authorizedHistory.patient.email}</span></p>
            <p>Celular: <span className="font-semibold text-brand-text dark:text-brand-dark-text">{authorizedHistory.patient.phone}</span></p>
            <p>Formato de Rede: <span className="font-bold text-primary dark:text-secondary-light uppercase">{currentClinic.type === "partner" ? "HL7 FHIR JSON" : "Sincronização Direta"}</span></p>
          </div>
        </div>
      </div>

      {/* Exam reports section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-brand-text dark:text-brand-dark-text uppercase tracking-wider">
          Registros de Laudos e Exames Compartilhados
        </h3>
        {authorizedHistory.patient.exams.length > 0 ? (
          <div className="w-full">
            {/* Desktop View */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="w-full text-left text-xs border border-brand-border dark:border-brand-dark-border rounded-lg overflow-hidden">
                <thead className="bg-brand-bg dark:bg-brand-dark-bg font-bold text-brand-text/70 dark:text-brand-dark-text/70 uppercase tracking-wider text-[9px]">
                  <tr>
                    <th className="p-2.5 border-b border-brand-border dark:border-brand-dark-border">Exame</th>
                    <th className="p-2.5 border-b border-brand-border dark:border-brand-dark-border">Data</th>
                    <th className="p-2.5 border-b border-brand-border dark:border-brand-dark-border">Clínica Laboratório</th>
                    <th className="p-2.5 border-b border-brand-border dark:border-brand-dark-border">Laudo Final / Conclusão</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-brand-border dark:divide-brand-dark-border">
                  {authorizedHistory.patient.exams.map((exam) => (
                    <tr key={exam.id} className="hover:bg-brand-bg/25 dark:hover:bg-brand-dark-bg/25 text-brand-text dark:text-brand-dark-text transition">
                      <td className="p-2.5 font-semibold">{exam.title}</td>
                      <td className="p-2.5 whitespace-nowrap">{new Date(exam.date).toLocaleDateString("pt-BR")}</td>
                      <td className="p-2.5">{exam.provider}</td>
                      <td className="p-2.5 max-w-xs">{exam.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            {/* Mobile Cards View */}
            <div className="block sm:hidden space-y-3">
              {authorizedHistory.patient.exams.map((exam) => (
                <div key={exam.id} className="p-3.5 rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-bg/25 dark:bg-brand-dark-bg/25 space-y-2">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-brand-text dark:text-brand-dark-text">{exam.title}</h4>
                    <span className="text-[10px] text-brand-text/50 dark:text-brand-dark-text/50 whitespace-nowrap font-medium">
                      {new Date(exam.date).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                  <p className="text-[11px] text-brand-text/70 dark:text-brand-dark-text/70">
                    <strong>Clínica:</strong> {exam.provider}
                  </p>
                  <div className="p-2.5 rounded bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border mt-1">
                    <p className="text-[11px] text-brand-text/80 dark:text-brand-dark-text/80 italic leading-relaxed">
                      {exam.result}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-5 text-center border border-dashed border-brand-border rounded-lg">
            <p className="text-xs text-brand-text/50 dark:text-brand-dark-text/50">Nenhum exame ou laudo anexado ao prontuário digital deste paciente.</p>
          </div>
        )}
      </div>

      {/* HL7 JSON Display */}
      <div className="space-y-2 border-t border-brand-border dark:border-brand-dark-border pt-4">
        <h3 className="text-xs font-bold text-brand-text dark:text-brand-dark-text uppercase tracking-wider">
          Visualização HL7 FHIR JSON Bundle (Modelo Gerado)
        </h3>
        <pre className="p-3.5 rounded-lg bg-slate-900 text-slate-300 text-[10px] font-mono overflow-auto max-h-52 border border-slate-800">
          {authorizedHistory.hl7Bundle}
        </pre>
      </div>
    </div>
  );
}
