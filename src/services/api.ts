import {
  Patient,
  Clinic,
  ClinicUser,
  AuditLog,
  AuthorizedHistory,
  mockPatients,
  mockClinics,
  mockClinicUsers,
  initialAuditLogs,
  generateHL7FHIRBundle,
} from "../app/mockData";

const STORAGE_KEY_DEMO_MODE = "pohinc_demo_mode";
const DEFAULT_API_URL = "http://localhost:8002";

export function isDemoMode(): boolean {
  if (typeof window === "undefined") return true;
  const saved = localStorage.getItem(STORAGE_KEY_DEMO_MODE);
  // Por padrão, o modo demonstração/apresentação vem ativado para exibição imediata
  return saved === null ? true : saved === "true";
}

export function setDemoMode(enabled: boolean): void {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY_DEMO_MODE, enabled ? "true" : "false");
  }
}

export function getApiBaseUrl(): string {
  if (typeof window === "undefined") return DEFAULT_API_URL;
  return localStorage.getItem("pohinc_api_url") || DEFAULT_API_URL;
}

export function setApiBaseUrl(url: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("pohinc_api_url", url);
  }
}

export interface LoginResponse {
  token: string;
  user: ClinicUser;
  clinic: Clinic;
}

export async function loginClinic(
  clinicCode: string,
  email: string,
  password: string
): Promise<LoginResponse> {
  if (isDemoMode()) {
    // Simulação instantânea no modo apresentação
    const matchedUser = mockClinicUsers.find(
      (u) =>
        u.clinicId.toLowerCase() === clinicCode.trim().toLowerCase() &&
        u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!matchedUser) {
      throw new Error("Credenciais inválidas no modo demonstração.");
    }

    const matchedClinic =
      mockClinics.find(
        (c) => c.id.toLowerCase() === clinicCode.trim().toLowerCase()
      ) || mockClinics[0];

    return {
      token: `mock-token-${matchedClinic.id}-${matchedUser.email}-${Date.now()}`,
      user: matchedUser,
      clinic: matchedClinic,
    };
  }

  // Modo Produção / Conectado à API Go
  const response = await fetch(`${getApiBaseUrl()}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clinicCode: clinicCode.trim(),
      email: email.trim(),
      password,
    }),
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({}));
    throw new Error(data.error || "Falha na autenticação com a API Go.");
  }

  const data = await response.json();
  const matchedClinic =
    mockClinics.find(
      (c) => c.id.toLowerCase() === clinicCode.trim().toLowerCase()
    ) || {
      id: clinicCode.toUpperCase(),
      name: "Clínica Conectada",
      type: "internal",
    };

  return {
    token: data.token,
    user: {
      clinicId: clinicCode.toUpperCase(),
      email: email,
      passwordHash: "",
      name: data.user?.name || email,
      role: data.user?.role || "Profissional Clínico",
      systemRole: "doctor",
    },
    clinic: matchedClinic,
  };
}

export async function searchPatientsApi(
  query: string,
  token: string
): Promise<Patient[]> {
  if (isDemoMode()) {
    const lower = query.toLowerCase().trim();
    if (!lower) return [];
    return mockPatients.filter(
      (p) =>
        p.name.toLowerCase().includes(lower) ||
        p.cpf.includes(lower.replace(/\D/g, ""))
    );
  }

  const isCpf = /^\d+$/.test(query.replace(/\D/g, ""));
  const param = isCpf ? `cpf=${encodeURIComponent(query.replace(/\D/g, ""))}` : `name=${encodeURIComponent(query)}`;
  
  const response = await fetch(`${getApiBaseUrl()}/api/patients/search?${param}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar pacientes na API Go.");
  }

  const data = await response.json();
  if (!data.found || !data.patient) {
    return [];
  }

  // Mapeia paciente retornado para o formato completo (unindo dados de exames se houver)
  const p = data.patient;
  return [
    {
      id: p.id,
      name: p.name,
      cpf: p.cpf,
      birthDate: p.birthDate,
      email: `${p.id}@paciente.com.br`,
      phone: "(11) 99999-0000",
      otpToken: "123456",
      allergies: [],
      medications: [],
      exams: [],
    },
  ];
}

export async function requestPatientDataApi(
  patient: Patient,
  authMethod: "token" | "break_the_glass",
  tokenCode: string,
  justification: string,
  currentUser: ClinicUser,
  currentClinic: Clinic,
  token: string
): Promise<{ history: AuthorizedHistory; log: AuditLog }> {
  const timestamp = new Date().toISOString();

  if (isDemoMode()) {
    const hl7Str = generateHL7FHIRBundle(patient);
    const history: AuthorizedHistory = {
      patient,
      method: authMethod,
      justification: authMethod === "break_the_glass" ? justification : undefined,
      requesterName: currentUser.name,
      requesterRole: currentUser.role,
      hl7Bundle: hl7Str,
      timestamp,
    };

    const log: AuditLog = {
      id: `log-${Date.now()}`,
      clinicName: currentClinic.name,
      requesterEmail: currentUser.email,
      patientName: patient.name,
      authMethod,
      requestType: currentClinic.type === "partner" ? "hl7_download" : "direct",
      justification: authMethod === "break_the_glass" ? justification : undefined,
      timestamp,
      requesterRole: currentUser.role,
    };

    return { history, log };
  }

  // Chamada à API Go
  const response = await fetch(`${getApiBaseUrl()}/api/patients/request-data`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      patientId: patient.id,
      authMethod,
      tokenCode,
      justification,
      requesterDetails: `${currentUser.name} (${currentUser.role})`,
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(errData.error || "Erro ao requisitar dados do paciente na API.");
  }

  const data = await response.json();
  const remotePatient = data.patient;
  const enrichedPatient: Patient = {
    ...patient,
    allergies: remotePatient.allergies || patient.allergies,
    medications: remotePatient.medications || patient.medications,
    exams: remotePatient.exams && remotePatient.exams.length > 0 ? remotePatient.exams : patient.exams,
  };

  const hl7Str = generateHL7FHIRBundle(enrichedPatient);
  const history: AuthorizedHistory = {
    patient: enrichedPatient,
    method: authMethod,
    justification,
    requesterName: currentUser.name,
    requesterRole: currentUser.role,
    hl7Bundle: hl7Str,
    timestamp,
  };

  const log: AuditLog = {
    id: `log-${Date.now()}`,
    clinicName: data.log?.clinicName || currentClinic.name,
    requesterEmail: data.log?.requesterEmail || currentUser.email,
    patientName: enrichedPatient.name,
    authMethod,
    requestType: data.log?.requestType || "direct",
    justification,
    timestamp,
  };

  return { history, log };
}
