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
  authMethod: 'token' | 'break_the_glass';
  requestType: 'direct' | 'hl7_download';
  justification?: string;
  timestamp: string;
  requesterRole?: string;
  ipOrigin?: string;
}

export interface AuthorizedHistory {
  patient: Patient;
  method: 'token' | 'break_the_glass';
  justification?: string;
  requesterName?: string;
  requesterRole?: string;
  hl7Bundle: string;
  timestamp: string;
}

export const mockClinics: Clinic[] = [
  { id: "CLI-1001", name: "Clínica Vida Saudável", type: "internal", city: "São Paulo", state: "SP" },
  { id: "CLI-2002", name: "Hospital Metropolitano São Lucas", type: "internal", city: "São Paulo", state: "SP" },
  { id: "CLI-3003", name: "CardioCentro Integrado", type: "partner", city: "Campinas", state: "SP" },
  { id: "CLI-4004", name: "Laboratório Santa Cecília", type: "partner", city: "São Paulo", state: "SP" }
];

export const mockDemoRoles: {
  user: ClinicUser;
  clinic: Clinic;
  label: string;
  badge: string;
}[] = [
  {
    label: "Dr. Roberto Silva (Cardiologista)",
    badge: "Visão do Médico",
    user: {
      clinicId: "CLI-1001",
      email: "roberto.silva@vida.com.br",
      passwordHash: "senha123",
      name: "Dr. Roberto Silva",
      role: "Médico Cardiologista",
      systemRole: "doctor",
      crmOrBadge: "CRM/SP 142.890"
    },
    clinic: mockClinics[0]
  },
  {
    label: "Mariana Duarte (Gestão Operacional)",
    badge: "Visão da Clínica",
    user: {
      clinicId: "CLI-1001",
      email: "mariana.duarte@vida.com.br",
      passwordHash: "senha123",
      name: "Mariana Duarte",
      role: "Gestora Administrativa & Recepção",
      systemRole: "clinic_admin",
      crmOrBadge: "Matrícula ADM-8910"
    },
    clinic: mockClinics[0]
  },
  {
    label: "Dr. Arnaldo Pires (Auditoria Geral)",
    badge: "Visão da Rede POHINC",
    user: {
      clinicId: "CLI-2002",
      email: "arnaldo.pires@pohinc.org",
      passwordHash: "senha123",
      name: "Dr. Arnaldo Pires",
      role: "Auditor Geral de Interoperabilidade & LGPD",
      systemRole: "network_auditor",
      crmOrBadge: "Auditor Oficial POHINC"
    },
    clinic: mockClinics[1]
  }
];

export const mockClinicUsers: ClinicUser[] = mockDemoRoles.map(r => r.user);

// Helper para gerar traçados de ECG matematicamente realistas (onda P, complexo QRS, onda T)
function generateECGPoints(isAcuteInfarct: boolean, isOverload: boolean): number[] {
  const points: number[] = [];
  const totalSamples = 250; // 1 ciclo completo expandido
  for (let i = 0; i < totalSamples; i++) {
    const t = (i / totalSamples) * 2 * Math.PI;
    // Linha de base isoelétrica
    let val = 0;

    // Onda P (despolarização atrial): t entre 0.3 e 0.9
    if (t > 0.4 && t < 0.9) {
      val += Math.sin((t - 0.4) * (Math.PI / 0.5)) * 0.18;
    }

    // Intervalo PR (linha isoelétrica)

    // Complexo QRS (despolarização ventricular)
    if (t >= 1.3 && t < 1.45) {
      // Onda Q (pequena deflexão negativa)
      val -= 0.12;
    } else if (t >= 1.45 && t < 1.7) {
      // Onda R (pico positivo alto)
      val += isOverload ? 1.9 : 1.35;
    } else if (t >= 1.7 && t < 1.85) {
      // Onda S (deflexão negativa profunda)
      val -= isOverload ? 0.65 : 0.35;
    }

    // Segmento ST e Onda T (repolarização ventricular)
    if (isAcuteInfarct) {
      // Supradesnivelamento do Segmento ST em arco de lápide (Tombstoning)
      if (t >= 1.85 && t < 2.5) {
        val += 0.45; // Elevação persistente acima da linha de base
      }
      if (t >= 2.5 && t < 3.4) {
        val += Math.sin((t - 2.5) * (Math.PI / 0.9)) * 0.55 + 0.3; // Onda T pontiaguda e hiperaguda
      }
    } else {
      // Normal: Segmento ST plano isoelétrico e onda T assimétrica suave
      if (t >= 2.4 && t < 3.3) {
        val += Math.sin((t - 2.4) * (Math.PI / 0.9)) * 0.32;
      }
    }

    // Pequeno ruído biológico realista
    val += (Math.random() - 0.5) * 0.02;
    points.push(parseFloat(val.toFixed(3)));
  }
  return points;
}

export const mockPatients: Patient[] = [
  {
    id: "pat-1",
    name: "Maria Oliveira Souza",
    cpf: "12345678909",
    birthDate: "1988-04-12",
    email: "maria.souza@gmail.com",
    phone: "(11) 98765-4321",
    otpToken: "123456",
    allergies: ["Dipirona Monoidratada", "Poeira/Ácaros", "Penicilina G"],
    medications: [
      "Losartana Potássica 50mg (1 comp. 12/12h — Prescrito por Clínica Vida Saudável)",
      "Espironolactona 25mg (1 comp. manhã — Prescrito por Hospital São Lucas)",
      "Metformina 850mg (1 comp. almoço e janta)"
    ],
    drugInteractions: [
      {
        id: "int-1",
        drugA: "Losartana Potássica 50mg",
        clinicA: "Clínica Vida Saudável",
        drugB: "Espironolactona 25mg",
        clinicB: "Hospital Metropolitano São Lucas",
        severity: "high",
        riskTitle: "Risco Elevado de Hipercalemia Severa",
        clinicalImpact: "A associação simultânea de antagonista dos receptores de angiotensina (Losartana) com diurético poupador de potássio (Espironolactona) pode precipitar níveis tóxicos de potássio sérico (> 5.5 mEq/L), gerando arritmias ventriculares potencialmente fatais.",
        recommendation: "Dosagem urgente de Eletrólitos (Potássio e Sódio) e função renal (Creatinina/Ureia). Considerar ajuste posológico ou suspensão temporária."
      }
    ],
    exams: [
      {
        id: "ex-101",
        title: "Eletrocardiograma de Urgência (12 Derivações)",
        date: "2026-05-20",
        provider: "Hospital Metropolitano São Lucas",
        result: "Elevação patológica de segmento ST de 2.8mm nas derivações anteriores (V2, V3 e V4). Quadro sugestivo de Síndrome Coronariana Aguda com Supradesnivelamento de ST (SCASST).",
        type: "cardiology",
        ecgId: "ecg-current"
      },
      {
        id: "ex-102",
        title: "Eletrocardiograma de Rotina Ambulatorial",
        date: "2025-05-15",
        provider: "CardioCentro Integrado",
        result: "Ritmo sinusal regular, FC de 72 bpm, eixo elétrico preservado, ausência de alterações de repolarização ventricular ou sobrecargas cavitárias.",
        type: "cardiology",
        ecgId: "ecg-previous"
      },
      {
        id: "ex-103",
        title: "Troponina I de Alta Sensibilidade",
        date: "2026-05-20",
        provider: "Laboratório Santa Cecília",
        result: "Resultado: 0.145 ng/mL (Valor de Referência: < 0.014 ng/mL) — Curva enzimática fortemente positiva compatível com necrose miocárdica aguda.",
        type: "laboratory"
      },
      {
        id: "ex-104",
        title: "Hemograma Completo com Plaquetas",
        date: "2026-04-15",
        provider: "Laboratório Santa Cecília",
        result: "Anemia leve normocítica/normocrômica (Hb: 11.4 g/dL). Plaquetas: 240.000/mm³.",
        type: "laboratory"
      }
    ],
    ecgRecords: [
      {
        id: "ecg-current",
        date: "2026-05-20",
        provider: "Hospital Metropolitano São Lucas",
        indication: "Dor torácica retroesternal opressiva há 45 min com irradiação para membro superior esquerdo.",
        heartRateBpm: 98,
        prIntervalMs: 160,
        qrsDurationMs: 88,
        qtIntervalMs: 440,
        stElevationMm: 2.8,
        diagnosis: "Elevação Aguda de Segmento ST (IAM em Parede Anterior)",
        leadsData: [
          { lead: "DII Longo", description: "Ritmo sinusal, taquicardia leve, supradesnivelamento visível", wavePoints: generateECGPoints(true, false) },
          { lead: "V2 (Parede Anterior)", description: "Elevação convexa acentuada do segmento ST (> 2.5 mm)", wavePoints: generateECGPoints(true, false) },
          { lead: "V3 (Parede Anterior)", description: "Elevação acentuada de ST com onda T hiperaguda", wavePoints: generateECGPoints(true, false) }
        ],
        aiAnalysis: {
          infarctRisk: 91.4,
          overloadRisk: 12.8,
          primaryFinding: "Elevação de Segmento ST / Padrão Isquêmico Agudo em V2-V4",
          consensus: "Alerta Crítico: Isquemia Miocárdica Aguda (IAM)",
          certaintyScore: 0.914,
          disclaimer: "⚠️ Suporte à Decisão Clínica POHINC (SaMD — RDC ANVISA nº 657/2022). O resultado deve ser correlacionado com clínica, biomarcadores e conduta imediata pelo médico responsável."
        }
      },
      {
        id: "ecg-previous",
        date: "2025-05-15",
        provider: "CardioCentro Integrado",
        indication: "Avaliação cardiológica de rotina pré-operatória.",
        heartRateBpm: 72,
        prIntervalMs: 152,
        qrsDurationMs: 84,
        qtIntervalMs: 400,
        stElevationMm: 0.0,
        diagnosis: "Eletrocardiograma Dentro dos Limites da Normalidade",
        leadsData: [
          { lead: "DII Longo", description: "Ritmo sinusal regular, onda P positiva, ST isoelétrico", wavePoints: generateECGPoints(false, false) },
          { lead: "V2 (Parede Anterior)", description: "Progressão fisiológica de onda R, ST nivelado", wavePoints: generateECGPoints(false, false) }
        ],
        aiAnalysis: {
          infarctRisk: 4.2,
          overloadRisk: 8.5,
          primaryFinding: "Ritmo Sinusal / Sem Alerta Diagnóstico",
          consensus: "Normal (Sem patologia isquêmica detectada)",
          certaintyScore: 0.958,
          disclaimer: "⚠️ Suporte à Decisão Clínica POHINC (SaMD — RDC ANVISA nº 657/2022)."
        }
      }
    ],
    timeline: [
      {
        id: "time-1",
        date: "2026-05-20 14:30",
        institution: "Hospital Metropolitano São Lucas",
        type: "emergency",
        title: "Atendimento Emergencial — Síndrome Coronariana",
        doctorName: "Dr. Roberto Silva",
        crm: "CRM/SP 142.890",
        summary: "Paciente admitida com dor precordial intensa. Realizado ECG com evidência de supradesnivelamento de ST. Acionado protocolo de trombólise/cateterismo de urgência.",
        badgeColor: "red"
      },
      {
        id: "time-2",
        date: "2026-04-15 09:15",
        institution: "Clínica Vida Saudável",
        type: "consultation",
        title: "Consulta Ambulatorial de Cardiologia",
        doctorName: "Dra. Fernanda Souza",
        crm: "CRM/SP 189.442",
        summary: "Relatou episódios esporádicos de cansaço aos médios esforços. Solicitados exames de sangue e monitoramento ambulatorial da pressão arterial.",
        badgeColor: "emerald"
      },
      {
        id: "time-3",
        date: "2025-05-15 11:00",
        institution: "CardioCentro Integrado",
        type: "exam",
        title: "Check-up Cardiológico Anual & ECG",
        doctorName: "Dr. Thiago Costa",
        crm: "CRM/SP 120.315",
        summary: "Eletrocardiograma de 12 derivações realizado sem alterações. Orientada manutenção de hábitos saudáveis e dieta hipossódica.",
        badgeColor: "blue"
      },
      {
        id: "time-4",
        date: "2024-11-10 16:40",
        institution: "Hospital Santa Maria",
        type: "hospitalization",
        title: "Internação Breve — Crise Hipertensiva",
        doctorName: "Dr. Marcelo Ramos",
        crm: "CRM/SP 98.710",
        summary: "Pico pressórico de 190x110 mmHg após estresse emocional. Controlado com medicação oral. Alta hospitalar após 12h de observação.",
        badgeColor: "amber"
      }
    ]
  },
  {
    id: "pat-2",
    name: "João Silva Santos",
    cpf: "98765432100",
    birthDate: "1975-08-25",
    email: "joao.santos@outlook.com",
    phone: "(21) 99888-7766",
    otpToken: "654321",
    allergies: ["Ácido Acetilsalicílico (AAS)", "Lactose", "Iodo (Contraste)"],
    medications: [
      "Atorvastatina 20mg (1 comp. à noite)",
      "Omeprazol 20mg (1 comp. manhã em jejum)"
    ],
    exams: [
      {
        id: "ex-201",
        title: "Eletrocardiograma de Esforço / Repouso",
        date: "2026-03-20",
        provider: "CardioCentro Integrado",
        result: "Hipertrofia Ventricular Esquerda acentuada com alterações secundárias da repolarização ventricular (Padrão Strain em derivações laterais).",
        type: "cardiology",
        ecgId: "ecg-joao"
      },
      {
        id: "ex-202",
        title: "Glicemia de Jejum e Hemoglobina Glicada",
        date: "2026-03-20",
        provider: "Laboratório Santa Cecília",
        result: "Glicose: 96 mg/dL. HbA1c: 5.4% (Controle metabólico adequado).",
        type: "laboratory"
      }
    ],
    ecgRecords: [
      {
        id: "ecg-joao",
        date: "2026-03-20",
        provider: "CardioCentro Integrado",
        indication: "Hipertensão arterial sistêmica de longa data em investigação de lesão em órgão-alvo.",
        heartRateBpm: 68,
        prIntervalMs: 175,
        qrsDurationMs: 110,
        qtIntervalMs: 420,
        stElevationMm: 0.0,
        diagnosis: "Sobrecarga Ventricular Esquerda (SVE) com Padrão Strain",
        leadsData: [
          { lead: "V5 (Parede Lateral)", description: "Onda R ampla (> 26mm), infradesnivelamento de ST assimétrico com T invertida", wavePoints: generateECGPoints(false, true) }
        ],
        aiAnalysis: {
          infarctRisk: 11.2,
          overloadRisk: 88.6,
          primaryFinding: "Hipertrofia Ventricular Esquerda / Bloqueio Fascicular",
          consensus: "Alerta Clínico: Sobrecarga Ventricular Esquerda Significativa",
          certaintyScore: 0.886,
          disclaimer: "⚠️ Suporte à Decisão Clínica POHINC (SaMD — RDC ANVISA nº 657/2022)."
        }
      }
    ],
    timeline: [
      {
        id: "time-joao-1",
        date: "2026-03-20 10:00",
        institution: "CardioCentro Integrado",
        type: "exam",
        title: "Eletrocardiograma com Sobrecarga",
        doctorName: "Dr. Roberto Silva",
        crm: "CRM/SP 142.890",
        summary: "Detectada SVE importante. Solicitado Ecocardiograma Transtorácico para mensuração de massa ventricular e espessura de septo interventricular.",
        badgeColor: "amber"
      }
    ]
  },
  {
    id: "pat-3",
    name: "Carlos Eduardo Costa",
    cpf: "45678912300",
    birthDate: "1995-11-02",
    email: "carlos.costa@hotmail.com",
    phone: "(31) 97555-4433",
    otpToken: "987654",
    allergies: ["Picada de Abelha / Himenópteros", "Látex natural"],
    medications: [],
    exams: []
  },
  {
    id: "pat-4",
    name: "Ana Julia Ribeiro",
    cpf: "55566677708",
    birthDate: "2002-12-05",
    email: "ana.ribeiro@outlook.com",
    phone: "(11) 96543-2109",
    otpToken: "246810",
    allergies: ["Sulfa / Sulfonamidas"],
    medications: ["Anticoncepcional Oral (1x ao dia)"],
    exams: [
      {
        id: "ex-4",
        title: "Beta HCG Quantitativo",
        date: "2026-05-18",
        provider: "Laboratório Santa Cecília",
        result: "Resultado: Negativo (< 2.0 mUI/mL). Ausência de gravidez no momento.",
        type: "laboratory"
      }
    ]
  },
  {
    id: "pat-5",
    name: "Marcos Paulo Souza",
    cpf: "22233344405",
    birthDate: "1960-03-30",
    email: "marcos.souza@yahoo.com",
    phone: "(19) 99111-2233",
    otpToken: "135790",
    allergies: ["Dipirona Monoidratada", "Penicilina"],
    medications: [
      "Atenolol 25mg (1x ao dia)",
      "Losartana Potássica 50mg (1x ao dia)",
      "Sinvastatina 20mg (1x à noite)"
    ],
    exams: [
      {
        id: "ex-5",
        title: "Perfil Lipídico e Função Renal",
        date: "2026-05-01",
        provider: "Laboratório Santa Cecília",
        result: "Colesterol Total: 185 mg/dL, HDL: 45 mg/dL, LDL: 110 mg/dL. Creatinina: 1.0 mg/dL.",
        type: "laboratory"
      }
    ]
  }
];

export const initialAuditLogs: AuditLog[] = [
  {
    id: "log-1",
    clinicName: "Clínica Vida Saudável",
    requesterEmail: "roberto.silva@vida.com.br",
    patientName: "Maria Oliveira Souza",
    authMethod: "token",
    requestType: "direct",
    requesterRole: "Médico Cardiologista (CRM/SP 142.890)",
    ipOrigin: "189.120.45.10",
    timestamp: "2026-05-20T10:14:00-03:00"
  },
  {
    id: "log-2",
    clinicName: "Hospital Metropolitano São Lucas",
    requesterEmail: "fernanda.souza@saolucas.com.br",
    patientName: "João Silva Santos",
    authMethod: "break_the_glass",
    requestType: "direct",
    requesterRole: "Médica Plantonista Emergencial",
    ipOrigin: "200.143.88.2",
    justification: "Paciente deu entrada desacordado no pronto-socorro após acidente doméstico com síncope prévia. Sem acompanhantes.",
    timestamp: "2026-05-20T15:30:00-03:00"
  },
  {
    id: "log-3",
    clinicName: "CardioCentro Integrado",
    requesterEmail: "ana.paula@cardiocentro.com.br",
    patientName: "Maria Oliveira Souza",
    authMethod: "token",
    requestType: "hl7_download",
    requesterRole: "Clínica Parceira Interoperável",
    ipOrigin: "177.18.200.55",
    timestamp: "2026-05-19T08:45:00-03:00"
  }
];

// Helper to generate HL7 FHIR Bundle representation of a patient
export function generateHL7FHIRBundle(patient: Patient): string {
  const timestamp = new Date().toISOString();
  
  const entries: Record<string, unknown>[] = [
    {
      resource: {
        resourceType: "Patient",
        id: patient.id,
        active: true,
        identifier: [
          {
            use: "official",
            system: "http://cadunico.gov.br/cpf",
            value: patient.cpf
          }
        ],
        name: [
          {
            use: "official",
            text: patient.name
          }
        ],
        telecom: [
          {
            system: "phone",
            value: patient.phone,
            use: "mobile"
          },
          {
            system: "email",
            value: patient.email
          }
        ],
        birthDate: patient.birthDate
      }
    }
  ];

  // Add Allergies
  patient.allergies.forEach((allergy, index) => {
    entries.push({
      resource: {
        resourceType: "AllergyIntolerance",
        id: `${patient.id}-all-${index + 1}`,
        clinicalStatus: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-clinical",
              code: "active"
            }
          ]
        },
        verificationStatus: {
          coding: [
            {
              system: "http://terminology.hl7.org/CodeSystem/allergyintolerance-verification",
              code: "confirmed"
            }
          ]
        },
        category: ["medication", "environment"],
        code: {
          text: allergy
        },
        patient: {
          reference: `Patient/${patient.id}`
        }
      }
    });
  });

  // Add Medications
  patient.medications.forEach((med, index) => {
    entries.push({
      resource: {
        resourceType: "MedicationStatement",
        id: `${patient.id}-med-${index + 1}`,
        status: "active",
        medicationCodeableConcept: {
          text: med
        },
        subject: {
          reference: `Patient/${patient.id}`
        },
        dateAsserted: timestamp
      }
    });
  });

  // Add Exam Reports
  patient.exams.forEach((exam) => {
    entries.push({
      resource: {
        resourceType: "DiagnosticReport",
        id: exam.id,
        status: "final",
        code: {
          text: exam.title
        },
        subject: {
          reference: `Patient/${patient.id}`
        },
        effectiveDateTime: exam.date,
        issued: exam.date + "T12:00:00Z",
        performer: [
          {
            display: exam.provider
          }
        ],
        conclusion: exam.result
      }
    });
  });

  const bundle = {
    resourceType: "Bundle",
    id: `bundle-${patient.id}-${Date.now()}`,
    type: "document",
    timestamp: timestamp,
    entry: entries
  };

  return JSON.stringify(bundle, null, 2);
}
