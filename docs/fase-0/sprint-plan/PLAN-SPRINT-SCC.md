# PLAN-SPRINT-SCC: Plano de Sprints - MVP

**Autor**: ms-pm-rafael (Manus AI)
**Data**: 02 de Março de 2026
**Versão**: 1.0
**Status**: Proposto
**Referências**: PRD-SCC-MVP v1.1, US-SCC-MVP v1.0, UX-SCC-MVP v1.0

---

## 1. Visão Geral do Planejamento

Este documento detalha o plano de execução para as Sprints da **Fase 0 (Setup & Planning)** e o início da **Fase 1 (Desenvolvimento do MVP)** do projeto SCC-NG. O objetivo é fornecer um roteiro claro e previsível para as próximas semanas, garantindo que os artefatos corretos sejam construídos na ordem certa e que os riscos sejam gerenciados proativamente.

**Duração da Sprint**: 2 semanas.

---

## 2. Fase 0: Setup & Planning (2 Sprints)

**Objetivo da Fase**: Concluir todos os artefatos de planejamento e configurar a infraestrutura básica para que o desenvolvimento possa começar na Sprint 2 sem impedimentos.

### Sprint 0: Kick-off e Fundação (Já concluída)

*   **Objetivo**: Alinhar o time, definir a visão e gerar os artefatos fundamentais.
*   **Itens Concluídos**:
    *   `PRD-SCC-MVP.md` (ms-po-juliana)
    *   `ADR-SCC-001.md` e `ADR-SCC-002.md` (ms-cto-eduardo)
    *   `US-SCC-MVP.md` (ms-analista-carlos)
    *   `UX-SCC-MVP.md` (ms-ux-luiz)
*   **Resultado**: Time alinhado e backlog de alto nível pronto para ser detalhado.

### Sprint 1: Planejamento e Infraestrutura (Próximas 2 semanas)

*   **Objetivo do Sprint**: **Finalizar o planejamento detalhado e ter o ambiente de Staging 100% funcional.**

| ID do Item | Título | Responsável(eis) | Estimativa (Dias) |
| :--- | :--- | :--- | :--- |
| **TASK-PM-01** | Detalhar e refinar todas as User Stories do MVP com o time | `ms-pm-rafael`, `ms-analista-carlos` | 2 |
| **TASK-DEVOPS-01** | Provisionar infraestrutura AWS para Staging (VPC, RDS, ECS, S3) | `ms-devops-fernanda` | 4 |
| **TASK-DEVOPS-02** | Configurar pipeline CI/CD no GitHub Actions para deploy em Staging | `ms-devops-fernanda` | 3 |
| **TASK-DEV-01** | Criar o boilerplate do projeto (Backend + Frontend) no repositório | `ms-dev-renata`, `ms-dev-andre` | 3 |
| **TASK-UX-01** | Criar protótipo navegável de alta fidelidade para o fluxo de Login e Cadastro de Clientes | `ms-ux-luiz` | 2 |

#### Riscos e Mitigações (Sprint 1)

| Risco | Mitigação |
| :--- | :--- |
| Atraso no provisionamento da infra AWS | `ms-devops-fernanda` deve seguir o `ADR-SCC-002` à risca e reportar qualquer bloqueio no primeiro dia. |
| Boilerplate do projeto incompatível com o pipeline | `ms-dev-renata` e `ms-devops-fernanda` devem trabalhar em conjunto desde o início para garantir a compatibilidade. |

---

## 3. Fase 1: Desenvolvimento do MVP (Início na Sprint 2)

**Objetivo da Fase**: Implementar, testar e implantar o fluxo de valor essencial do SCC-NG.

### Sprint 2: Fundação da Aplicação - Login e Clientes

*   **Objetivo do Sprint**: **Permitir que um usuário faça login e realize o CRUD completo de Clientes em ambiente de Staging.**

| ID do Item | Título da User Story | Responsável(eis) | Estimativa (Pontos) |
| :--- | :--- | :--- | :--- |
| **US-SEC-001** | Autenticação de Usuário | `ms-dev-andre` (Backend), `ms-dev-renata` (Frontend) | 5 |
| **US-SEC-002** | Cadastro de Usuários (CRUD Básico) | `ms-dev-andre` (Backend), `ms-dev-renata` (Frontend) | 8 |
| **US-CAD-001** | Gerenciamento de Clientes (CRUD Completo) | `ms-dev-andre` (Backend), `ms-dev-renata` (Frontend) | 13 |
| **TASK-QA-01** | Criar plano de testes para Autenticação e Clientes | `ms-qa-patricia` | 3 |

### Sprint 3: Produtos e Início do Comercial

*   **Objetivo do Sprint**: **Permitir o cadastro de produtos e a criação de uma proposta comercial simples.**

| ID do Item | Título da User Story | Responsável(eis) | Estimativa (Pontos) |
| :--- | :--- | :--- | :--- |
| **US-CAD-002** | Gerenciamento de Produtos e Serviços | `ms-dev-andre`, `ms-dev-renata` | 5 |
| **US-COM-001** | Criação de Proposta Comercial (sem aprovação) | `ms-dev-andre`, `ms-dev-renata` | 13 |
| **TASK-QA-02** | Criar plano de testes para Produtos e Propostas | `ms-qa-patricia` | 3 |

---

## 4. Cerimônias e Cadência

| Cerimônia | Frequência | Duração | Participantes |
| :--- | :--- | :--- | :--- |
| **Sprint Planning** | Início de cada Sprint (Segunda-feira) | 2 horas | Todos os agentes |
| **Daily Standup** | Diariamente | 15 minutos | Time de Execução (Devs, QA, UX, PM) |
| **Sprint Review** | Final de cada Sprint (Sexta-feira) | 1 hora | Todos + Stakeholders (Vinicius) |
| **Retrospectiva** | Final de cada Sprint (Sexta-feira) | 1 hora | Time de Execução + PM |
| **Refinamento do Backlog** | Uma vez por semana (Quarta-feira) | 1 hora | PO, Analista, PM, Devs, QA |

---

## 5. Template de Status Report (Comunicação com Stakeholders)

*Este template será usado pelo `ms-pm-rafael` para as comunicações semanais.*

**Assunto**: `[SCC-NG] Status Report - Sprint X - Semana Y`

**Olá, Vinicius,**

Segue o status do projeto SCC-NG para a **Sprint X**:

*   **Objetivo da Sprint**: [Objetivo definido no Sprint Plan]
*   **Progresso**: [XX]% concluído.
*   **O que foi entregue esta semana**:
    *   [US-XXX: Título da Story]
    *   [TASK-XXX: Título da Tarefa]
*   **O que está em andamento**:
    *   [US-YYY: Título da Story]
*   **Bloqueadores**: 
    *   [Descrever qualquer impedimento e o plano para resolvê-lo].
*   **Próximos Passos**: 
    *   [O que planejamos para a próxima semana].

Qualquer dúvida, estou à disposição.

**Atenciosamente,**
**ms-pm-rafael**

---

## 6. Próximos Passos Imediatos

1.  **Aprovação do Plano**: O sponsor (Vinicius) aprova este plano de Sprints.
2.  **Execução da Sprint 1**: `ms-devops-fernanda` inicia a criação da infraestrutura AWS. Os demais agentes iniciam as tarefas de planejamento e design detalhadas.
3.  **Handoff para GitHub**: `ms-orquestrador` irá criar o repositório `sccnovo` no GitHub e popular com todos os artefatos da Fase 0 (`PRD`, `ADRs`, `US`, `UX`, `PLAN-SPRINT`).
