# PRD-SCC-MVP: Product Requirements Document - MVP

**Autor**: ms-po-juliana (Manus AI)
**Data**: 02 de Março de 2026
**Versão**: 1.0
**Status**: ✅ Aprovado — Decisões Técnicas Confirmadas
**Versão**: 1.1

---

## 1. Contexto e Problema

O **Sistema de Controle de Contêineres (SCC)** é a espinha dorsal operacional da Multiteiner, gerenciando todo o ciclo de vida dos contêineres, desde a proposta comercial até o faturamento e a logística. Atualmente, o sistema opera em uma plataforma legada (Visual FoxPro com banco de dados SQL Server), que, apesar de funcional, apresenta riscos significativos e crescentes para o negócio:

*   **Risco Tecnológico**: A tecnologia Visual FoxPro foi descontinuada pela Microsoft há mais de uma década, o que implica em ausência de suporte, de atualizações de segurança e de profissionais qualificados no mercado.
*   **Débito Técnico Elevado**: A falta do código-fonte original (`.prg`, `.sct`) torna a manutenção corretiva e evolutiva extremamente complexa, cara e arriscada. Qualquer alteração é um processo de alto risco.
*   **Falta de Escalabilidade e Flexibilidade**: A arquitetura atual, monolítica e desktop-based, dificulta a integração com sistemas modernos (ERPs, CRMs, APIs de parceiros) e impede a evolução para plataformas web e mobile, que são essenciais para a competitividade futura.
*   **Experiência do Usuário (UX) Datada**: A interface do sistema, baseada em formulários VFP, é pouco intuitiva para novos usuários, aumentando o tempo de treinamento e a probabilidade de erros operacionais.

O problema a ser resolvido é a **mitigação radical desses riscos através da substituição completa do sistema legado**. A reconstrução para uma plataforma web moderna não é apenas uma atualização tecnológica, mas uma necessidade estratégica para garantir a **continuidade, segurança e evolução do negócio** da Multiteiner.

## 2. Objetivo (Mensurável) e Não-Objetivos

### 2.1. Objetivo Principal

O objetivo do **SCC-NG (Next Generation)** é **replicar 100% das funcionalidades críticas do sistema SCC legado, definidas no escopo do MVP, em uma nova plataforma web, garantindo zero perda de dados e zero regressão funcional crítica no processo de migração.**

### 2.2. Métricas de Sucesso para o Objetivo

| Métrica | Alvo | Como Medir |
| :--- | :--- | :--- |
| **Paridade Funcional** | 100% | Todos os casos de teste mapeados do fluxo do MVP devem ser executados com sucesso no novo sistema. |
| **Adoção do Usuário** | 95% das operações | Após 1 mês do go-live, 95% das operações de locação e faturamento devem ser realizadas exclusivamente no SCC-NG. |
| **Performance da Aplicação** | Tempo de carregamento < 2s | O tempo médio de carregamento das telas principais (Listagem de Propostas, Detalhe da Locação) deve ser inferior a 2 segundos. |
| **Taxa de Erros em Produção** | < 0.1% | A taxa de erros não tratados (HTTP 5xx) deve ser inferior a 0.1% do total de requisições. |
| **Integridade dos Dados** | 100% | Scripts de validação pós-migração (contagem de registros, checksums) devem apontar 100% de correspondência para as tabelas do MVP. |

### 2.3. Não-Objetivos (Fora do Escopo do MVP)

Para garantir o foco e a entrega de valor no prazo estimado, os seguintes itens estão **explicitamente fora do escopo do MVP** e serão tratados em fases futuras:

*   **NÃO** serão desenvolvidas novas funcionalidades que não existam no sistema legado.
*   **NÃO** será implementado o controle completo de Vistorias, Avarias e Reparos (Fase 2).
*   **NÃO** será implementada a baixa automática de boletos via arquivo de retorno CNAB (Fase 2).
*   **NÃO** serão migrados os 48 relatórios gerenciais complexos (Fase 3).
*   **NÃO** será feita a integração com o ERP TOTVS (Fase 3).
*   **NÃO** será implementado o sistema de permissões granulares por tela (Fase 4).
*   **NÃO** será desenvolvido um portal do cliente (Fase 5).

## 3. Usuários e Cenários (Personas)

| Persona | Papel | Principais Necessidades no SCC |
| :--- | :--- | :--- |
| **Vera (Vendedora)** | Comercial | Criar, editar e acompanhar propostas comerciais. Consultar preços de produtos e disponibilidade de contêineres. Saber se um cliente está na lista negra ou inadimplente. |
| **Geraldo (Gerente Comercial)** | Gestão | Aprovar ou reprovar propostas com condições especiais. Analisar o funil de vendas e o desempenho da equipe. |
| **Fátima (Financeiro)** | Financeiro | Gerar faturamento em lote para as locações. Emitir boletos e o arquivo de remessa para o banco. Realizar a baixa manual de pagamentos. |
| **Adalberto (Administrador do Sistema)** | TI / Admin | Cadastrar novos usuários e definir seus perfis de acesso básicos. Cadastrar empresas, produtos e outros dados mestres do sistema. |

### Cenário Principal: O Ciclo de Vida de uma Locação

1.  **Vera (Vendedora)** recebe uma ligação de um cliente interessado em alugar um contêiner.
2.  Ela acessa o SCC-NG, consulta o cadastro do cliente (ou o cria, se for novo) e verifica que ele não tem pendências financeiras.
3.  Ela cria uma nova **Proposta Comercial**, adicionando os produtos (contêineres), serviços (transporte, montagem) e definindo os preços e o período da locação.
4.  Como ela deu um desconto especial, a proposta fica com o status "Aguardando Aprovação".
5.  **Geraldo (Gerente)** recebe uma notificação, acessa a proposta, analisa as condições e a **aprova**.
6.  O sistema gera automaticamente o documento de **Aceite** da proposta.
7.  Com o aceite, o sistema cria um novo contrato de **Locação**.
8.  No final do mês, **Fátima (Financeiro)** executa o processo de **Faturamento**. O sistema identifica a locação de Vera, gera o **Título** a receber e o inclui no arquivo de **Remessa CNAB** para o banco.
9.  Quando o cliente paga, Fátima realiza a **Baixa Manual** do título no sistema.

## 4. Requisitos Funcionais (RF) - MVP

### Módulo: Segurança (SEC)

*   **RF-SEC-001**: O sistema deve permitir a autenticação de usuários através de login (email) e senha. A senha deve ser armazenada de forma criptografada (hash).
*   **RF-SEC-002**: O sistema deve ter uma tela para cadastro de usuários (`C_USUARIOS`), associando cada usuário a uma empresa e a um perfil de acesso (ex: "Vendedor", "Financeiro", "Admin").
*   **RF-SEC-003**: O sistema deve permitir que o próprio usuário troque sua senha.
*   **RF-SEC-004**: O acesso às funcionalidades do sistema deve ser restrito com base no perfil do usuário (lógica simplificada para o MVP).

### Módulo: Cadastros (CAD)

*   **RF-CAD-001**: O sistema deve possuir uma tela de CRUD (Create, Read, Update, Delete) completa para **Clientes** (`C_CLIENTES`), incluindo dados de contato, endereço, e associação a uma empresa.
*   **RF-CAD-002**: O sistema deve possuir uma tela de CRUD para **Produtos** (`C_PRODUTOS`), definindo se é um produto de venda ou locação, e seu preço padrão.
*   **RF-CAD-003**: O sistema deve possuir uma tela de CRUD para **Materiais** (`C_MATERIAIS`), que são os itens que compõem um produto.
*   **RF-CAD-004**: O sistema deve possuir uma tela de CRUD para **Vendedores** (`C_VENDEDORES`).
*   **RF-CAD-005**: O sistema deve possuir uma tela de CRUD para **Transportadoras** (`C_TRANSPORTADORAS`).
*   **RF-CAD-006**: O sistema deve possuir uma tela de CRUD para **Serviços** (`C_SERVICOS`), como transporte e montagem.
*   **RF-CAD-007**: O sistema deve possuir uma tela de CRUD para **Empresas** (`C_EMPRESAS`), permitindo o caráter multi-empresa do sistema.
*   **RF-CAD-008**: O sistema deve possuir uma tela de CRUD para **Municípios** (`C_MUNICIPIOS`), para ser usado nos endereços.

### Módulo: Comercial (COM)

*   **RF-COM-001**: O sistema deve permitir a criação de uma **Proposta Comercial** (`C_PROPOSTAS`), associada a um cliente, vendedor e empresa.
*   **RF-COM-002**: Deve ser possível adicionar múltiplos **itens** (`C_PROPOSTASITENS`) a uma proposta, especificando produto, quantidade, valor unitário e período (para locações).
*   **RF-COM-003**: O sistema deve, ao salvar uma proposta, verificar se o cliente está na **Lista Negra** (`C_LISTANEGRA`) ou possui títulos em atraso, exibindo um alerta visual para o vendedor.
*   **RF-COM-004**: Propostas com descontos ou condições especiais devem entrar em um fluxo de **Análise Crítica**, exigindo aprovação de um usuário com perfil de "Gerente".
*   **RF-COM-005**: O sistema deve permitir a geração de um documento de **Aceite** (`C_ACEITES`) a partir de uma proposta aprovada.

### Módulo: Locação (LOC)

*   **RF-LOC-001**: A partir de um Aceite, o sistema deve criar um registro de **Locação** (`C_LOCACOES`), vinculando o cliente, os produtos e as condições comerciais definidas.
*   **RF-LOC-002**: O sistema deve armazenar o índice **IGPM** (`C_IGPM`) mensalmente para futuro cálculo de reajuste (o cálculo em si está fora do MVP).

### Módulo: Faturamento (FAT)

*   **RF-FAT-001**: O sistema deve ter um processo (executado em lote, ex: tela com botão "Gerar Faturamento do Mês") que varre todas as locações ativas e gera os respectivos **Títulos** a receber (`C_TITULOS`).
*   **RF-FAT-002**: O cálculo do faturamento deve considerar o valor da locação e o período (cálculo *pro rata* para o primeiro mês, se aplicável).
*   **RF-FAT-003**: Cada Título deve conter os **itens** (`C_TITULOSITENS`) que o compõem, espelhando os itens da locação.

### Módulo: Financeiro (FIN)

*   **RF-FIN-001**: O sistema deve permitir a geração do **arquivo de remessa CNAB 400** a partir de uma seleção de títulos gerados. A implementação deve ser parametrizável para suportar o padrão 240 no futuro.
*   **RF-FIN-002**: O sistema deve gerenciar a numeração sequencial de boletos (`C_NUMEROBOLETO`) para garantir que não haja duplicidade.
*   **RF-FIN-003**: O sistema deve possuir uma tela para a **baixa manual** de um título, onde o usuário informa a data do pagamento e o valor pago.
*   **RF-FIN-004**: O sistema deve possuir um CRUD para **Contas Correntes** (`C_CONTACORRENTES`), onde serão configurados os dados bancários da empresa para a geração dos boletos.

## 5. Requisitos Não-Funcionais (RNF)

*   **RNF-01 (Performance)**: Todas as listagens (ex: Clientes, Propostas) devem carregar em menos de 3 segundos com até 100.000 registros. As operações de CRUD devem responder em menos de 500ms.
*   **RNF-02 (Segurança)**: O sistema deve ser protegido contra os riscos do OWASP Top 10, incluindo SQL Injection, XSS e CSRF. Todas as senhas devem ser armazenadas com hash e salt. O tráfego deve ser exclusivamente via HTTPS.
*   **RNF-03 (Disponibilidade)**: A aplicação deve ter uma disponibilidade de 99.5% em horário comercial (8h-18h, Seg-Sex).
*   **RNF-04 (Acessibilidade)**: O sistema deve seguir as diretrizes básicas do WCAG 2.1 nível AA, garantindo navegação por teclado, contraste de cores adequado e texto alternativo para imagens.
*   **RNF-05 (Compatibilidade)**: A aplicação web deve ser totalmente funcional nas duas últimas versões dos navegadores Google Chrome, Mozilla Firefox e Microsoft Edge.
*   **RNF-06 (Escalabilidade)**: A arquitetura deve suportar um crescimento de 50% no número de usuários e transações no período de um ano sem degradação da performance.

## 6. Métricas de Sucesso e Instrumentação

Para medir o sucesso do produto, além das métricas de objetivo, vamos acompanhar:

| Métrica de Produto | Como Medir | Ferramenta Sugerida |
| :--- | :--- | :--- |
| **Tempo para Criar Proposta** | Medir o tempo médio (em segundos) entre o clique em "Nova Proposta" e o clique em "Salvar". | Eventos de Analytics (Google Analytics, PostHog) |
| **Taxa de Conversão (Proposta -> Locação)** | (Nº de Locações criadas / Nº de Propostas criadas) no período. | Funil de conversão no Analytics. |
| **Taxa de Adoção de Features** | Percentual de usuários ativos que utilizaram cada uma das telas de CRUD do MVP no último mês. | Relatórios de uso da ferramenta de Analytics. |
| **NPS (Net Promoter Score)** | Pesquisa de satisfação com os usuários-chave 1 mês após o go-live. | Ferramenta de pesquisa (Typeform, Google Forms). |

## 7. Escopo e Prioridades (MVP vs Fase 2)

Esta seção reitera a fronteira do escopo para evitar ambiguidades.

| Status | Módulos / Funcionalidades |
| :--- | :--- |
| **DENTRO do MVP** | CRUDs de Cadastros Core, Proposta Comercial, Aprovação, Aceite, Geração de Locação, Faturamento em Lote, Geração de Remessa CNAB, Baixa Manual. |
| **FORA do MVP** | Vistorias, Avarias, Reparos, Controle de Estoque, Baixa Automática (Retorno CNAB), Cálculo de Comissões, Inadimplência, Relatórios Gerenciais, Integração TOTVS, Permissões Granulares. |

## 8. Riscos e Dependências

| ID | Risco | Plano de Mitigação |
| :--- | :--- | :--- |
| **RISK-01** | **Lógica de Negócio Oculta**: Regras não documentadas podem ser perdidas. | Realizar sessões de demonstração guiada com usuários-chave do sistema legado para cada módulo, documentando o comportamento observado. A análise do banco de dados legado será usada para inferir regras.
| **RISK-02** | **Inconsistência na Migração de Dados**: Perda ou corrupção de dados. | `ms-data-lucas` criará scripts de migração e validação. Múltiplos ciclos de teste de migração serão executados em ambiente isolado antes do go-live.
| **RISK-03** | **Baixa Adoção pelo Usuário**: Resistência à mudança. | `ms-ux-luiz` conduzirá sessões de validação de protótipo com usuários-chave. `ms-techwriter-leticia` preparará material de treinamento.

| ID | Dependência | Plano de Ação |
| :--- | :--- | :--- |
| **D-01** | **Disponibilidade de Stakeholders** | Agendar sessões de validação e esclarecimento com antecedência, com no mínimo 4 horas por semana reservadas na agenda dos stakeholders da Multiteiner. |
| **D-02** | **Acesso ao Banco de Dados Legado** | Obter um backup completo (`.bak`) do banco de dados SQL Server para análise offline pelo `ms-data-lucas`. |

## 9. Decisões Técnicas Registradas

| Questão | Decisão | Responsável pelo ADR |
| :--- | :--- | :--- |
| **Q-01 (Stack)** | ✅ **Node.js + React + PostgreSQL** | `ms-cto-eduardo` → ADR-SCC-001 |
| **Q-02 (Infra)** | ✅ **AWS (Amazon Web Services)** | `ms-devops-fernanda` → ADR-SCC-002 |
| **Q-03 (CNAB)** | ⚠️ **CNAB 400** (provável). Banco a confirmar. Implementação parametrizável. | `ms-dev-andre` |
| **Q-04 (SSO)** | ✅ **Sem SSO**. Autenticação própria (email + senha). | `ms-cto-eduardo` → ADR-SCC-001 |

## 10. Perguntas em Aberto

*   **Q-05 (CNAB)**: Qual o nome do banco parceiro para geração de boletos? (Ex: Bradesco, Itaú, Caixa). Necessário para configurar o header do arquivo de remessa CNAB 400.


