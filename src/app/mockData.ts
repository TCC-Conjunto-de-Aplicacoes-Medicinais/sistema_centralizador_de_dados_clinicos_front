export interface Exam {
  id: string;
  title: string;
  date: string;
  provider: string;
  result: string;
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
}

export interface Clinic {
  id: string;
  name: string;
  type: 'internal' | 'partner';
}

export interface ClinicUser {
  clinicId: string;
  email: string;
  passwordHash: string;
  name: string;
  role: string;
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
  { id: "CLI-1001", name: "Clínica Vida Saudável", type: "internal" },
  { id: "CLI-2002", name: "Hospital Metropolitano São Lucas", type: "internal" },
  { id: "CLI-3003", name: "CardioCentro Integrado", type: "partner" },
  { id: "CLI-4004", name: "Laboratório Santa Cecília", type: "partner" }
];

export const mockClinicUsers: ClinicUser[] = [
  {
    clinicId: "CLI-1001",
    email: "roberto.silva@vida.com.br",
    passwordHash: "senha123",
    name: "Dr. Roberto Silva",
    role: "Médico Cardiologista"
  },
  {
    clinicId: "CLI-2002",
    email: "fernanda.souza@saolucas.com.br",
    passwordHash: "senha123",
    name: "Dra. Fernanda Souza",
    role: "Médica Pediatra"
  },
  {
    clinicId: "CLI-3003",
    email: "ana.paula@cardiocentro.com.br",
    passwordHash: "senha123",
    name: "Dra. Ana Paula",
    role: "Clínica Geral (Parceira)"
  },
  {
    clinicId: "CLI-4004",
    email: "thiago.costa@santacecilia.com.br",
    passwordHash: "senha123",
    name: "Dr. Thiago Costa",
    role: "Médico Patologista (Parceiro)"
  }
];

export const mockPatients: Patient[] = [
  {
    id: "pat-1",
    name: "Maria Oliveira Souza",
    cpf: "12345678909",
    birthDate: "1988-04-12",
    email: "maria.souza@gmail.com",
    phone: "(11) 98765-4321",
    otpToken: "123456",
    allergies: ["Dipirona Monoidratada", "Poeira/Ácaros", "PenicilinaG"],
    medications: [
      "Losartana Potássica 50mg (1 comprimido a cada 12 horas)",
      "Metformina 850mg (1 comprimido no almoço e janta)",
      "Vitamina D 2000 UI (1 gota ao dia)"
    ],
    exams: [
      {
        id: "ex-1",
        title: "Hemograma Completo",
        date: "2026-04-15",
        provider: "Laboratório Santa Cecília",
        result: "Anemia leve identificada (Hemoglobina: 11.2 g/dL), demais parâmetros dentro do padrão referencial."
      },
      {
        id: "ex-2",
        title: "Eletrocardiograma (ECG)",
        date: "2026-05-10",
        provider: "CardioCentro Integrado",
        result: "Ritmo sinusal regular, frequência cardíaca média de 72 bpm, sem evidência de alterações de repolarização."
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
      "Atorvastatina 20mg (1 comprimido à noite)",
      "Omeprazol 20mg (1 comprimido pela manhã em jejum)"
    ],
    exams: [
      {
        id: "ex-3",
        title: "Glicemia de Jejum",
        date: "2026-03-20",
        provider: "Laboratório Santa Cecília",
        result: "Glicose sérica: 96 mg/dL. Valores de referência: 70 a 99 mg/dL (Desejável)."
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
        result: "Resultado: Negativo (< 2.0 mUI/mL). Ausência de gravidez no momento."
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
        title: "Perfil Lipídico",
        date: "2026-05-01",
        provider: "Laboratório Santa Cecília",
        result: "Colesterol Total: 185 mg/dL, HDL: 45 mg/dL, LDL: 110 mg/dL, Triglicerídeos: 150 mg/dL. Risco cardiovascular baixo."
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
    timestamp: "2026-05-20T10:14:00-03:00"
  },
  {
    id: "log-2",
    clinicName: "Hospital Metropolitano São Lucas",
    requesterEmail: "fernanda.souza@saolucas.com.br",
    patientName: "João Silva Santos",
    authMethod: "break_the_glass",
    requestType: "direct",
    justification: "Paciente deu entrada desacordado no pronto-socorro após acidente doméstico. Sem acompanhantes.",
    timestamp: "2026-05-20T15:30:00-03:00"
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
