import type { AuditLog, AuthorizedHistory, Clinic, ClinicUser, Exam, Patient } from "../types/clinical";

/** URL do centralizador (back). O build de produção aponta para a API online; em dev, o back local. */
export function getApiBaseUrl(): string {
  const fallback = process.env.NODE_ENV === "production" ? "https://api.pohinc.com.br" : "http://localhost:8002";
  return process.env.NEXT_PUBLIC_API_URL || fallback;
}

function authHeaders(token: string): Record<string, string> {
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function readError(res: Response, fallback: string): Promise<string> {
  const data = await res.json().catch(() => ({}));
  return typeof data?.error === "string" ? data.error : fallback;
}

export interface LoginResponse {
  token: string;
  user: ClinicUser;
  clinic: Clinic;
}

/** Login do usuário da clínica. O back só aceita contas com tipo_usuario=clinica. */
export async function loginClinic(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${getApiBaseUrl()}/api/clinic/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Não foi possível entrar. Verifique e-mail e senha."));
  }
  const data = await res.json();
  return {
    token: data.access_token,
    user: {
      clinicId: data.clinic.id,
      email: data.user.email,
      passwordHash: "",
      name: data.user.name || data.user.email,
      role: data.user.role || "Profissional Clínico",
      systemRole: "doctor",
    },
    clinic: { id: data.clinic.id, name: data.clinic.name || "Clínica", type: "partner" },
  };
}

function toPatient(p: { id: string; name: string; cpf: string; birthDate?: string }): Patient {
  return {
    id: p.id,
    name: p.name,
    cpf: p.cpf,
    birthDate: p.birthDate || "",
    email: "",
    phone: "",
    otpToken: "",
    allergies: [],
    medications: [],
    exams: [],
  };
}

/** Busca por CPF (11 dígitos) ou por nome. */
export async function searchPatientsApi(query: string, token: string): Promise<Patient[]> {
  const q = query.trim();
  if (!q) return [];
  const digits = q.replace(/\D/g, "");
  const isCpf = digits.length === 11 && /^[\d.\-\s]+$/.test(q);
  const param = isCpf ? `cpf=${encodeURIComponent(digits)}` : `name=${encodeURIComponent(q)}`;
  const res = await fetch(`${getApiBaseUrl()}/api/patients/search?${param}`, { headers: authHeaders(token) });
  if (!res.ok) {
    throw new Error(await readError(res, "Erro ao buscar pacientes no centralizador."));
  }
  const data = await res.json();
  return (data.patients || []).map(toPatient);
}

interface FhirResource {
  resourceType: string;
  id?: string;
  name?: { text?: string }[];
  birthDate?: string;
  code?: { text?: string };
  effectiveDateTime?: string;
  performer?: { display?: string }[];
  conclusion?: string;
}

/**
 * Troca o código de 6 dígitos que o paciente gerou no app por acesso temporário ao histórico.
 * Devolve até quando o acesso vale (ISO). O back registra a tentativa na auditoria.
 */
export async function redeemAccessCodeApi(cpf: string, code: string, token: string): Promise<string> {
  const res = await fetch(`${getApiBaseUrl()}/api/access-codes/redeem`, {
    method: "POST",
    headers: { ...authHeaders(token), "Content-Type": "application/json" },
    body: JSON.stringify({ cpf, code }),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Código inválido, expirado ou já utilizado."));
  }
  const data: { access_until: string } = await res.json();
  return data.access_until;
}

/**
 * Solicita o histórico do paciente (bundle FHIR R4). Só sai com consentimento vigente do paciente;
 * o back registra a tentativa, permitida ou negada, na auditoria.
 */
export async function requestPatientDataApi(
  patient: Patient,
  token: string,
  requester: { name: string; email: string; role: string },
  clinic: Clinic,
  breakGlass?: { justification: string }
): Promise<{ history: AuthorizedHistory; log: AuditLog }> {
  const base = `${getApiBaseUrl()}/api/patients/${encodeURIComponent(patient.id)}`;
  const res = breakGlass
    ? await fetch(`${base}/break-glass`, {
        method: "POST",
        headers: { ...authHeaders(token), "Content-Type": "application/json" },
        body: JSON.stringify({ justificativa: breakGlass.justification }),
      })
    : await fetch(`${base}/fhir-bundle`, { headers: authHeaders(token) });
  if (res.status === 403) {
    throw new Error(
      breakGlass
        ? "Acesso sem consentimento só é permitido para pacientes de demonstração."
        : "O paciente não autorizou o compartilhamento do histórico (consentimento ausente ou revogado)."
    );
  }
  if (!res.ok) {
    throw new Error(await readError(res, "Não foi possível obter o histórico do paciente."));
  }

  const bundle = await res.json();
  const resources: FhirResource[] = (bundle.entry || []).map((e: { resource: FhirResource }) => e.resource);
  const pr = resources.find((r) => r.resourceType === "Patient");
  const exams: Exam[] = resources
    .filter((r) => r.resourceType === "DiagnosticReport")
    .map((r) => ({
      id: r.id || "",
      title: r.code?.text || "Exame",
      date: (r.effectiveDateTime || "").slice(0, 10),
      provider: r.performer?.[0]?.display || "Clínica",
      result: r.conclusion || "",
      type: "general" as const,
    }));

  const full: Patient = {
    ...patient,
    name: pr?.name?.[0]?.text || patient.name,
    birthDate: pr?.birthDate || patient.birthDate,
    exams,
  };
  const timestamp = new Date().toISOString();

  return {
    history: {
      patient: full,
      method: breakGlass ? "break_the_glass" : "consent",
      requesterName: requester.name,
      requesterRole: requester.role,
      hl7Bundle: JSON.stringify(bundle, null, 2),
      timestamp,
    },
    log: {
      id: `log-${Date.now()}`,
      clinicName: clinic.name,
      requesterEmail: requester.email,
      patientName: full.name,
      authMethod: breakGlass ? "break_the_glass" : "consent",
      requestType: clinic.type === "partner" ? "hl7_download" : "direct",
      timestamp,
      requesterRole: requester.role,
    },
  };
}

/** Auditoria de acessos aos dados do paciente, como registrada no Cassandra pelo back. */
export async function getPatientAuditApi(patientId: string, patientName: string, clinicName: string, token: string): Promise<AuditLog[]> {
  const res = await fetch(`${getApiBaseUrl()}/api/patients/${encodeURIComponent(patientId)}/audit`, {
    headers: authHeaders(token),
  });
  if (!res.ok) {
    throw new Error(await readError(res, "Não foi possível carregar a auditoria."));
  }
  const entries: { actor: string; action: string; result: string; at: string }[] = await res.json();
  return entries.map((e, i) => ({
    id: `${e.at}-${e.actor}-${i}`,
    clinicName,
    requesterEmail: e.actor,
    patientName,
    authMethod: "consent",
    requestType: "direct",
    timestamp: e.at,
    justification: e.result === "ok" ? undefined : `Acesso negado: ${e.result}`,
  }));
}
