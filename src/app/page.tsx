"use client";

import { useState, useEffect } from "react";
import {
  Patient,
  Clinic,
  ClinicUser,
  AuditLog,
  AuthorizedHistory,
  mockPatients,
  initialAuditLogs,
  generateHL7FHIRBundle,
} from "./mockData";

import LoginView from "../components/LoginView";
import DashboardHeader from "../components/DashboardHeader";
import PatientSearch from "../components/PatientSearch";
import SandboxPatients from "../components/SandboxPatients";
import PatientRequestPanel from "../components/PatientRequestPanel";
import ClinicalDataDisplay from "../components/ClinicalDataDisplay";
import AuditLogsTable from "../components/AuditLogsTable";
import PrintPreviewModal from "../components/PrintPreviewModal";

export default function MediatorPage() {
  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Auth State
  const [currentUser, setCurrentUser] = useState<ClinicUser | null>(null);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);

  // Dashboard State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Authorized Patient History View
  const [authorizedHistory, setAuthorizedHistory] = useState<AuthorizedHistory | null>(null);

  // PDF / Document Print Preview Modal State
  const [showPrintPreview, setShowPrintPreview] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

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
        setCurrentUser(JSON.parse(savedUser));
        setCurrentClinic(JSON.parse(savedClinic));
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

  // Filter audit logs: Only show logs belonging to the currently logged in clinic
  const filteredAuditLogs = currentClinic 
    ? auditLogs.filter(log => log.clinicName.toLowerCase() === currentClinic.name.toLowerCase())
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
    localStorage.removeItem("centralizador_token");
    localStorage.removeItem("centralizador_user");
    localStorage.removeItem("centralizador_clinic");
  };

  // Perform search query locally using mock data
  const performSearch = (query: string) => {
    setAuthorizedHistory(null);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    const lowerQuery = query.toLowerCase().trim();
    const results = mockPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(lowerQuery) ||
        p.cpf.includes(lowerQuery.replace(/\D/g, ""))
    );
    
    setSearchResults(results);
    if (results.length > 0) {
      setSelectedPatient(results[0]);
    } else {
      setSelectedPatient(null);
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
  };

  const handleFillFromSandbox = (cpf: string) => {
    setSearchQuery(cpf);
    performSearch(cpf);
  };

  const handleAuthorizationSuccess = (history: AuthorizedHistory, newLog: AuditLog) => {
    setAuthorizedHistory(history);
    setAuditLogs((prev) => [newLog, ...prev]);
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
    
    if (currentUser && currentClinic) {
      const newLog: AuditLog = {
        id: `log-${Date.now()}`,
        clinicName: currentClinic.name,
        requesterEmail: currentUser.email,
        patientName: patient.name,
        authMethod: "token",
        requestType: "hl7_download",
        timestamp: new Date().toISOString(),
      };
      setAuditLogs((prev) => [newLog, ...prev]);
    }
  };

  // If not authenticated, render Login View
  if (!currentUser || !currentClinic) {
    return (
      <LoginView
        theme={theme}
        setTheme={setTheme}
        onLoginSuccess={handleLoginSuccess}
      />
    );
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

        {/* Main Workspace Layout */}
        <main className="flex-1 max-w-7xl w-full mx-auto p-6 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column: Search & Patient Database (Sandbox) */}
            <div className="lg:col-span-1 space-y-6 min-w-0">
              
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

              <SandboxPatients
                mockPatients={mockPatients}
                onFill={handleFillFromSandbox}
                onInstantExport={handleInstantHL7Export}
              />
            </div>

            {/* Right/Middle Column: Request Panel & Data Display */}
            <div className="lg:col-span-2 space-y-6 min-w-0">
              
              <PatientRequestPanel
                selectedPatient={selectedPatient}
                currentClinic={currentClinic}
                currentUser={currentUser}
                onAuthorizationSuccess={handleAuthorizationSuccess}
              />

              <ClinicalDataDisplay
                authorizedHistory={authorizedHistory}
                currentClinic={currentClinic}
                onShowPrintPreview={() => setShowPrintPreview(true)}
                onDownloadHL7={handleDownloadHL7}
              />
            </div>
          </div>

          {/* Lower Full Width Section: Filtered Audit Log */}
          <AuditLogsTable
            filteredAuditLogs={filteredAuditLogs}
            currentClinic={currentClinic}
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
