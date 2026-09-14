"use client";

import { useState, useEffect } from "react";
import {
  Patient,
  Clinic,
  ClinicUser,
  AuditLog,
  AuthorizedHistory,
  mockPatients,
  mockDemoRoles,
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
import QuickAccessModal from "../components/QuickAccessModal";

import { isDemoMode, setDemoMode, searchPatientsApi } from "../services/api";

export default function MediatorPage() {
  // Theme State
  const [theme, setTheme] = useState<"light" | "dark">("light");

  // Mode State (Mock Demonstration vs Live Go API)
  const [isDemo, setIsDemo] = useState(true);

  // Auth State
  const [currentUser, setCurrentUser] = useState<ClinicUser | null>(null);
  const [currentClinic, setCurrentClinic] = useState<Clinic | null>(null);

  // Dashboard State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  
  // Authorized Patient History View
  const [authorizedHistory, setAuthorizedHistory] = useState<AuthorizedHistory | null>(null);

  // Modals
  const [showPrintPreview, setShowPrintPreview] = useState(false);
  const [showQuickAccess, setShowQuickAccess] = useState(false);

  // Audit Logs State
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(initialAuditLogs);

  // Load theme, demo mode and session on mount
  useEffect(() => {
    setIsDemo(isDemoMode());

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
          setCurrentUser(mockDemoRoles[0].user);
          setCurrentClinic(mockDemoRoles[0].clinic);
        }
      }, 0);
    } else {
      // Default to Dr. Roberto Silva demo session for instant inspection
      setTimeout(() => {
        setCurrentUser(mockDemoRoles[0].user);
        setCurrentClinic(mockDemoRoles[0].clinic);
      }, 0);
    }

    // Default select first patient (Maria Oliveira Souza) for quick review
    setTimeout(() => {
      setSelectedPatient(mockPatients[0]);
    }, 0);
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

  const handleRoleSwitch = (newUser: ClinicUser, newClinic: Clinic) => {
    setCurrentUser(newUser);
    setCurrentClinic(newClinic);
    localStorage.setItem("centralizador_user", JSON.stringify(newUser));
    localStorage.setItem("centralizador_clinic", JSON.stringify(newClinic));
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentClinic(null);
    setSelectedPatient(null);
    setAuthorizedHistory(null);
    setShowPrintPreview(false);
    setShowQuickAccess(false);
    setSearchQuery("");
    setSearchResults([]);
    localStorage.removeItem("centralizador_token");
    localStorage.removeItem("centralizador_user");
    localStorage.removeItem("centralizador_clinic");
  };

  const handleToggleDemo = () => {
    const next = !isDemo;
    setIsDemo(next);
    setDemoMode(next);
  };

  // Perform search query via API or mock depending on active mode
  const performSearch = async (query: string) => {
    setAuthorizedHistory(null);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("centralizador_token") || "";
      const results = await searchPatientsApi(query, token);
      setSearchResults(results);
      if (results.length > 0) {
        setSelectedPatient(results[0]);
      } else {
        setSelectedPatient(null);
      }
    } catch {
      // Fallback gracioso para dados mockados em caso de falha de conexão com a API
      const lowerQuery = query.toLowerCase().trim();
      const results = mockPatients.filter(
        (p) =>
          p.name.toLowerCase().includes(lowerQuery) ||
          p.cpf.includes(lowerQuery.replace(/\D/g, ""))
      );
      setSearchResults(results);
      setSelectedPatient(results.length > 0 ? results[0] : null);
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

  const handleQuickAccessPatient = (patient: Patient, token: string) => {
    setSelectedPatient(patient);
    const hl7Str = generateHL7FHIRBundle(patient);
    const timestamp = new Date().toISOString();
    
    const newHistory: AuthorizedHistory = {
      patient,
      method: "token",
      requesterName: currentUser?.name || "Recepção / Triagem",
      requesterRole: currentUser?.role || "Atendimento",
      hl7Bundle: hl7Str,
      timestamp,
    };

    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      clinicName: currentClinic?.name || "Clínica",
      requesterEmail: currentUser?.email || "recepcao@vida.com.br",
      patientName: patient.name,
      authMethod: "token",
      requestType: currentClinic?.type === "partner" ? "hl7_download" : "direct",
      timestamp,
      requesterRole: currentUser?.role,
    };

    handleAuthorizationSuccess(newHistory, newLog);
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
          isDemo={isDemo}
          onToggleDemo={handleToggleDemo}
          onRoleSwitch={handleRoleSwitch}
          onOpenQuickAccess={() => setShowQuickAccess(true)}
          onLogout={handleLogout}
        />

        {/* Main Workspace Layout - Widescreen Layout (Expanded X Axis) */}
        <main className="flex-1 w-full max-w-[1720px] mx-auto p-4 sm:p-8 space-y-6">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Left Column: Search & Patient Database (Sandbox) - 25% on wide screens */}
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

              <SandboxPatients
                mockPatients={mockPatients}
                onFill={handleFillFromSandbox}
                onInstantExport={handleInstantHL7Export}
              />
            </div>

            {/* Right/Middle Column: Request Panel & Data Display - 75% on wide screens */}
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

          {/* Lower Full Width Section: Filtered Audit Log */}
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

      {/* Quick Access OTP Modal (Recepção) */}
      {showQuickAccess && (
        <QuickAccessModal
          onClose={() => setShowQuickAccess(false)}
          onSelectPatient={handleQuickAccessPatient}
        />
      )}
    </div>
  );
}
