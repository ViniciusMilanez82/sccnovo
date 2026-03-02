# Checklist de Release — SCC-NG MVP

---

**Release**: `v1.0.0-MVP`
**Data**: `2026-03-02`
**Responsável pelo Deploy**: `ms-devops-fernanda`

---

Este documento detalha o checklist completo para o deploy da versão MVP do sistema SCC-NG em produção na AWS. O deploy só deve ser iniciado após todos os itens serem verificados e aprovados.

## Fase 1: Pré-Deploy (Code Freeze)

| Status | Item | Responsável | Detalhes |
|---|---|---|---|
| [ ] | **Escopo da Release Fechado** | `ms-pm-rafael` | Confirmar que todas as User Stories do MVP (Sprints 1-4) estão no branch `main` e nenhuma outra feature foi adicionada. |
| [ ] | **Pipeline CI/CD Verde** | `ms-devops-fernanda` | Verificar se o último build no branch `main` passou em todas as etapas: build, lint, testes unitários/integração e scan de vulnerabilidades. |
| [ ] | **Plano de Testes de Aceitação Executado** | `ms-qa-patricia` | Confirmar que todos os testes P0 e P1 do plano de testes foram executados e aprovados. |
| [ ] | **Evidências de QA Coletadas** | `ms-qa-patricia` | Garantir que todas as evidências (screenshots, logs) da execução dos testes estão anexadas ao relatório de QA. |
| [ ] | **Aprovação do PO (Product Owner)** | `ms-po-juliana` | Obter o "go" formal da PO, confirmando que as funcionalidades entregues atendem aos critérios de aceite do negócio. |
| [ ] | **Migrações de Banco de Dados Testadas** | `ms-dev-andre` | Executar e validar as migrações do Prisma em um banco de dados de staging limpo para garantir que o schema é criado corretamente. |
| [ ] | **Plano de Rollback Documentado e Testado** | `ms-devops-fernanda` | O plano de rollback (reverter para a versão anterior da imagem Docker no ECS) deve estar documentado no `RUNBOOK-AWS-SCC.md` e ter sido testado em staging. |
| [ ] | **Segredos de Produção Configurados** | `ms-devops-fernanda` | Garantir que todas as variáveis de ambiente e segredos (JWT secret, senhas de banco) estão configurados no AWS Secrets Manager. |
| [ ] | **Backup do Banco de Dados de Produção (se existente)** | `ms-devops-fernanda` | Realizar um snapshot manual do banco de dados RDS de produção antes de aplicar qualquer migração. |

## Fase 2: Deploy em Produção

| Status | Item | Responsável | Detalhes |
|---|---|---|---|
| [ ] | **Comunicar Início da Janela de Deploy** | `ms-pm-rafael` | Informar aos stakeholders o início da janela de manutenção/deploy. |
| [ ] | **Aplicar Migrações de Banco de Dados** | `ms-devops-fernanda` | Executar o comando `npx prisma migrate deploy` na bastion machine ou via uma tarefa do ECS antes do deploy da aplicação. |
| [ ] | **Executar o Deploy via Pipeline** | `ms-devops-fernanda` | Disparar o workflow de deploy para produção no GitHub Actions, que irá construir e publicar as novas imagens Docker no ECR e atualizar o serviço no ECS. |
| [ ] | **Monitorar o Deploy no ECS** | `ms-devops-fernanda` | Acompanhar o status do deploy no console do ECS, garantindo que as novas tasks fiquem saudáveis e as antigas sejam drenadas. |

## Fase 3: Pós-Deploy (Smoke Tests e Validação)

| Status | Item | Responsável | Detalhes |
|---|---|---|---|
| [ ] | **Executar Smoke Tests Automatizados** | `ms-qa-patricia` | Rodar a suíte de smoke tests que valida a saúde básica da aplicação (ex: acesso à tela de login, resposta do endpoint de health check). |
| [ ] | **Executar Smoke Tests Manuais** | `ms-qa-patricia` | Realizar um teste manual rápido nos fluxos mais críticos:
| | 1. Login com o usuário administrador.
| | 2. Acessar a página de Clientes e verificar se a lista carrega.
| | 3. Acessar o Dashboard e verificar se os KPIs carregam. |
| [ ] | **Verificar Dashboards de Observabilidade** | `ms-devops-fernanda` | Checar os dashboards no CloudWatch/Grafana para garantir que não há picos de erro (5xx), latência ou uso de CPU após o deploy. |
| [ ] | **Verificar Logs da Aplicação** | `ms-devops-fernanda` | Analisar os logs da aplicação no CloudWatch Logs para procurar por erros inesperados ou warnings críticos. |
| [ ] | **Comunicar Fim da Janela de Deploy** | `ms-pm-rafael` | Informar aos stakeholders que o deploy foi concluído com sucesso e o sistema está operacional. |

---

**Aprovação Final para Deploy:**

- **QA (Patrícia):** _________________________
- **DevOps (Fernanda):** _________________________
- **PO (Juliana):** _________________________
