# UX-SCC-MVP: Especificação de Experiência do Usuário - MVP

**Autor**: ms-ux-luiz (Manus AI)
**Data**: 02 de Março de 2026
**Versão**: 1.0
**Status**: Rascunho para Validação
**Referência US**: US-SCC-MVP v1.0

---

## 1. Introdução

Este documento detalha a especificação da experiência do usuário (UX) e da interface do usuário (UI) para o MVP do projeto SCC-NG. O objetivo é criar uma interface **clara, consistente, acessível e eficiente**, que atenda às necessidades das personas (Vera, Geraldo, Fátima, Adalberto) e que seja significativamente mais intuitiva que o sistema legado.

A especificação se baseia nos fluxos definidos nas User Stories e segue o **Baseline de Design System MULTISOFT**.

---

## 2. Baseline de Design System MULTISOFT

Como não há um design system pré-existente, este projeto estabelecerá um baseline que servirá de fundação para o SCC-NG e futuros projetos na Multiteiner.

| Elemento | Especificação |
| :--- | :--- |
| **Cores Primárias** | Azul MULTISOFT (`#00529B`), Branco (`#FFFFFF`), Cinza Escuro (`#333333`) |
| **Cores de Feedback** | Sucesso (`#2E7D32`), Erro (`#C62828`), Alerta (`#FF8F00`), Info (`#0277BD`) |
| **Tipografia** | Fonte: Inter (sans-serif). Títulos: Peso 600. Corpo: Peso 400. |
| **Botões** | Primário (fundo Azul, texto Branco), Secundário (borda Azul, texto Azul), Destrutivo (fundo Erro, texto Branco). Todos com cantos arredondados (4px). |
| **Inputs** | Borda cinza claro, com foco em Azul. Labels posicionados acima do campo. |
| **Layout Principal** | Navegação lateral à esquerda (menu), cabeçalho superior com nome do usuário e notificações, área de conteúdo principal à direita. |

---

## 3. Fluxo 1: Login e Acesso ao Sistema

**User Story**: US-SEC-001

### 3.1. Objetivo do Fluxo
Permitir que um usuário autenticado acesse o sistema de forma segura.

### 3.2. Fluxo Principal (Passo a Passo)

1.  **Usuário**: Acessa a URL do SCC-NG.
2.  **Sistema**: Exibe a **Tela de Login**.
3.  **Usuário**: Preenche "Email" e "Senha".
4.  **Usuário**: Clica no botão "Entrar".
5.  **Sistema**: Valida as credenciais. Se válidas, redireciona para a **Tela Principal (Dashboard)**.

### 3.3. Tela de Login: Componentes e Estados

| Componente | Microcopy (Label/Placeholder) |
| :--- | :--- |
| Campo de Texto | Email |
| Campo de Senha | Senha |
| Botão Primário | Entrar |
| Link | Esqueceu sua senha? |

| Estado | Descrição Visual |
| :--- | :--- |
| **Carregando** | Botão "Entrar" desabilitado com um spinner. |
| **Erro** | Mensagem "Email ou senha inválidos." exibida em vermelho acima dos campos. Borda dos campos fica vermelha. |

---

## 4. Fluxo 2: Gerenciamento de Clientes (CRUD)

**User Story**: US-CAD-001

### 4.1. Objetivo do Fluxo
Permitir que usuários autorizados (Vera, Adalberto) mantenham a base de clientes atualizada.

### 4.2. Fluxo Principal (Passo a Passo)

1.  **Usuário**: Clica no item de menu "Cadastros" > "Clientes".
2.  **Sistema**: Exibe a **Tela de Listagem de Clientes**.
3.  **Usuário**: Clica no botão "Novo Cliente".
4.  **Sistema**: Exibe um **Modal/Página de Cadastro de Cliente**.
5.  **Usuário**: Preenche os dados do cliente.
6.  **Usuário**: Clica em "Salvar".
7.  **Sistema**: Valida os dados. Se válidos, salva o cliente, fecha o modal e exibe uma mensagem de sucesso ("Cliente salvo com sucesso!"). A lista de clientes é atualizada.

### 4.3. Tela de Listagem de Clientes: Componentes e Estados

| Componente | Microcopy |
| :--- | :--- |
| Título da Página | Clientes |
| Botão Primário | Novo Cliente |
| Campo de Busca | Buscar por nome, CPF/CNPJ... |
| Tabela de Clientes | Colunas: Nome/Razão Social, CPF/CNPJ, Cidade, Status, Ações (Editar, Excluir). |

| Estado | Descrição Visual |
| :--- | :--- |
| **Vazio** | A tabela é substituída por uma ilustração e o texto: "Nenhum cliente encontrado. Que tal cadastrar o primeiro?". O botão "Novo Cliente" fica em destaque. |
| **Carregando** | A área da tabela exibe um "skeleton screen" (linhas e células cinzas animadas). |

### 4.4. Modal de Cadastro de Cliente: Componentes e Microcopy

- **Título do Modal**: "Novo Cliente" ou "Editar Cliente".
- **Abas**: "Dados Principais", "Endereços", "Contatos".
- **Campos (Dados Principais)**: Tipo (PF/PJ), Nome/Razão Social, CPF/CNPJ, Inscrição Estadual, etc.
- **Microcopy de Erro**: "CNPJ já cadastrado." (exibido abaixo do campo CNPJ).
- **Botões**: "Salvar" (Primário), "Cancelar" (Secundário).

---

## 5. Fluxo 3: Criação e Aprovação de Proposta Comercial

**User Stories**: US-COM-001, US-COM-002

### 5.1. Objetivo do Fluxo
Permitir que Vera (Vendedora) crie uma proposta e que Geraldo (Gerente) a aprove, se necessário.

### 5.2. Fluxo Principal (Passo a Passo)

1.  **Vera**: Clica em "Comercial" > "Propostas" > "Nova Proposta".
2.  **Sistema**: Exibe a **Tela de Criação de Proposta**.
3.  **Vera**: Seleciona o cliente. _O sistema exibe um alerta se o cliente tiver pendências._
4.  **Vera**: Adiciona itens (produtos/serviços) à proposta.
5.  **Vera**: Clica em "Salvar e Enviar para Análise".
6.  **Sistema**: Salva a proposta com status "Aguardando Aprovação". Notifica Geraldo.
7.  **Geraldo**: Acessa a proposta a partir de sua lista de "Propostas para Aprovar".
8.  **Sistema**: Exibe a **Tela de Detalhe da Proposta** com os botões "Aprovar" e "Reprovar".
9.  **Geraldo**: Clica em "Aprovar".
10. **Sistema**: Altera o status da proposta para "Aprovada". Notifica Vera.

### 5.3. Tela de Criação/Edição de Proposta: Componentes e Estados

| Componente | Microcopy |
| :--- | :--- |
| Alerta (Condicional) | **Atenção: Cliente com pendências financeiras!** (Exibido em amarelo no topo da tela). |
| Seletor de Cliente | Selecione o cliente |
| Tabela de Itens | Colunas: Produto, Qtd, Valor Un., Período, Valor Total. Botão "Adicionar Item". |
| Resumo Financeiro | Subtotal, Desconto (%), Total. |
| Botões de Ação | "Salvar Rascunho", "Salvar e Enviar para Análise". |

| Estado | Descrição Visual |
| :--- | :--- |
| **Sem Itens** | A tabela de itens exibe um empty state: "Nenhum item adicionado. Comece adicionando um produto ou serviço." |

---

## 6. Checklist de Validação de UX (para QA)

Este checklist deve ser usado pelo agente `ms-qa-patricia` ao validar as telas em ambiente de staging.

### Checklist Geral (Aplicável a todas as telas)

- [ ] **Consistência**: Os botões de "Salvar" e "Cancelar" estão sempre na mesma posição?
- [ ] **Feedback**: O sistema exibe um spinner/loading durante operações que demoram mais de 300ms?
- [ ] **Microcopy**: As mensagens de erro são claras e não técnicas? (Ex: "Erro 500" não é aceitável).
- [ ] **Acessibilidade**: Consigo navegar por todos os campos e botões usando apenas a tecla "Tab"? O foco do teclado é visível?
- [ ] **Responsividade**: A tela é perfeitamente usável em um celular (largura de 360px)? Nenhum elemento está quebrado ou sobreposto?
- [ ] **Estados**: O estado de "Vazio" (tabelas sem dados) é tratado com uma mensagem amigável?

### Checklist Específico (Por Fluxo)

- [ ] **Login**: A mensagem de erro para credenciais inválidas é exatamente "Email ou senha inválidos."?
- [ ] **Cadastro de Cliente**: O sistema valida o formato do CNPJ e impede o cadastro de duplicados?
- [ ] **Criação de Proposta**: O alerta de cliente inadimplente é exibido de forma clara e visível?

---

## 7. Próximos Passos

1.  **Validação com Stakeholders**: Apresentar estes fluxos e o baseline de design para o sponsor (Vinicius) para garantir alinhamento visual e funcional.
2.  **Handoff para Desenvolvimento**: Com a aprovação, esta especificação, junto com as User Stories, será a base para o `ms-pm-rafael` criar o plano de sprints e para os desenvolvedores (`ms-dev-renata`, `ms-dev-andre`) iniciarem a implementação.
