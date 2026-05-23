"use client";

import { useState, useEffect } from "react";
import {
  Patient,
  Clinic,
  ClinicUser,
  AuditLog,
  mockClinics,
  mockClinicUsers,
  mockPatients,
  initialAuditLogs,
  generateHL7FHIRBundle
} from "./mockData";

export default function MediatorPage() {
  // Theme State (default to light / white mode)
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Sync theme with DOM element
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Auth State
  const [clinicCode, setClinicCode] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [currentUser, setCurrentUser] = useState<ClinicUser | null>(null);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);

  // Dashboard State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Authorization States
  const [authMethod, setAuthMethod] = useState<"token" | "break_the_glass">("token");
  const [otpCode, setOtpCode] = useState("");
  const [justification, setJustification] = useState("");
  const [requesterName, setRequesterName] = useState("");
  const [requesterRole, setRequesterRole] = useState("");
  const [requestError, setRequestError] = useState("");
  
  // Authorized Patient History View
  const [authorizedHistory, setAuthorizedHistory] = useState<{
    patient: Patient;
    method: "token" | "break_the_glass";
    justification?: string;
    requesterName?: string;
    requesterRole?: string;
    hl7Bundle: string;
    timestamp: string;
  } | null>(null);

  // PDF / Document Print Preview Modal State
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Filter audit logs: Only show logs belonging to the currently logged in clinic
  const filteredAuditLogs = currentClinic 
    ? auditLogs.filter(log => log.clinicName.toLowerCase() === currentClinic.name.toLowerCase())
    : [];

  // Login handler
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    const user = mockClinicUsers.find(
      (u) => u.clinicId.toUpperCase() === clinicCode.toUpperCase() && u.email.toLowerCase() === email.toLowerCase()
    );

    if (!user || user.passwordHash !== password) {
      setAuthError("Credenciais inválidas. Verifique o código da clínica, e-mail e senha.");
      return;
    }

    const clinic = mockClinics.find((c) => c.id === user.clinicId);
    if (!clinic) {
      setAuthError("Erro de sistema: clínica não localizada.");
      return;
    }

    setCurrentUser(user);
    setCurrentClinic(clinic);
    
    // Set default requester details for Break the Glass
    setRequesterName(user.name);
    setRequesterRole(user.role);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentClinic(null);
    setSelectedPatient(null);
    setAuthorizedHistory(null);
    setShowPrintPreview(false);
    setSearchQuery("");
    setSearchResults([]);
    setOtpCode("");
    setJustification("");
  };

  // Perform search query
  const performSearch = (query: string) => {
    setAuthorizedHistory(null);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const cleanQuery = query.replace(/\D/g, ""); // Remove non-digits
    const results = mockPatients.filter((p) => {
      const matchCpf = cleanQuery && p.cpf.includes(cleanQuery);
      const matchName = p.name.toLowerCase().includes(query.toLowerCase());
      return matchCpf || matchName;
    });

    setSearchResults(results);
    if (results.length > 0) {
      setSelectedPatient(results[0]);
    } else {
      setSelectedPatient(null);
    }
  };

  // Search submit handler
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  // Request Data handler
  const handleRequestData = (e: React.FormEvent) => {
    e.preventDefault();
    setRequestError("");

    if (!selectedPatient || !currentClinic || !currentUser) return;

    if (authMethod === "token") {
      if (otpCode !== selectedPatient.otpToken) {
        setRequestError("Código autorizador inválido. Solicite um novo código gerado no aplicativo do paciente.");
        return;
      }
    } else {
      if (!justification.trim()) {
        setRequestError("A justificativa clínica/médica é obrigatória para o acesso crítico (Break the Glass).");
        return;
      }
      if (!requesterName.trim() || !requesterRole.trim()) {
        setRequestError("Por favor, preencha os dados do profissional solicitante.");
        return;
      }
    }

    // Success - Grant Access
    const hl7Str = generateHL7FHIRBundle(selectedPatient);
    const requestTime = new Date().toISOString();
    setAuthorizedHistory({
      patient: selectedPatient,
      method: authMethod,
      justification: authMethod === "break_the_glass" ? justification : undefined,
      requesterName: authMethod === "break_the_glass" ? requesterName : currentUser.name,
      requesterRole: authMethod === "break_the_glass" ? requesterRole : currentUser.role,
      hl7Bundle: hl7Str,
      timestamp: requestTime
    });

    // Add to audit log
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      clinicName: currentClinic.name,
      requesterEmail: currentUser.email,
      patientName: selectedPatient.name,
      authMethod: authMethod,
      requestType: currentClinic.type === "partner" ? "hl7_download" : "direct",
      justification: authMethod === "break_the_glass" ? justification : undefined,
      timestamp: requestTime
    };

    setAuditLogs([newLog, ...auditLogs]);
  };

  // Instant HL7 Exporter for Sandbox
  const handleInstantHL7Export = (patient: Patient) => {
    const hl7Str = generateHL7FHIRBundle(patient);
    const blob = new Blob([hl7Str], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `sandbox_hl7_fhir_${patient.name.toLowerCase().replace(/\s+/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // If logged in, log the export
    if (currentClinic && currentUser) {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        clinicName: currentClinic.name,
        requesterEmail: currentUser.email,
        patientName: patient.name,
        authMethod: "token",
        requestType: "hl7_download",
        timestamp: new Date().toISOString()
      };
      setAuditLogs([newLog, ...auditLogs]);
    }
  };

  // Download HL7 File for current query
  const handleDownloadHL7 = () => {
    if (!authorizedHistory) return;
    const blob = new Blob([authorizedHistory.hl7Bundle], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `hl7_fhir_bundle_${authorizedHistory.patient.name.toLowerCase().replace(/\s+/g, "_")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Trigger Browser Print Dialog
  const handlePrintDocument = () => {
    window.print();
  };

  // Theme Toggle Button Component
  const ThemeToggle = () => (
    <button
      onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border dark:border-brand-dark-border text-brand-text/75 dark:text-brand-dark-text/75 hover:bg-slate-100 dark:hover:bg-brand-dark-border transition duration-200"
      title={theme === "light" ? "Mudar para Modo Escuro" : "Mudar para Modo Claro"}
    >
      {theme === "light" ? (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21M4.22 4.22l1.58 1.58m12.42 12.42l1.58 1.58M3 12h2.25m13.5 0H21M6.002 18a6.002 6.002 0 1112 0 6.002 6.002 0 01-12 0z" />
        </svg>
      )}
    </button>
  );

  // Clinical Summary Document Render Block (reused on modal preview and printable stylesheet wrapper)
  const renderClinicalDocumentSheet = (history: typeof authorizedHistory) => {
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
        <div className="flex justify-between items-center border-b-2 border-slate-900 pb-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1B5E3B] text-white">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 leading-none">Rede Nacional de Dados de Saúde (RNDS)</h2>
              <h1 className="text-lg font-black text-[#1B5E3B] mt-1 leading-none">Sumário Clínico do Paciente</h1>
            </div>
          </div>
          <div className="text-right text-xs text-slate-500 font-mono">
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
  };

  // Login View
  if (!currentUser || !currentClinic) {
    return (
      <div className={theme === "dark" ? "dark bg-brand-dark-bg text-brand-dark-text min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200" : "bg-brand-bg text-brand-text min-h-screen flex items-center justify-center px-4 py-12 sm:px-6 lg:px-8 transition-colors duration-200"}>
        <div className="absolute top-4 right-4">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md space-y-6 bg-brand-paper dark:bg-brand-dark-paper p-8 rounded-2xl border border-brand-border dark:border-brand-dark-border shadow-xl hover-scale">
          <div className="flex flex-col items-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-white shadow-md">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-primary dark:text-secondary-light">
              Mediador Clínico
            </h2>
            <p className="mt-2 text-center text-sm text-brand-text/60 dark:text-brand-dark-text/60">
              Centralizador de Dados do Prontuário Unificado
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleLogin}>
            {authError && (
              <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-sm text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                </svg>
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                  Código da Clínica (Ex: CLI-1001)
                </label>
                <input
                  type="text"
                  required
                  value={clinicCode}
                  onChange={(e) => setClinicCode(e.target.value)}
                  placeholder="CLI-XXXX"
                  className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent px-4 py-2 text-brand-text dark:text-brand-dark-text placeholder-slate-400 dark:placeholder-slate-600 focus:border-primary dark:focus:border-secondary focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                  E-mail de Acesso
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nome@clinica.com.br"
                  className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent px-4 py-2 text-brand-text dark:text-brand-dark-text placeholder-slate-400 dark:placeholder-slate-600 focus:border-primary dark:focus:border-secondary focus:outline-none transition"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                  Senha
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent px-4 py-2 text-brand-text dark:text-brand-dark-text placeholder-slate-400 dark:placeholder-slate-600 focus:border-primary dark:focus:border-secondary focus:outline-none transition"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-primary to-primary-light hover:from-primary-dark hover:to-primary py-2.5 px-4 text-sm font-semibold text-white shadow-md focus:outline-none hover:shadow-lg transition-all duration-200"
              >
                Autenticar no Mediador
              </button>
            </div>
            
            <div className="text-center text-xs text-brand-text/50 dark:text-brand-dark-text/50 pt-2 border-t border-brand-border dark:border-brand-dark-border">
              <p>Demo Logins (Código | E-mail | Senha: senha123):</p>
              <p className="font-mono mt-1 leading-relaxed">
                CLI-1001 | roberto.silva@vida.com.br (Integrada)<br />
                CLI-3003 | ana.paula@cardiocentro.com.br (Parceira)
              </p>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Dashboard View
  return (
    <div className={theme === "dark" ? "dark bg-brand-dark-bg text-brand-dark-text min-h-screen transition-colors duration-200" : "bg-brand-bg text-brand-text min-h-screen transition-colors duration-200"}>
      
      {/* Screen Layout - Hidden during printing */}
      <div className="no-print flex flex-col min-h-screen">
        
        {/* Top Header */}
        <header className="sticky top-0 z-10 bg-brand-paper/90 dark:bg-brand-dark-paper/90 backdrop-blur-md border-b border-brand-border dark:border-brand-dark-border px-6 py-4 transition-colors duration-200">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white shadow-sm">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary dark:text-secondary-light">Mediador Clínico</h1>
                <p className="text-xs text-brand-text/60 dark:text-brand-dark-text/60 font-medium">TCC - Centralizador de Registros de Exames e Diagnósticos</p>
              </div>
            </div>

            {/* Connected User Profile & Theme Switcher */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              <div className="text-right">
                <p className="text-sm font-semibold text-brand-text dark:text-brand-dark-text">{currentUser.name}</p>
                <p className="text-xs text-brand-text/70 dark:text-brand-dark-text/70">
                  {currentUser.role} • <span className="font-bold">{currentClinic.name} ({currentClinic.id})</span>
                </p>
                <div className="mt-1 flex items-center justify-end gap-1.5">
                  <span className={`inline-block h-2.5 w-2.5 rounded-full ${currentClinic.type === "internal" ? "bg-green-500" : "bg-blue-500"}`}></span>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-text/60 dark:text-brand-dark-text/60">
                    {currentClinic.type === "internal" ? "Clínica Integrada" : "Clínica Parceira (HL7)"}
                  </span>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="flex h-10 w-10 items-center justify-center rounded-lg border border-brand-border dark:border-brand-dark-border text-brand-text/75 dark:text-brand-dark-text/75 hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-900/50 transition-all duration-200"
                title="Sair do Sistema"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
              </button>
            </div>
          </div>
        </header>

        {/* Main Workspace Layout */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Search & Patient Database (Sandbox) */}
            <div className="lg:col-span-1 space-y-6">
              
              {/* Patient Search card */}
              <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-brand-text dark:text-brand-dark-text flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary dark:text-secondary-light">
                    <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
                  </svg>
                  Buscar Paciente
                </h2>

                <form onSubmit={handleSearchSubmit} className="space-y-3">
                  <div className="relative">
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Nome ou CPF"
                      className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-transparent pl-4 pr-10 py-2 text-sm text-brand-text dark:text-brand-dark-text placeholder-slate-400 focus:border-primary focus:outline-none transition"
                    />
                    {searchQuery && (
                      <button
                        type="button"
                        onClick={() => {
                          setSearchQuery("");
                          setSearchResults([]);
                          setSelectedPatient(null);
                          setAuthorizedHistory(null);
                        }}
                        className="absolute right-3 top-2.5 text-brand-text/40 dark:text-brand-dark-text/40 hover:text-brand-text dark:hover:text-brand-dark-text"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                          <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                        </svg>
                      </button>
                    )}
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-lg bg-primary hover:bg-primary-dark text-white text-sm font-semibold py-2 transition"
                  >
                    Buscar Prontuário
                  </button>
                </form>

                {/* Results list */}
                {searchResults.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-brand-border dark:border-brand-dark-border">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-brand-text/50 dark:text-brand-dark-text/50">
                      Resultados da Busca ({searchResults.length})
                    </p>
                    <div className="space-y-1">
                      {searchResults.map((patient) => (
                        <button
                          key={patient.id}
                          onClick={() => {
                            setSelectedPatient(patient);
                            setAuthorizedHistory(null);
                            setRequestError("");
                          }}
                          className={`w-full text-left p-2.5 rounded-lg border transition ${
                            selectedPatient?.id === patient.id
                              ? "bg-primary/5 dark:bg-primary-dark/20 border-primary dark:border-secondary-light text-brand-text dark:text-brand-dark-text"
                              : "bg-brand-bg/50 dark:bg-brand-dark-bg/50 border-brand-border dark:border-brand-dark-border text-brand-text/80 dark:text-brand-dark-text/80 hover:bg-brand-bg dark:hover:bg-brand-dark-bg"
                          }`}
                        >
                          <p className="text-xs font-bold">{patient.name}</p>
                          <div className="flex items-center justify-between mt-0.5 text-[10px] text-brand-text/60 dark:text-brand-dark-text/60">
                            <span>CPF: {patient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</span>
                            <span>Nasc: {new Date(patient.birthDate).toLocaleDateString("pt-BR")}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Sandbox Database Panel */}
              <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 text-primary dark:text-secondary-light">
                    <path fillRule="evenodd" d="M4.5 2A2.5 2.5 0 002 4.5v11A2.5 2.5 0 004.5 18h11a2.5 2.5 0 002.5-2.5v-11A2.5 2.5 0 0015.5 2h-11zM4.337 9.17a.75.75 0 011.06 0L8.5 12.273l6.103-6.103a.75.75 0 111.06 1.06l-6.633 6.634a.75.75 0 01-1.06 0L4.337 10.23a.75.75 0 010-1.06z" clipRule="evenodd" />
                  </svg>
                  <h2 className="text-sm font-bold uppercase tracking-wider text-brand-text dark:text-brand-dark-text">Base de Pacientes (Sandbox)</h2>
                </div>
                <p className="text-[11px] text-brand-text/60 dark:text-brand-dark-text/60">
                  Banco de simulação. Clique em <strong className="text-primary dark:text-secondary-light">Preencher</strong> para buscar, ou <strong className="text-blue-600 dark:text-blue-400">HL7</strong> para baixar o JSON modelo.
                </p>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {mockPatients.map((patient) => (
                    <div
                      key={patient.id}
                      className="p-3 rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-bg/25 dark:bg-brand-dark-bg/25 space-y-2 hover:border-slate-300 dark:hover:border-brand-dark-border transition"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <div>
                          <h4 className="text-xs font-bold text-brand-text dark:text-brand-dark-text">{patient.name}</h4>
                          <p className="text-[10px] text-brand-text/50 dark:text-brand-dark-text/50 font-mono">
                            CPF: {patient.cpf}
                          </p>
                        </div>
                        <span className="bg-primary/10 dark:bg-secondary/15 text-primary-dark dark:text-secondary-light text-[9px] font-bold px-1.5 py-0.5 rounded font-mono" title="Token OTP Ativo">
                          OTP: {patient.otpToken}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setSearchQuery(patient.cpf);
                            performSearch(patient.cpf);
                          }}
                          className="flex-1 text-center bg-brand-paper dark:bg-brand-dark-paper hover:bg-slate-50 dark:hover:bg-brand-dark-border border border-brand-border dark:border-brand-dark-border text-brand-text dark:text-brand-dark-text text-[10px] py-1 rounded font-semibold transition"
                        >
                          Preencher
                        </button>
                        <button
                          onClick={() => handleInstantHL7Export(patient)}
                          className="flex-1 text-center bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-900/40 text-blue-600 dark:text-blue-400 text-[10px] py-1 rounded font-semibold transition"
                          title="Exportar exemplo HL7 FHIR deste paciente"
                        >
                          Exportar HL7
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Right/Middle Column: Request Panel & Data Display */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Patient Request Details card */}
              <div className="bg-brand-paper dark:bg-brand-dark-paper border border-brand-border dark:border-brand-dark-border rounded-xl p-5 shadow-sm">
                {selectedPatient ? (
                  <div className="space-y-5">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-brand-border dark:border-brand-dark-border pb-4 gap-2">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider bg-primary/10 dark:bg-secondary/15 text-primary-dark dark:text-secondary-light px-2 py-0.5 rounded-full">
                          Paciente Selecionado
                        </span>
                        <h3 className="text-xl font-extrabold text-brand-text dark:text-brand-dark-text mt-1">{selectedPatient.name}</h3>
                      </div>
                      <div className="text-xs text-brand-text/60 dark:text-brand-dark-text/60 space-y-0.5 sm:text-right">
                        <p>CPF: <span className="font-semibold text-brand-text dark:text-brand-dark-text">{selectedPatient.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4")}</span></p>
                        <p>Nascimento: <span className="font-semibold text-brand-text dark:text-brand-dark-text">{new Date(selectedPatient.birthDate).toLocaleDateString("pt-BR")}</span></p>
                      </div>
                    </div>

                    {/* Form to Request Data */}
                    <form onSubmit={handleRequestData} className="space-y-4">
                      {requestError && (
                        <div className="rounded-lg bg-red-50 dark:bg-red-950/30 p-3 text-xs text-red-600 dark:text-red-400 border border-red-200 dark:border-red-900/50 flex items-start gap-2">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          <span>{requestError}</span>
                        </div>
                      )}

                      {/* Mode selector */}
                      <div className="grid grid-cols-2 gap-2 bg-brand-bg dark:bg-brand-dark-bg p-1 rounded-lg">
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMethod("token");
                            setRequestError("");
                          }}
                          className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                            authMethod === "token"
                              ? "bg-brand-paper dark:bg-brand-dark-paper text-primary dark:text-secondary-light shadow-sm"
                              : "text-brand-text/60 dark:text-brand-dark-text/60 hover:text-brand-text dark:hover:text-brand-dark-text"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M10 1a4.5 4.5 0 00-4.5 4.5V9H5a2 2 0 00-2 2v6a2 2 0 002 2h10a2 2 0 002-2v-6a2 2 0 00-2-2h-.5V5.5A4.5 4.5 0 0010 1zm3 8V5.5a3 3 0 10-6 0V9h6z" clipRule="evenodd" />
                          </svg>
                          Código OTP do Paciente
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAuthMethod("break_the_glass");
                            setRequestError("");
                          }}
                          className={`flex items-center justify-center gap-2 py-2 text-xs font-semibold rounded-md transition-all ${
                            authMethod === "break_the_glass"
                              ? "bg-red-500 text-white shadow-sm"
                              : "text-brand-text/60 dark:text-brand-dark-text/60 hover:text-red-500"
                          }`}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M8.485 2.495c.673-1.167 2.357-1.167 3.03 0l6.28 10.875c.673 1.167-.17 2.625-1.516 2.625H3.72c-1.347 0-2.189-1.458-1.515-2.625L8.485 2.495zM10 5a.75.75 0 01.75.75v3.5a.75.75 0 01-1.5 0v-3.5A.75.75 0 0110 5zm0 9a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                          </svg>
                          Acesso Crítico (Break the Glass)
                        </button>
                      </div>

                      {/* Standard Token Form */}
                      {authMethod === "token" ? (
                        <div className="space-y-2 p-4 bg-brand-bg/50 dark:bg-brand-dark-bg/50 rounded-lg border border-brand-border dark:border-brand-dark-border animate-fadeIn">
                          <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75">
                            Token de Autorização (6 Dígitos)
                          </label>
                          <div className="flex gap-4">
                            <input
                              type="text"
                              maxLength={6}
                              value={otpCode}
                              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                              placeholder="000000"
                              className="w-full max-w-xs rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-paper dark:bg-brand-dark-paper px-4 py-2 text-center text-lg font-mono tracking-widest text-brand-text dark:text-brand-dark-text focus:border-primary focus:outline-none transition"
                            />
                            <div className="text-xs text-brand-text/60 dark:text-brand-dark-text/60 flex items-center">
                              <span>OTP ativo na sandbox: <code className="bg-slate-200 dark:bg-brand-dark-border px-1.5 py-0.5 rounded text-primary dark:text-secondary-light font-mono font-bold">{selectedPatient.otpToken}</code></span>
                            </div>
                          </div>
                        </div>
                      ) : (
                        // Break the Glass Form
                        <div className="space-y-4 p-4 bg-red-500/5 dark:bg-red-500/10 rounded-lg border border-red-500/20 animate-fadeIn">
                          <div className="flex items-start gap-3 bg-red-500/10 dark:bg-red-500/20 text-red-700 dark:text-red-400 p-3 rounded-lg border border-red-500/20">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5 shrink-0 mt-0.5">
                              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-5a.75.75 0 01.75.75v4.5a.75.75 0 01-1.5 0v-4.5A.75.75 0 0110 5zm0 10a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            <div className="text-xs space-y-1">
                              <p className="font-bold uppercase tracking-wider">Protocolo de Segurança Crítico</p>
                              <p>O acesso forçado registra seus dados profissionais e IP nos servidores centrais. A auditoria médica da clínica e o paciente serão notificados imediatamente.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                                Nome do Solicitante
                              </label>
                              <input
                                type="text"
                                required
                                value={requesterName}
                                onChange={(e) => setRequesterName(e.target.value)}
                                placeholder="Dr. Roberto Silva"
                                className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-paper dark:bg-brand-dark-paper px-3 py-1.5 text-sm text-brand-text dark:text-brand-dark-text focus:border-red-500 focus:outline-none transition"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                                Cargo / Registro Profissional (CRM/Coren)
                              </label>
                              <input
                                type="text"
                                required
                                value={requesterRole}
                                onChange={(e) => setRequesterRole(e.target.value)}
                                placeholder="Médico Cardiologista - CRM 123456/SP"
                                className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-paper dark:bg-brand-dark-paper px-3 py-1.5 text-sm text-brand-text dark:text-brand-dark-text focus:border-red-500 focus:outline-none transition"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold uppercase tracking-wider text-brand-text/75 dark:text-brand-dark-text/75 mb-1">
                              Justificativa Clínica de Urgência
                            </label>
                            <textarea
                              required
                              value={justification}
                              onChange={(e) => setJustification(e.target.value)}
                              placeholder="Descreva o motivo de emergência clínica (ex: Paciente inconsciente, risco iminente de morte, sem acompanhantes)..."
                              rows={3}
                              className="w-full rounded-lg border border-brand-border dark:border-brand-dark-border bg-brand-paper dark:bg-brand-dark-paper px-3 py-1.5 text-sm text-brand-text dark:text-brand-dark-text focus:border-red-500 focus:outline-none transition"
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          className={`px-6 py-2 rounded-lg text-sm font-semibold text-white shadow-md hover:shadow-lg transition-all ${
                            authMethod === "break_the_glass"
                              ? "bg-red-600 hover:bg-red-700"
                              : "bg-primary hover:bg-primary-dark"
                          }`}
                        >
                          Requisitar Dados Clínicos
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-12 text-center text-brand-text/40 dark:text-brand-dark-text/40">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 mb-2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    <p className="text-sm font-semibold">Nenhum paciente selecionado</p>
                    <p className="text-xs">Busque no painel lateral ou use um registro da Sandbox de demonstração.</p>
                  </div>
                )}
              </div>

              {/* Displaying Clinical Data after Authorization */}
              {authorizedHistory ? (
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

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setShowPrintPreview(true)}
                        className="flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-2 rounded-lg text-xs transition shadow-sm"
                        title="Visualizar documento sumarizado em tela e gerar PDF para impressão"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                        </svg>
                        Visualizar PDF / Sumário
                      </button>

                      <button
                        onClick={handleDownloadHL7}
                        className="flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-3 py-2 rounded-lg text-xs transition shadow-sm"
                        title="Baixar prontuário completo no formato de interoperabilidade HL7 FHIR JSON"
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
                      <div className="overflow-x-auto">
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
                    ) : (
                      <div className="p-5 text-center border border-dashed border-brand-border dark:border-brand-dark-border rounded-lg">
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
              ) : null}

            </div>
          </div>

          {/* Lower Full Width Section: Filtered Audit Log */}
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
              <div className="overflow-x-auto">
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
            ) : (
              <div className="p-6 text-center border border-dashed border-brand-border dark:border-brand-dark-border rounded-lg bg-brand-bg/10 dark:bg-brand-dark-bg/10">
                <p className="text-xs text-brand-text/50 dark:text-brand-dark-text/50">Nenhuma consulta registrada para esta clínica até o momento.</p>
              </div>
            )}
          </div>
        </main>
        
        {/* Footer */}
        <footer className="bg-brand-paper dark:bg-brand-dark-paper border-t border-brand-border dark:border-brand-dark-border py-4 text-center text-xs text-brand-text/50 dark:text-brand-dark-text/50 mt-auto transition-colors duration-200">
          <p>© 2026 Mediador Centralizador Clínico. Desenvolvido para fins de TCC — Conjunto de Aplicações Medicinais.</p>
        </footer>
      </div>

      {/* Screen Document Preview Modal (visible on demand, hidden in printing via CSS) */}
      {showPrintPreview && authorizedHistory && (
        <div className="no-print fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="bg-white text-slate-800 w-full max-w-4xl p-6 md:p-8 rounded-xl shadow-2xl space-y-6 relative border border-slate-200 my-8">
            
            {/* Modal Controls */}
            <div className="flex justify-between items-center bg-slate-50 p-3 -mx-6 -mt-6 border-b border-slate-200 rounded-t-xl gap-4">
              <span className="text-xs font-extrabold text-slate-500 uppercase tracking-wider pl-2 flex items-center gap-1.5">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-primary">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Visualização do Documento Impresso
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handlePrintDocument}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-lg flex items-center gap-1 transition"
                  title="Gerar PDF / Imprimir"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.2} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.82l-.24.03c-1.096.158-1.97.973-2.24 2.057-.276 1.111.128 2.278 1.03 2.908l.24.17c.947.66 2.213.66 3.16 0l.24-.17c.902-.63 1.306-1.797 1.03-2.908-.27-1.084-1.144-1.9-2.24-2.057l-.24-.03z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9V3m0 0L9 6m3-3l3 3m-3 12h.01" />
                  </svg>
                  Imprimir / Salvar PDF
                </button>
                <button
                  onClick={() => setShowPrintPreview(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs px-3.5 py-1.5 rounded-lg transition"
                >
                  Fechar
                </button>
              </div>
            </div>

            {/* Document sheet template wrapper */}
            <div className="border border-slate-300 rounded-lg p-5 md:p-6 shadow-inner bg-white">
              {renderClinicalDocumentSheet(authorizedHistory)}
            </div>
          </div>
        </div>
      )}

      {/* Print-Only Wrapper (only displayed during window.print() via CSS rules) */}
      {authorizedHistory && (
        <div className="print-only">
          {renderClinicalDocumentSheet(authorizedHistory)}
        </div>
      )}

    </div>
  );
}
