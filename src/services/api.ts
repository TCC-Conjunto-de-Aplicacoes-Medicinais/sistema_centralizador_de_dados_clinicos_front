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
  if (typeof window === "undefined") return false;
  const saved = localStorage.getItem(STORAGE_KEY_DEMO_MODE);
  // Por padrão, conecta-se diretamente à API Go em tempo real
  return saved === "true";
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
    // Simulação no modo demonstração
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

  const cleanDigits = query.replace(/\D/g, "");
  const isCpf = cleanDigits.length >= 7 && (cleanDigits.length === query.trim().length || query.includes("-") || query.includes("."));
  const param = isCpf ? `cpf=${encodeURIComponent(cleanDigits)}` : `name=${encodeURIComponent(query.trim())}`;
  
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/patients/search?${param}`, {
    headers,
  });

  if (!response.ok) {
    throw new Error("Erro ao buscar pacientes na API Go.");
  }

  const data = await response.json();
  if (!data.found) {
    return [];
  }

  const list = Array.isArray(data.patients) && data.patients.length > 0
    ? data.patients
    : (data.patient ? [data.patient] : []);

  return list.map((p: any) => ({
    id: p.id,
    name: p.name,
    cpf: p.cpf,
    birthDate: p.birthDate || "1990-01-01",
    email: `${p.id}@paciente.com.br`,
    phone: "(11) 99999-0000",
    otpToken: "123456",
    allergies: [],
    medications: [],
    exams: [],
  }));
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

  // Chamada à API Go para autorização e resgate de prontuário
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${getApiBaseUrl()}/api/patients/request-data`, {
    method: "POST",
    headers,
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

  // Busca em tempo real a linha do tempo cumulativa do Cassandra (Múltiplas Clínicas / Séries Temporais)
  let cassandraExams: any[] = [];
  try {
    const rawId = patient.id.replace(/^pat-/, "");
    const timeRes = await fetch(`${getApiBaseUrl()}/api/patients/${rawId}/timeline`);
    if (timeRes.ok) {
      const timeData = await timeRes.json();
      if (Array.isArray(timeData.records)) {
        cassandraExams = timeData.records.map((r: any) => ({
          id: r.record_id,
          title: r.title,
          date: r.exam_timestamp ? r.exam_timestamp.substring(0, 10) : new Date().toISOString().substring(0, 10),
          provider: r.clinic_name || "Clínica Federada",
          result: r.conclusion || "Registro clínico consolidado.",
          type: "cardiology"
        }));
      }
    }
  } catch (e) {
    console.warn("Aviso ao buscar timeline do Cassandra:", e);
  }

  // Combina exames de MariaDB e do Cassandra sem duplicatas
  const allExams = [...(remotePatient.exams || [])];
  const seenIds = new Set(allExams.map((ex: any) => ex.id));
  for (const cEx of cassandraExams) {
    if (!seenIds.has(cEx.id)) {
      seenIds.add(cEx.id);
      allExams.push(cEx);
    }
  }

  const enrichedPatient: Patient = {
    ...patient,
    allergies: remotePatient.allergies || patient.allergies,
    medications: remotePatient.medications || patient.medications,
    exams: allExams.length > 0 ? allExams : patient.exams,
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

export async function getAuditLogsApi(): Promise<AuditLog[]> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/audit-logs`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data;
      }
    }
  } catch (err) {
    console.warn("Aviso ao consultar logs de auditoria remotos:", err);
  }
  return initialAuditLogs;
}

export async function validateTokenApi(token: string): Promise<Patient | null> {
  try {
    const res = await fetch(`${getApiBaseUrl()}/api/tokens/validate?token=${encodeURIComponent(token)}`);
    if (res.ok) {
      const data = await res.json();
      if (data.found && data.patient) {
        return {
          id: data.patient.id,
          name: data.patient.name,
          cpf: data.patient.cpf,
          birthDate: data.patient.birthDate,
          gender: "other",
          allergies: [],
          medications: [],
          exams: [],
          otpToken: data.patient.otpToken || token,
        };
      }
    }
  } catch (err) {
    console.warn("Aviso ao validar token remoto:", err);
  }
  return null;
}

