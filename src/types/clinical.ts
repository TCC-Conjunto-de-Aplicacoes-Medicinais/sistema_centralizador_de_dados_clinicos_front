export interface Exam {
  id: string;
  title: string;
  date: string;
  provider: string;
  result: string;
  type?: 'cardiology' | 'laboratory' | 'imaging' | 'general';
  ecgId?: string; // Link para registro detalhado de ECG se for eletrocardiograma
}

export interface ECGRecord {
  id: string;
  date: string;
  provider: string;
  indication: string;
  heartRateBpm: number;
  prIntervalMs: number;
  qrsDurationMs: number;
  qtIntervalMs: number;
  stElevationMm: number;
  diagnosis: string;
  leadsData: {
    lead: string;
    description: string;
    wavePoints: number[]; // Pontos normalizados de voltagem para o traçado SVG/Canvas
  }[];
  aiAnalysis?: {
    infarctRisk: number; // Ex: 91.4%
    overloadRisk: number; // Ex: 14.2%
    primaryFinding: string;
    consensus: string;
    certaintyScore: number;
    disclaimer: string;
  };
}

export interface TimelineEvent {
  id: string;
  date: string;
  institution: string;
  type: 'emergency' | 'consultation' | 'exam' | 'prescription' | 'hospitalization';
  title: string;
  doctorName: string;
  crm: string;
  summary: string;
  badgeColor: 'emerald' | 'amber' | 'blue' | 'purple' | 'red';
}

export interface DrugInteraction {
  id: string;
  drugA: string;
  clinicA: string;
  drugB: string;
  clinicB: string;
  severity: 'high' | 'moderate' | 'low';
  riskTitle: string;
  clinicalImpact: string;
  recommendation: string;
}

export interface Patient {
  id: string;
  name: string;
  cpf: string;
  birthDate: string;
  email: string;
  phone: string;
  otpToken: string;
  allergies: string[];
  medications: string[];
  exams: Exam[];
  ecgRecords?: ECGRecord[];
  timeline?: TimelineEvent[];
  drugInteractions?: DrugInteraction[];
}

export interface Clinic {
  id: string;
  name: string;
  type: 'internal' | 'partner';
  city?: string;
  state?: string;
}

export type SystemRole = 'doctor' | 'clinic_admin' | 'network_auditor';

export interface ClinicUser {
  clinicId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
  systemRole: SystemRole;
  crmOrBadge?: string;
}

export interface AuditLog {
  id: string;
  clinicName: string;
  requesterEmail: string;
  patientName: string;
  authMethod: 'token' | 'break_the_glass' | 'consent';
  requestType: 'direct' | 'hl7_download';
  justification?: string;
  timestamp: string;
  requesterRole?: string;
  ipOrigin?: string;
}

export interface AuthorizedHistory {
  patient: Patient;
  method: 'token' | 'break_the_glass' | 'consent';
  justification?: string;
  requesterName?: string;
  requesterRole?: string;
  hl7Bundle: string;
  timestamp: string;
}
