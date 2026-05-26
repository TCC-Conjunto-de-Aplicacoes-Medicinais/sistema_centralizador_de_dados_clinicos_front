"use client";

import { Clinic, ClinicUser, AuthorizedHistory } from "../app/mockData";

interface ClinicalDocumentSheetProps {
  history: AuthorizedHistory | null;
  currentClinic: Clinic | null;
  currentUser: ClinicUser | null;
}

export default function ClinicalDocumentSheet({
  history,
  currentClinic,
  currentUser,
}: ClinicalDocumentSheetProps) {
  if (!history || !currentClinic || !currentUser) return null;
  const { patient, method, justification, requesterName, requesterRole, timestamp } = history;
  const formattedDate = new Date(timestamp).toLocaleString("pt-BR");
  const docSerial = `DOC-EHR-${patient.id.toUpperCase()}-${new Date(timestamp).getTime().toString().slice(-6)}`;
  
  // Calculate Age
  const birthYear = new Date(patient.birthDate).getFullYear();
  const currentYear = new Date().getFullYear();
  const age = currentYear - birthYear;

  return (
    <div className="space-y-6 text-slate-800 text-sm leading-relaxed p-2">
      {/* Document Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-slate-900 pb-4 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#1B5E3B] text-white">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h2 className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-900 leading-none">Rede Nacional de Dados de Saúde (RNDS)</h2>
            <h1 className="text-sm sm:text-lg font-black text-[#1B5E3B] mt-1 leading-none">Sumário Clínico do Paciente</h1>
          </div>
        </div>
        <div className="text-left sm:text-right text-[11px] sm:text-xs text-slate-500 font-mono w-full sm:w-auto border-t sm:border-t-0 pt-2 sm:pt-0">
          <p className="font-bold text-slate-800">CÓD: {docSerial}</p>
          <p>Gerado em: {formattedDate}</p>
        </div>
      </div>

      {/* Audit Details */}
      <div className="bg-slate-100 p-4 rounded-lg border border-slate-200 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Solicitação de Dados</p>
          <p className="font-semibold text-slate-800 mt-1">Clínica: <span className="font-medium">{currentClinic.name} ({currentClinic.id})</span></p>
          <p className="font-semibold text-slate-800">Profissional: <span className="font-medium">{currentUser.name} ({currentUser.email})</span></p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-slate-500 font-bold">Método de Autorização</p>
          <div className="mt-1 flex items-center gap-2">
            <span className={`inline-block text-xs font-bold px-2 py-0.5 rounded ${
              method === "token" ? "bg-slate-200 text-slate-700" : "bg-red-200 text-red-800 animate-pulse"
            }`}>
              {method === "token" ? "Código OTP de Celular" : "Acesso de Emergência (Break the Glass)"}
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Alert (Justification) if Break the Glass */}
      {method === "break_the_glass" && (
        <div className="bg-red-50 p-4 rounded-lg border-2 border-red-200 space-y-2">
          <div className="flex items-center gap-2 text-red-700">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0">
              <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            <h3 className="text-xs font-black uppercase tracking-wider">Atenção: Acesso Emergencial Registrado por Força de Lei</h3>
          </div>
          <p className="text-xs text-red-900 font-semibold italic">"Justificativa Médica: {justification}"</p>
          <p className="text-[11px] text-red-800">
            Profissional Declarado Responsável: <span className="font-bold">{requesterName}</span> ({requesterRole})
          </p>
        </div>
      )}

      {/* Patient Demographics */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#1B5E3B] border-b border-slate-200 pb-1">Identificação do Paciente</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <p className="text-slate-500 font-medium">Nome Completo</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{patient.name}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">CPF do Paciente</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Data de Nascimento</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{new Date(patient.birthDate).toLocaleDateString("pt-BR")} ({age} anos)</p>
          </div>
          <div>
            <p className="text-slate-500 font-medium">Celular / Contato</p>
            <p className="font-bold text-slate-800 text-sm mt-0.5">{patient.phone}</p>
          </div>
        </div>
      </div>

      {/* Clinical Overview Grid (Allergies & Medications) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Allergies */}
        <div className="space-y-2 border border-slate-200 p-4 rounded-lg bg-slate-50/50">
          <h4 className="text-xs font-black uppercase tracking-wider text-red-700 flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-red-600"></span>
            Alergias e Reações Adversas
          </h4>
          {patient.allergies.length > 0 ? (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {patient.allergies.map((allergy, i) => (
                <span key={i} className="bg-red-100 text-red-800 border border-red-200 text-[10px] font-bold px-2 py-0.5 rounded">
                  {allergy}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Sem registros de alergia.</p>
          )}
        </div>

        {/* Medications */}
        <div className="space-y-2 border border-slate-200 p-4 rounded-lg bg-slate-50/50">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#1B5E3B] flex items-center gap-1">
            <span className="inline-block w-2 h-2 rounded-full bg-[#00C853]"></span>
            Medicamentos de Uso Contínuo
          </h4>
          {patient.medications.length > 0 ? (
            <ul className="space-y-1 text-xs text-slate-700">
              {patient.medications.map((med, i) => (
                <li key={i} className="flex items-start gap-1">
                  <span className="text-[#1B5E3B] font-bold">•</span>
                  <span>{med}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic">Sem registros de uso contínuo.</p>
          )}
        </div>
      </div>

      {/* Diagnostic Reports Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-black uppercase tracking-wider text-[#1B5E3B] border-b border-slate-200 pb-1">Histórico de Exames e Diagnósticos</h3>
        {patient.exams.length > 0 ? (
          <div className="border border-slate-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-700 font-bold uppercase tracking-wider text-[9px] border-b border-slate-200">
                <tr>
                  <th className="p-2 border-r border-slate-200">Procedimento / Exame</th>
                  <th className="p-2 border-r border-slate-200">Data</th>
                  <th className="p-2 border-r border-slate-200">Clínica Emissora</th>
                  <th className="p-2">Laudo Clínico / Conclusão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {patient.exams.map((exam) => (
                  <tr key={exam.id} className="text-slate-800 bg-white">
                    <td className="p-2 border-r border-slate-200 font-bold">{exam.title}</td>
                    <td className="p-2 border-r border-slate-200 whitespace-nowrap">{new Date(exam.date).toLocaleDateString("pt-BR")}</td>
                    <td className="p-2 border-r border-slate-200">{exam.provider}</td>
                    <td className="p-2 italic text-slate-600">{exam.result}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-4 text-center border border-dashed border-slate-200 rounded-lg bg-slate-50/50">
            <p className="text-xs text-slate-500 italic">Nenhum exame clínico compartilhado na rede para este paciente.</p>
          </div>
        )}
      </div>

      {/* Legal footer & Signature block */}
      <div className="pt-6 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-[10px] text-slate-500 max-w-md text-center sm:text-left">
          <p className="font-bold uppercase tracking-wider">Declaração de Legitimidade</p>
          <p>Os dados apresentados são consolidados através do ecossistema centralizador do paciente e transmitidos eletronicamente. Esta cópia impressa serve apenas para fins de sumário médico temporário.</p>
        </div>
        <div className="flex flex-col items-center border border-slate-300 p-2.5 rounded bg-slate-50 min-w-[200px]">
          <span className="text-[8px] font-black uppercase text-emerald-800 tracking-wider">ASSINATURA DIGITAL</span>
          <div className="my-1 border-t border-dashed border-slate-400 w-full"></div>
          <p className="text-[9px] font-bold text-slate-800 leading-tight">ICP-Brasil Autenticado</p>
          <p className="text-[8px] text-slate-500 font-mono mt-0.5">SHA-256: {docSerial.replace(/-/g, "").toLowerCase()}</p>
        </div>
      </div>
    </div>
  );
}
