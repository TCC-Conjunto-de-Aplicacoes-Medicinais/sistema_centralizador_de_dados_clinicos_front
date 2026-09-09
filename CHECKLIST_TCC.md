# 📋 Checklist de Alinhamento Acadêmico — CONIC 2026
## Módulo 4: Portal Web do Barramento Centralizador (Frontend)

> **Documento Base:** *Artigo CONIC SEMESP 2026 — Plataforma SaaS Open Health (POHINC)*  
> **Repositório:** `sistema_centralizador_de_dados_clinicos_front`  
> **Tecnologias Centrais:** Next.js (App Router), TypeScript, Tailwind CSS, HL7 FHIR Viewer  
> **Domínio de Produção Citado:** `https://central.pohinc.com.br`

---

### 📌 1. Visão Geral do Módulo no Artigo
Conforme descrito nas Seções **5, 6.1 e 6.2** do artigo:
* **Papel:** Interface web de auditoria e interoperabilidade clínica utilizada por clínicas e hospitais parceiros.
* **Funcionalidades no Artigo:**
  - Login institucional por código de clínica e credenciais de profissionais de saúde.
  - Busca federada de pacientes por CPF ou Nome.
  - Solicitação de prontuário e exames via código OTP do paciente ou protocolo emergencial *"Break the Glass"*.
  - Visualização de prontuário integrado, histórico de exames e exportação no padrão **HL7 FHIR Release 4**.
  - Monitoramento e visualização de trilhas de auditoria para fins de governança e conformidade com a LGPD.

---

### 🎯 2. Status Atual da Implementação
- [x] Interface moderna e responsiva com alternância de tema Claro / Escuro.
- [x] Componentes estruturados: `LoginView`, `PatientSearch`, `PatientRequestPanel`, `ClinicalDataDisplay`, `AuditLogsTable` e `PrintPreviewModal`.
- [x] Suporte à renderização visual de bundles HL7 FHIR e prontuários médicos.

---

### ⏳ 3. Pendências e Itens Faltantes para Alinhamento com a Documentação

#### 3.1. Conexão Real com a API do Backend (Substituição do Mock) — 🚨 GAP CRÍTICO
- [ ] **Desacoplar do `mockData.ts` e implementar requisições HTTP:**
  - *Problema:* O frontend atual **não realiza chamadas de rede** (não possui chamadas `fetch` ou `axios`). Toda a navegação de pacientes, logs e autenticação ocorre em memória com dados fictícios.
  - O backend (`sistema_centralizador_de_dados_clinicos_back`) **já possui os endpoints prontos**, bastando conectá-los no frontend:
    - [ ] `LoginView.tsx`: Conectar ao endpoint `POST http://localhost:8002/api/auth/login` (enviando `clinicCode`, `email`, `password`) e armazenar o JWT gerado no `localStorage`.
    - [ ] `PatientSearch.tsx`: Conectar ao endpoint `GET http://localhost:8002/api/patients/search?cpf=...&name=...`.
    - [ ] `PatientRequestPanel.tsx`: Conectar ao endpoint `POST http://localhost:8002/api/patients/request-data` enviando o método (`token` com OTP ou `break_the_glass` com justificativa médica).
    - [ ] `ClinicalDataDisplay.tsx`: Conectar ao endpoint `GET http://localhost:8002/api/patients/:id/hl7-fhir` para carregar o Bundle FHIR real gerado pelo backend.

#### 3.2. Consulta Dinâmica dos Logs de Auditoria
- [ ] **Integração de `AuditLogsTable.tsx`:**
  - *Problema:* A tabela de logs atualmente lê a constante estática `initialAuditLogs`.
  - *Ação:* Criar endpoint no backend ou carregar os registros de auditoria da tabela `access_audit_log` / `register_logs` para exibir em tempo real os acessos àquele prontuário.

#### 3.3. Configuração de Variáveis de Ambiente de Produção
- [ ] **Criar `.env.local` e `.env.example`:**
  - Configurar a variável `NEXT_PUBLIC_API_URL` para apontar tanto para `http://localhost:8002` (em desenvolvimento) quanto para `https://central.pohinc.com.br/api` (em produção).
