# ADR-SCC-001: Stack Tecnológico do SCC-NG

**Projeto**: SCC-NG (Next Generation)
**Autor**: ms-cto-eduardo (Manus AI)
**Data**: 02 de Março de 2026
**Status**: ✅ Aceito
**Referência PRD**: PRD-SCC-MVP v1.1

---

## 1. Contexto

O projeto SCC-NG é a reconstrução completa do Sistema de Controle de Contêineres da Multiteiner, migrando de uma plataforma legada (Visual FoxPro + SQL Server) para uma aplicação web moderna. A escolha do stack tecnológico é a decisão de maior impacto do projeto, pois definirá a velocidade de desenvolvimento, a facilidade de manutenção futura, o custo operacional e a capacidade de atrair e reter desenvolvedores.

**Forças e Restrições:**
- O time de desenvolvimento é composto pelos agentes MULTISOFT, sem restrição de linguagem.
- O sistema precisa ser uma aplicação web acessível por navegador, sem instalação local.
- A infraestrutura será na AWS.
- O banco de dados de destino é o PostgreSQL (decisão já tomada pelo cliente).
- O sistema precisa expor APIs RESTful para futuras integrações (ERP TOTVS, Fase 3).
- O prazo estimado para o MVP é de 6 meses.

---

## 2. Decisão

**Stack tecnológico adotado para o SCC-NG:**

| Camada | Tecnologia | Versão Mínima |
| :--- | :--- | :--- |
| **Backend (API)** | Node.js com TypeScript + Express.js (ou Fastify) | Node.js 20 LTS |
| **Frontend (UI)** | React com TypeScript + Vite | React 18 |
| **Estilização** | TailwindCSS | v3 |
| **Banco de Dados** | PostgreSQL | v15 |
| **ORM** | Prisma | v5 |
| **Autenticação** | JWT (JSON Web Tokens) com bcrypt para hash de senhas | — |
| **Validação** | Zod (backend e frontend compartilhado) | v3 |
| **Testes (Backend)** | Jest + Supertest | — |
| **Testes (Frontend)** | Vitest + React Testing Library | — |
| **Containerização** | Docker + Docker Compose | — |
| **CI/CD** | GitHub Actions | — |

**Justificativa da decisão:** Node.js com TypeScript oferece um ecossistema maduro, altíssima produtividade e um modelo de programação assíncrono ideal para APIs de alto throughput. React é o framework frontend mais adotado do mercado, com vasto ecossistema de componentes. O uso de TypeScript em ambas as camadas garante segurança de tipos de ponta a ponta, reduzindo drasticamente erros em tempo de execução. Prisma como ORM oferece type-safety na camada de banco de dados e facilita as migrações. TailwindCSS acelera o desenvolvimento de UI sem sacrificar a customização.

---

## 3. Alternativas Consideradas

### Alternativa A: .NET Core (C#) + React

| | |
|---|---|
| **Prós** | Excelente performance, tipagem forte nativa, ótimo suporte a CNAB (bibliotecas .NET maduras), bom para sistemas financeiros. |
| **Contras** | Curva de aprendizado maior, ecossistema mais verboso, menor velocidade de prototipação para o MVP. |
| **Motivo da Rejeição** | A velocidade de desenvolvimento do Node.js/TypeScript para o prazo do MVP é superior. A maturidade das bibliotecas CNAB para Node.js já é suficiente. |

### Alternativa B: Python (FastAPI) + React

| | |
|---|---|
| **Prós** | Excelente para lógica de negócio complexa, ótimo para fases futuras com IA (ms-ia-sofia). |
| **Contras** | Performance inferior ao Node.js para APIs de alta concorrência, ecossistema de ORM menos maduro para PostgreSQL no contexto de aplicações transacionais. |
| **Motivo da Rejeição** | Node.js é mais adequado para o perfil de carga do SCC-NG (muitas requisições de CRUD concorrentes). Python pode ser adotado em microsserviços de IA nas Fases futuras. |

### Alternativa C: Java (Spring Boot) + React

| | |
|---|---|
| **Prós** | Extremamente robusto, maduro e escalável. Excelente para sistemas financeiros de grande porte. |
| **Contras** | Altíssima verbosidade, lentidão no ciclo de desenvolvimento, overhead de infraestrutura (JVM). Excessivo para o tamanho atual do SCC-NG. |
| **Motivo da Rejeição** | Overkill para o porte atual. O custo de desenvolvimento e operação é desproporcionalmente alto. |

---

## 4. Consequências (Trade-offs)

| Aspecto | Impacto |
| :--- | :--- |
| **Velocidade de Desenvolvimento** | ✅ **Positivo**: O ecossistema Node.js/React/TypeScript é o mais produtivo para o perfil do projeto. |
| **Segurança de Tipos** | ✅ **Positivo**: TypeScript em ambas as camadas reduz bugs em produção. Zod valida dados na entrada da API. |
| **Performance** | ✅ **Positivo**: Node.js é excelente para I/O intensivo (consultas ao banco). Para cálculos pesados (faturamento em lote), serão usadas filas de processamento (ex: Bull/BullMQ). |
| **Ecossistema CNAB** | ⚠️ **Neutro**: Existem bibliotecas Node.js para CNAB (ex: `node-boleto-br`), mas menos maduras que as .NET. Será necessária validação cuidadosa. |
| **Manutenibilidade** | ✅ **Positivo**: TypeScript + Prisma geram código autodocumentado e fácil de manter. |
| **Custo de Infra** | ✅ **Positivo**: Node.js tem baixo consumo de memória, reduzindo custos na AWS. |
| **Risco de Contratação** | ✅ **Positivo**: Node.js/React é a stack com maior oferta de profissionais no mercado brasileiro. |

**Dívida Técnica Introduzida:** Nenhuma significativa. O stack escolhido é moderno e bem suportado.

---

## 5. Plano de Implementação

1. **Semana 1 (DevOps Fernanda)**: Criar repositório `sccnovo` com a estrutura de diretórios definida no ADR-SCC-002. Configurar o `package.json` e o `tsconfig.json` para backend e frontend.
2. **Semana 1-2 (Dev Renata + Dev André)**: Implementar o boilerplate do projeto: servidor Express/Fastify, conexão com PostgreSQL via Prisma, middleware de autenticação JWT, e estrutura base do React com React Router.
3. **Semana 2 (DevOps Fernanda)**: Configurar o pipeline CI/CD no GitHub Actions para build, lint e testes.
4. **Semana 2 em diante**: Desenvolvimento das features do MVP conforme o Sprint Plan.

---

## 6. Plano de Rollback

**Critério para acionar rollback**: Identificação de limitação técnica fundamental do stack que impeça a implementação de um requisito crítico do MVP (ex: impossibilidade de gerar CNAB 400 com fidelidade).

**Passos para reverter**:
1. Avaliar o escopo da limitação com o `ms-cto-eduardo`.
2. Se a limitação for pontual (ex: CNAB), avaliar a adoção de um microsserviço em outra linguagem (.NET) para aquele módulo específico.
3. Se a limitação for estrutural, convocar uma reunião de decisão técnica de emergência com o sponsor (Vinicius Milanez) para redefinir o stack.

**Impacto do rollback**: Alto. Uma mudança de stack após o início do desenvolvimento implicaria em reescrita de código e atraso significativo no cronograma.

---

## Próximos Passos

- **ms-devops-fernanda**: Criar o repositório e a estrutura de projeto com base neste ADR. → **ADR-SCC-002**.
- **ms-dev-renata + ms-dev-andre**: Implementar o boilerplate do projeto na Sprint 2.
- **ms-analista-carlos**: As User Stories devem referenciar este ADR para garantir que os critérios de aceite técnicos sejam respeitados.
