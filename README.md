# Sistema Centralizador de Dados Clínicos (Front-end)

Este repositório contém a interface web do **Sistema Centralizador de Dados Clínicos**, uma plataforma moderna de integração, visualização e auditoria de registros de saúde em conformidade com as regulamentações brasileiras e padrões internacionais de interoperabilidade.

O sistema atua como um mediador de saúde eletrônica, permitindo que clínicas integradas consultem de forma segura históricos clínicos consolidados de pacientes (alergias, medicamentos contínuos e laudos de exames) de diversas fontes, tudo estruturado sob o padrão internacional **HL7 FHIR**.

---

## 📌 Principais Funcionalidades

### 1. Autenticação e Gestão de Sessão por Perfil de Clínica
*   **Acesso Restrito**: Login seguro para profissionais de saúde associados a clínicas registradas.
*   **Identificação Visual Clara**: Cabeçalho adaptativo que exibe o nome da clínica, tipo de estabelecimento (Interna ou Parceira) e credenciais do profissional ativo.

### 2. Controle de Acesso Seguro e Consentimento
*   **Validação OTP (One-Time Password)**: Para consultas eletivas, o sistema exige um token de autorização de 6 dígitos enviado ao celular do paciente, garantindo o consentimento explícito.
*   **Protocolo de Emergência (Break the Glass)**: Em cenários críticos (ex: paciente inconsciente no pronto-socorro), profissionais autorizados podem realizar o bypass do token OTP mediante o registro formal de justificativa médica e identificação profissional (CRM/Coren), gerando logs auditáveis imediatos para conformidade com a LGPD.

### 3. Visualização Unificada de Dados Clínicos
*   **Visão de Prontuário Consolidada**: Exibição limpa de Alergias e Reações Adversas, Medicamentos de Uso Contínuo e Laudos de Exames.
*   **Design Responsivo e Acessível**: Interface moderna adaptada para múltiplos dispositivos, com suporte completo a **Tema Escuro (Dark Mode)** e **Tema Claro (Light Mode)**.

### 4. Padrões de Interoperabilidade e Exportação
*   **Geração de Bundles HL7 FHIR**: Exportação de dados do paciente no formato padrão JSON (Bundle FHIR), contendo recursos como `Patient`, `AllergyIntolerance`, `MedicationStatement` e `DiagnosticReport`.
*   **Ficha Clínica RNDS de Alta Fidelidade**: Visualização para impressão estilizada no padrão de ficha da **RNDS (Rede Nacional de Dados de Saúde)**, incluindo assinatura digital simulada no padrão ICP-Brasil e hash SHA-256 de veracidade documental.

### 5. Auditoria Completa (Logs de Acesso)
*   Tabela integrada de auditoria em tempo real, exibindo quem acessou, quando acessou, de qual paciente e qual método de consentimento/urgência foi utilizado.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando as ferramentas mais modernas do ecossistema front-end:

*   **Core**: [Next.js 16 (App Router)](https://nextjs.org/) & [React 19](https://react.dev/)
*   **Linguagem**: [TypeScript](https://www.typescriptlang.org/)
*   **Estilização**: [Tailwind CSS v4](https://tailwindcss.com/) com PostCSS (Layout fluido, variáveis CSS e suporte nativo a dark mode)
*   **Testes**: [Jest](https://jestjs.io/) & [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
*   **Padronização de Saúde**: Padrão **HL7 FHIR v4** para modelagem de dados clínicos intercambiáveis.

---

## 📁 Estrutura de Pastas e Organização

A organização do código segue as melhores práticas do Next.js (App Router), dividida de forma modular:

```text
sistema_centralizador_de_dados_clinicos_front/
├── .github/                # Configurações de CI/CD (Pipelines de Deploy e Lint)
├── public/                 # Ativos estáticos (imagens, ícones, logos)
├── src/
│   ├── app/                # Estrutura do Next.js App Router
│   │   ├── layout.tsx      # Configuração global de fontes, metadados e estrutura HTML
│   │   ├── page.tsx        # Página principal (Dashboard Mediador) - Composição de estados
│   │   └── mockData.ts     # Tipagem TypeScript, dados fictícios de teste e gerador de FHIR Bundles
│   └── components/         # Componentes reutilizáveis do sistema
│       ├── LoginView.tsx             # Interface e validação de login por clínica
│       ├── DashboardHeader.tsx       # Cabeçalho da plataforma e dados da sessão
│       ├── PatientSearch.tsx         # Campo de busca de pacientes (CPF ou Nome)
│       ├── SandboxPatients.tsx       # Sidebar de desenvolvedor (atalho para carga rápida de teste)
│       ├── PatientRequestPanel.tsx   # Painel de controle de acesso (OTP / Break the Glass)
│       ├── ClinicalDataDisplay.tsx   # Painel de exibição estruturada de prontuários e exames
│       ├── ClinicalDocumentSheet.tsx # Sumário Clínico com folha de estilo de impressão (RNDS/ICP-Brasil)
│       ├── PrintPreviewModal.tsx     # Janela de preview antes de acionar a impressão
│       └── ThemeToggle.tsx           # Botão interativo para comutação de tema (Light/Dark)
├── eslint.config.mjs       # Configuração refinada do ESLint
├── tsconfig.json           # Configurações do compilador TypeScript
├── tailwind.config.js      # Temas personalizados, fontes e cores de design
├── jest.config.ts          # Configurações de execução de testes unitários
└── package.json            # Scripts de execução e dependências do projeto
```

---

## 🚀 Como Executar o Projeto Localmente

### Pré-requisitos
Certifique-se de possuir o [Node.js](https://nodejs.org/) instalado em sua máquina (versão LTS recomendada).

### 1. Instalar as Dependências
Abra o terminal na pasta raiz do projeto e execute:
```bash
npm install
```

### 2. Rodar em Ambiente de Desenvolvimento
Para iniciar o servidor local com hot-reloading:
```bash
npm run dev
```
Acesse [http://localhost:3000](http://localhost:3000) no seu navegador para ver e interagir com o painel.

### 3. Executar Verificações do Linter (ESLint)
Para garantir que o código segue as diretrizes do Next.js e TypeScript sem erros de sintaxe ou regras de hooks:
```bash
npm run lint
```

### 4. Executar os Testes Unitários
Para rodar a suíte de testes configurada no projeto:
```bash
npm run test
```

### 5. Compilar para Produção (Build)
Para testar a otimização de build final:
```bash
npm run build
```

---

## 🔒 Segurança e Conformidade (LGPD & RNDS)

*   **Minimização de Dados**: Apenas dados estritamente necessários para o atendimento clínico de urgência ou eletivo são expostos após a validação de segurança.
*   **Rastreabilidade Total**: Todo acesso à ficha médica é registrado na tabela de auditoria local (e encaminhado para os barramentos de conformidade).
*   **Interoperabilidade Semântica**: O uso do **FHIR Bundle** no formato JSON garante a portabilidade de dados em conformidade com as portarias de saúde digital brasileiras.
