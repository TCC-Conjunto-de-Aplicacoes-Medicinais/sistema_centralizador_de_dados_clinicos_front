"use client";

import { useState, useEffect } from "react";
import type { Patient, Clinic, ClinicUser, AuditLog, AuthorizedHistory } from "../types/clinical";

import LoginView from "../components/LoginView";
import DashboardHeader from "../components/DashboardHeader";
import PatientSearch from "../components/PatientSearch";
import PatientRequestPanel from "../components/PatientRequestPanel";
import ClinicalDataDisplay from "../components/ClinicalDataDisplay";
import AuditLogsTable from "../components/AuditLogsTable";
import PrintPreviewModal from "../components/PrintPreviewModal";

import { searchPatientsApi, getPatientAuditApi } from "../services/api";

export default function MediatorPage() {
  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Auth State (sessão guardada no navegador; o token é validado pelo back a cada chamada)
  const [currentUser, setCurrentUser] = useState<ClinicUser | null>(null);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);

  // Dashboard State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchError, setSearchError] = useState("");

  // Histórico liberado pelo consentimento do paciente
  const [authorizedHistory, setAuthorizedHistory] = useState<AuthorizedHistory | null>(null);

  // Modals
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Auditoria: acessos do paciente selecionado, carregados do back
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Load theme and session on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null;
    const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    const resolvedTheme = savedTheme || systemTheme;

    setTimeout(() => {
      setTheme(resolvedTheme);
    }, 0);

    const savedUser = localStorage.getItem("centralizador_user");
    const savedClinic = localStorage.getItem("centralizador_clinic");
    const savedToken = localStorage.getItem("centralizador_token");
    if (savedUser && savedClinic && savedToken) {
      setTimeout(() => {
        try {
          setCurrentUser(JSON.parse(savedUser));
          setCurrentClinic(JSON.parse(savedClinic));
        } catch {
          setCurrentUser(null);
          setCurrentClinic(null);
        }
      }, 0);
    }
  }, []);

  // Sync theme with document class
  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Auditoria exibida: só os acessos da clínica logada
  const filteredAuditLogs = currentClinic
    ? auditLogs.filter((log) => log.clinicName.toLowerCase() === currentClinic.name.toLowerCase())
    : [];

  const handleLoginSuccess = (user: ClinicUser, clinic: Clinic, jwtToken: string) => {
    localStorage.setItem("centralizador_token", jwtToken);
    localStorage.setItem("centralizador_user", JSON.stringify(user));
    localStorage.setItem("centralizador_clinic", JSON.stringify(clinic));
    setCurrentUser(user);
    setCurrentClinic(clinic);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentClinic(null);
    setSelectedPatient(null);
    setAuthorizedHistory(null);
    setShowPrintPreview(false);
    setSearchQuery("");
    setSearchResults([]);
    setAuditLogs([]);
    localStorage.removeItem("centralizador_token");
    localStorage.removeItem("centralizador_user");
    localStorage.removeItem("centralizador_clinic");
  };

  const performSearch = async (query: string) => {
    setAuthorizedHistory(null);
    setSearchError("");
    if (!query.trim()) {
      setSearchResults([]);
      setSelectedPatient(null);
      return;
    }
    try {
      const token = localStorage.getItem("centralizador_token") || "";
      const results = await searchPatientsApi(query, token);
      setSearchResults(results);
      setSelectedPatient(results.length > 0 ? results[0] : null);
    } catch (err: unknown) {
      setSearchResults([]);
      setSelectedPatient(null);
      setSearchError(err instanceof Error ? err.message : "Erro ao buscar pacientes.");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performSearch(searchQuery);
  };

  const handleClearSearch = () => {
    setSearchQuery("");
    setSearchResults([]);
    setSelectedPatient(null);
    setAuthorizedHistory(null);
    setSearchError("");
  };

  // Após um acesso permitido: guarda o histórico e recarrega a auditoria do paciente do back
  const handleAuthorizationSuccess = (history: AuthorizedHistory, newLog: AuditLog) => {
    setAuthorizedHistory(history);
    setAuditLogs((prev) => [newLog, ...prev]);
    if (currentClinic) {
      const token = localStorage.getItem("centralizador_token") || "";
      getPatientAuditApi(history.patient.id, history.patient.name, currentClinic.name, token)
        .then((entries) => {
          setAuditLogs((prev) => {
            const others = prev.filter((l) => l.patientName !== history.patient.name);
            return [...entries, ...others];
          });
        })
        .catch(() => {
          // Mantém o registro local da sessão se a auditoria não puder ser carregada agora.
        });
    }
  };

  const handleDownloadHL7 = () => {
    if (!authorizedHistory) return;
    const pat = authorizedHistory.patient;
    const blob = new Blob([authorizedHistory.hl7Bundle], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fhir-bundle-${pat.id}-${pat.name.toLowerCase().replace(/\s+/g, "-")}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // If not authenticated, render Login View
  if (!currentUser || !currentClinic) {
    return <LoginView theme={theme} setTheme={setTheme} onLoginSuccess={handleLoginSuccess} />;
  }

  // Dashboard View
  return (
    <div className={theme === "dark" ? "dark bg-brand-dark-bg text-brand-dark-text min-h-screen transition-colors duration-200" : "bg-brand-bg text-brand-text min-h-screen transition-colors duration-200"}>
      {/* Screen Layout - Hidden during printing */}
      <div className="no-print flex flex-col min-h-screen">
        <DashboardHeader
          currentUser={currentUser}
          currentClinic={currentClinic}
          theme={theme}
          setTheme={setTheme}
          onLogout={handleLogout}
        />

        {/* Main Workspace Layout - Widescreen Layout (Expanded X Axis) */}
        <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column: Search */}
            <div className="lg:col-span-4 xl:col-span-3 space-y-6 min-w-0">
              <PatientSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                selectedPatient={selectedPatient}
                setSelectedPatient={(p) => {
                  setSelectedPatient(p);
                  setAuthorizedHistory(null);
                }}
                onClear={handleClearSearch}
                onSearch={handleSearchSubmit}
              />
              {searchError && (
                <p className="text-xs text-red-600 dark:text-red-400 px-1">{searchError}</p>
              )}
            </div>

            {/* Right/Middle Column: Request Panel & Data Display */}
            <div className="lg:col-span-8 xl:col-span-9 space-y-6 min-w-0">
              <PatientRequestPanel
                selectedPatient={selectedPatient}
                currentClinic={currentClinic}
                currentUser={currentUser}
                authorizedHistory={authorizedHistory}
                onAuthorizationSuccess={handleAuthorizationSuccess}
                onRevokeAccess={() => setAuthorizedHistory(null)}
              />

              <ClinicalDataDisplay
                authorizedHistory={authorizedHistory}
                currentClinic={currentClinic}
                currentUser={currentUser}
                auditLogs={auditLogs}
                onShowPrintPreview={() => setShowPrintPreview(true)}
                onDownloadHL7={handleDownloadHL7}
              />
            </div>
          </div>

          {/* Lower Full Width Section: Audit Log */}
          <AuditLogsTable
            filteredAuditLogs={filteredAuditLogs}
            allAuditLogs={auditLogs}
            currentClinic={currentClinic}
            currentUser={currentUser}
          />
        </main>
      </div>

      {/* Printable Sheet View Modal */}
      <PrintPreviewModal
        isOpen={showPrintPreview}
        onClose={() => setShowPrintPreview(false)}
        authorizedHistory={authorizedHistory}
        currentClinic={currentClinic}
        currentUser={currentUser}
      />
    </div>
  );
}
