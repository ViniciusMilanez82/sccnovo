# Plano de Testes de Aceitação — SCC-NG MVP

---

**Produto**: Sistema de Controle de Contêineres (SCC-NG)
**Versão**: `v1.0.0-MVP`
**Responsável pela Execução**: `ms-qa-patricia`

---

## 1. Visão Geral

Este documento descreve a estratégia e o plano de testes de aceitação para a versão MVP do sistema SCC-NG. O objetivo é validar que todas as funcionalidades implementadas nas Sprints 1 a 4 atendem aos critérios de aceite definidos nas User Stories e que o sistema está estável e pronto para o deploy em produção.

## 2. Escopo da Release

O escopo deste plano de testes cobre todas as User Stories do MVP, detalhadas no arquivo `docs/fase-0/user-stories/US-SCC-MVP.md`.

- **Segurança**: US-SEC-001
- **Cadastros**: US-CAD-001
- **Comercial**: US-COM-001, US-COM-002
- **Locação**: US-LOC-001
- **Faturamento**: US-FAT-001
- **Financeiro**: US-FIN-001
- **Dashboard**: US-DASH-001

## 3. Estratégia de Testes

A validação será realizada através de uma combinação de testes manuais de ponta a ponta (E2E) e testes de API, focando nos fluxos críticos do negócio.

- **Ambiente de Teste**: O deploy será feito em um ambiente de `staging` na AWS, idêntico ao de produção.
- **Dados de Teste**: Serão utilizados os dados do `seed.ts` e novos dados criados manualmente durante os testes.
- **Navegadores**: Chrome (última versão) em desktop.

## 4. Critérios de Aprovação (Go/No-Go)

- **100%** dos casos de teste de prioridade **P0 (Crítico)** devem passar.
- **100%** dos casos de teste de prioridade **P1 (Alta)** devem passar.
- Nenhum bug bloqueante (blocker) ou crítico (critical) pode estar aberto.
- Todos os critérios de aceite das User Stories do MVP devem ser validados com sucesso, com evidências (screenshots) anexadas.

## 5. Casos de Teste

A seguir, a lista detalhada de casos de teste a serem executados.

### Módulo: Segurança (US-SEC-001)

| ID | Prioridade | Descrição | Passos | Resultado Esperado | Status |
|---|---|---|---|---|---|
| TC-SEC-01 | P0 | **Login com sucesso (Admin)** | 1. Navegar para a tela de login. 2. Inserir e-mail `admin@multiteiner.com.br` e senha `Admin@2026!`. 3. Clicar em "Entrar". | O usuário é redirecionado para o Dashboard. O nome "Administrador" aparece no layout. | [ ] |
| TC-SEC-02 | P1 | **Login com senha incorreta** | 1. Navegar para a tela de login. 2. Inserir e-mail `admin@multiteiner.com.br` e senha `errada`. 3. Clicar em "Entrar". | Uma mensagem de erro "Credenciais inválidas" é exibida. O usuário permanece na tela de login. | [ ] |
| TC-SEC-03 | P1 | **Acesso não autorizado** | 1. Fazer login como Vendedor (`vera@multiteiner.com.br`). 2. Tentar acessar a URL `/usuarios` diretamente. | O usuário deve ser redirecionado para uma página de "Acesso Negado" ou para o Dashboard, e não deve conseguir ver a lista de usuários. | [ ] |

### Módulo: Clientes (US-CAD-001)

| ID | Prioridade | Descrição | Passos | Resultado Esperado | Status |
|---|---|---|---|---|---|
| TC-CAD-01 | P0 | **Criar novo cliente (Pessoa Física)** | 1. Logar como Admin. 2. Navegar para "Clientes". 3. Clicar em "Novo Cliente". 4. Preencher todos os campos para uma PF, incluindo um CEP válido. 5. Clicar em "Salvar". | O cliente é criado com sucesso e aparece na lista. Uma notificação de sucesso é exibida. O endereço é preenchido automaticamente após digitar o CEP. | [ ] |
| TC-CAD-02 | P1 | **Buscar cliente por nome** | 1. Logar como Admin. 2. Navegar para "Clientes". 3. Digitar as três primeiras letras do nome de um cliente existente no campo de busca. | A lista é filtrada em tempo real, mostrando apenas os clientes que correspondem à busca. | [ ] |
| TC-CAD-03 | P1 | **Tentar criar cliente com CPF duplicado** | 1. Logar como Admin. 2. Tentar criar um novo cliente usando um CPF que já existe no sistema. | O formulário exibe uma mensagem de erro informando que o CPF já está em uso. O cliente não é criado. | [ ] |

### Módulo: Produtos (US-COM-001)

| ID | Prioridade | Descrição | Passos | Resultado Esperado | Status |
|---|---|---|---|---|---|
| TC-PROD-01 | P1 | **Criar novo produto** | 1. Logar como Gerente. 2. Navegar para "Produtos". 3. Clicar em "Novo Produto". 4. Preencher nome, código e preço. 5. Clicar em "Salvar". | O produto é criado com sucesso e aparece na lista. | [ ] |

### Módulo: Propostas (US-COM-002)

| ID | Prioridade | Descrição | Passos | Resultado Esperado | Status |
|---|---|---|---|---|---|
| TC-PROP-01 | P0 | **Criar e aprovar uma proposta** | 1. Logar como Vendedor. 2. Criar um cliente. 3. Criar um produto. 4. Navegar para "Propostas" e criar uma nova proposta para o cliente, adicionando o produto. 5. Logar como Gerente. 6. Encontrar a proposta com status "Aguardando" e clicar em "Aprovar". | A proposta é criada com sucesso. O status muda de "Rascunho" para "Aguardando". Após a aprovação, o status muda para "Aprovada". | [ ] |

### Módulo: Contratos (US-LOC-001)

| ID | Prioridade | Descrição | Passos | Resultado Esperado | Status |
|---|---|---|---|---|---|
| TC-CONT-01 | P0 | **Converter proposta em contrato** | 1. Logar como Gerente. 2. Encontrar uma proposta "Aprovada". 3. Clicar na opção "Gerar Contrato". | Um novo contrato é criado com os mesmos itens e valores da proposta. O contrato aparece na lista de Contratos com status "ATIVO". | [ ] |

### Módulo: Faturamento (US-FAT-001)

| ID | Prioridade | Descrição | Passos | Resultado Esperado | Status |
|---|---|---|---|---|---|
| TC-FAT-01 | P0 | **Gerar fatura de um contrato** | 1. Logar como Financeiro. 2. Navegar para "Faturamento". 3. Clicar em "Gerar Fatura". 4. Inserir o ID de um contrato "ATIVO". 5. Preencher as datas e salvar. | A fatura é gerada com o valor correto do contrato e status "PENDENTE". Ela aparece na lista de faturas. | [ ] |

### Módulo: Financeiro (US-FIN-001)

| ID | Prioridade | Descrição | Passos | Resultado Esperado | Status |
|---|---|---|---|---|---|
| TC-FIN-01 | P0 | **Baixar pagamento de uma fatura** | 1. Logar como Financeiro. 2. Navegar para "Financeiro". 3. Encontrar uma fatura "PENDENTE" ou "VENCIDA". 4. Clicar em "Baixar". 5. Preencher os dados do pagamento e confirmar. | O pagamento é registrado. A fatura muda seu status para "PAGA". O valor pago é refletido nos KPIs do Dashboard. | [ ] |

### Módulo: Dashboard (US-DASH-001)

| ID | Prioridade | Descrição | Passos | Resultado Esperado | Status |
|---|---|---|---|---|---|
| TC-DASH-01 | P1 | **Validar KPIs do Dashboard** | 1. Realizar um ciclo completo (cliente -> produto -> proposta -> contrato -> fatura -> pagamento). 2. Acessar o Dashboard. | Verificar se os cards de "Contratos Ativos", "Clientes Ativos", "Receita do Mês" e o gráfico de receita refletem as ações realizadas. | [ ] |

## 6. Relatório de Execução e Evidências

Ao final da execução, um relatório será gerado contendo:

- O status final de cada caso de teste.
- Screenshots para cada passo crítico, organizados por ID do caso de teste.
- Uma lista de bugs encontrados, classificados por severidade.
- A recomendação final de **Go** ou **No-Go** para a release.
