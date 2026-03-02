# SCC-NG: Sistema de Controle de Contêineres - Next Generation

**Empresa**: Multiteiner
**Sponsor**: Vinicius Milanez
**Início do Projeto**: 02 de Março de 2026
**Status**: Fase 0 — Discovery & Planning

---

## Sobre o Projeto

O **SCC-NG** é a reconstrução completa do Sistema de Controle de Contêineres (SCC) legado, migrando de uma plataforma Visual FoxPro/SQL Server para uma aplicação web moderna, robusta e escalável.

## Stack Tecnológico

| Camada | Tecnologia |
| :--- | :--- |
| **Backend** | Node.js + TypeScript + Express.js |
| **Frontend** | React + TypeScript + TailwindCSS |
| **Banco de Dados** | PostgreSQL (via Prisma ORM) |
| **Infraestrutura** | AWS (ECS Fargate + RDS + S3 + CloudFront) |
| **CI/CD** | GitHub Actions |

## Estrutura do Repositório

```
sccnovo/
├── docs/                          # Documentação do projeto
│   ├── SCC-MAPA-DA-MISSAO.md      # Plano diretor do projeto
│   └── fase-0/                    # Artefatos da Fase 0 (Discovery & Planning)
│       ├── prd/                   # Product Requirements Document
│       ├── adr/                   # Architecture Decision Records
│       ├── user-stories/          # User Stories (Backlog)
│       ├── ux/                    # Especificações de UX/UI
│       └── sprint-plan/           # Plano de Sprints
├── backend/                       # Código-fonte do backend (Node.js)
└── frontend/                      # Código-fonte do frontend (React)
```

## Documentação da Fase 0

| Artefato | Arquivo | Responsável |
| :--- | :--- | :--- |
| Mapa da Missão | `docs/SCC-MAPA-DA-MISSAO.md` | ms-orquestrador |
| PRD - MVP | `docs/fase-0/prd/PRD-SCC-MVP.md` | ms-po-juliana |
| ADR-001 - Stack | `docs/fase-0/adr/ADR-SCC-001-Stack-Tecnologico.md` | ms-cto-eduardo |
| ADR-002 - Infra AWS | `docs/fase-0/adr/ADR-SCC-002-Infraestrutura-AWS.md` | ms-cto-eduardo |
| User Stories - MVP | `docs/fase-0/user-stories/US-SCC-MVP.md` | ms-analista-carlos |
| UX/UI - MVP | `docs/fase-0/ux/UX-SCC-MVP.md` | ms-ux-luiz |
| Plano de Sprints | `docs/fase-0/sprint-plan/PLAN-SPRINT-SCC.md` | ms-pm-rafael |
