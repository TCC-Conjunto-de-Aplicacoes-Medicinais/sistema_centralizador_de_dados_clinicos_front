"use client";

import { Clinic, AuditLog } from "../app/mockData";

interface AuditLogsTableProps {
  filteredAuditLogs: AuditLog[];
  currentClinic: Clinic;
}

export default function AuditLogsTable({
  filteredAuditLogs,
  currentClinic,
}: AuditLogsTableProps) {
  return (
    <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-brand-text dark:text-brand-dark-text flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary dark:text-secondary-light">
            <path fillRule="evenodd" d="M10 2a8 8 0 100 16 8 8 0 000-16zm.75 4.75a.75.75 0 00-1.5 0v5.25H6.5a.75.75 0 000 1.5h5a.75.75 0 00.75-.75V6.75z" clipRule="evenodd" />
          </svg>
          Logs de Auditoria de Acesso ({currentClinic.name})
        </h2>
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 px-2 py-0.5 rounded border border-red-200 dark:border-red-900/40">
          Isolado por Clínica (Segurança)
        </span>
      </div>
      <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60">
        Conforme regras de conformidade e privacidade médica, você está visualizando estritamente as ações de requisição originadas pela sua clínica (<strong className="text-brand-text dark:text-brand-dark-text">{currentClinic.name}</strong>). Logs de outras instituições estão ocultos.
      </p>

      {filteredAuditLogs.length > 0 ? (
        <div className="w-full">
          {/* Desktop View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs border border-brand-border dark:border-brand-dark-border rounded-lg overflow-hidden">
              <thead className="bg-brand-bg dark:bg-brand-dark-bg font-bold text-brand-text/70 dark:text-brand-dark-text/70 uppercase tracking-wider text-[9px]">
                <tr>
                  <th className="p-2.5 border-b border-brand-border dark:border-brand-dark-border">Data/Hora</th>
                  <th className="p-2.5 border-b border-brand-border dark:border-brand-dark-border">Operador (E-mail)</th>
                  <th className="p-2.5 border-b border-brand-border dark:border-brand-dark-border">Paciente</th>
                  <th className="p-2.5 border-b border-brand-border dark:border-brand-dark-border">Tipo</th>
                  <th className="p-2.5 border-b border-brand-border dark:border-brand-dark-border">Autorização</th>
                  <th className="p-2.5 border-b border-brand-border dark:border-brand-dark-border">Justificativa / Motivo de Acesso Crítico</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-border dark:divide-brand-dark-border">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-brand-bg/25 dark:hover:bg-brand-dark-bg/25 text-brand-text dark:text-brand-dark-text transition">
                    <td className="p-2.5 whitespace-nowrap">{new Date(log.timestamp).toLocaleString("pt-BR")}</td>
                    <td className="p-2.5 font-mono">{log.requesterEmail}</td>
                    <td className="p-2.5 font-semibold">{log.patientName}</td>
                    <td className="p-2.5">
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        log.requestType === "direct"
                          ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                          : "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                      }`}>
                        {log.requestType === "direct" ? "Direto API" : "Export HL7"}
                      </span>
                    </td>
                    <td className="p-2.5">
                      <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                        log.authMethod === "token"
                          ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                          : "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-extrabold animate-pulse"
                      }`}>
                        {log.authMethod === "token" ? "OTP Código" : "Break The Glass"}
                      </span>
                    </td>
                    <td className="p-2.5 max-w-xs text-brand-text/75 dark:text-brand-dark-text/75 italic">
                      {log.justification ? (
                        <span title={log.justification} className="line-clamp-1 text-red-600 dark:text-red-400 font-medium">
                          {log.justification}
                        </span>
                      ) : (
                        <span className="text-brand-text/40 dark:text-brand-dark-text/40">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="block md:hidden space-y-3">
            {filteredAuditLogs.map((log) => (
              <div key={log.id} className="p-4 rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-bg/25 dark:bg-brand-dark-bg/25 space-y-2 text-xs">
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[10px] font-mono text-brand-text/50 dark:text-brand-dark-text/50">
                    {new Date(log.timestamp).toLocaleString("pt-BR")}
                  </span>
                  <div className="flex gap-1.5 shrink-0">
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      log.requestType === "direct"
                        ? "bg-green-100 dark:bg-green-950/40 text-green-700 dark:text-green-400"
                        : "bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400"
                    }`}>
                      {log.requestType === "direct" ? "Direto" : "HL7"}
                    </span>
                    <span className={`inline-block text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      log.authMethod === "token"
                        ? "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300"
                        : "bg-red-100 dark:bg-red-950/40 text-red-700 dark:text-red-400 font-extrabold"
                    }`}>
                      {log.authMethod === "token" ? "OTP" : "Break Glass"}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-1">
                  <p className="text-brand-text dark:text-brand-dark-text">
                    <strong>Operador:</strong> <span className="font-mono text-[11px] break-all">{log.requesterEmail}</span>
                  </p>
                  <p className="text-brand-text dark:text-brand-dark-text">
                    <strong>Paciente:</strong> <span className="font-semibold">{log.patientName}</span>
                  </p>
                  {log.justification && (
                    <div className="mt-1.5 p-2 rounded bg-red-500/5 dark:bg-red-500/10 border border-red-500/10 text-red-700 dark:text-red-400">
                      <p className="text-[10px] italic">
                        <strong>Motivo:</strong> {log.justification}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-6 text-center border border-dashed border-brand-border rounded-lg bg-brand-bg/10 dark:bg-brand-dark-bg/10">
          <p className="text-xs text-brand-text/50 dark:text-brand-dark-text/50">Nenhuma consulta registrada para esta clínica até o momento.</p>
        </div>
      )}
    </div>
  );
}
