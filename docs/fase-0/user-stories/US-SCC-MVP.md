# US-SCC-MVP: User Stories - MVP

**Autor**: ms-analista-carlos (Manus AI)
**Data**: 02 de Março de 2026
**Versão**: 1.0
**Status**: Rascunho para Validação
**Referência PRD**: PRD-SCC-MVP v1.1

---

## Introdução

Este documento contém o backlog de User Stories (Histórias de Usuário) para o MVP do projeto SCC-NG. Cada história foi decomposta a partir dos Requisitos Funcionais (RFs) definidos no `PRD-SCC-MVP.md` e está detalhada para atender à **Definition of Ready (DoR)**, permitindo que o time de desenvolvimento possa implementá-la com clareza e sem ambiguidades.

---

## Módulo: Segurança (SEC)

### US-SEC-001: Autenticação de Usuário

*   **Descrição**: Como um **usuário do sistema**, eu quero **fazer login com meu email e senha**, para que eu possa **acessar as funcionalidades do SCC-NG que meu perfil permite**.
*   **Referência PRD**: RF-SEC-001

#### Regras de Negócio
- A senha deve ter no mínimo 8 caracteres, incluindo uma letra maiúscula, uma minúscula, um número e um caractere especial.
- O sistema deve bloquear o usuário por 15 minutos após 5 tentativas de login sem sucesso.
- A sessão do usuário deve expirar após 8 horas de inatividade.

#### Critérios de Aceite (Gherkin)
```gherkin
Cenário: Login com sucesso
  Dado que eu sou um usuário cadastrado com o email "vera@multiteiner.com.br" e senha "Senha@123"
  E eu estou na página de login
  Quando eu preencho o campo "Email" com "vera@multiteiner.com.br"
  E preencho o campo "Senha" com "Senha@123"
  E clico no botão "Entrar"
  Então eu devo ser redirecionado para o dashboard principal
  E devo ver a mensagem "Bem-vinda, Vera!"

Cenário: Login com senha incorreta
  Dado que eu sou um usuário cadastrado com o email "vera@multiteiner.com.br"
  E eu estou na página de login
  Quando eu preencho o campo "Email" com "vera@multiteiner.com.br"
  E preencho o campo "Senha" com "senha-errada"
  E clico no botão "Entrar"
  Então eu devo permanecer na página de login
  E devo ver a mensagem de erro "Email ou senha inválidos."

Cenário: Login com usuário não cadastrado
  Dado que eu estou na página de login
  Quando eu preencho o campo "Email" com "naoexisto@multiteiner.com.br"
  E preencho o campo "Senha" com "qualquer-senha"
  E clico no botão "Entrar"
  Então eu devo ver a mensagem de erro "Email ou senha inválidos."
```

#### Requisitos de UX/UI
- **Estado Padrão**: Campos "Email" e "Senha" e botão "Entrar".
- **Estado Carregando**: Após clicar em "Entrar", o botão deve ficar desabilitado e exibir um ícone de loading.
- **Estado de Erro**: Exibir a mensagem de erro claramente acima dos campos.

---

### US-SEC-002: Cadastro de Usuários

*   **Descrição**: Como um **Adalberto (Administrador)**, eu quero **cadastrar, editar e visualizar os usuários do sistema**, para **gerenciar quem pode acessar o SCC-NG**.
*   **Referência PRD**: RF-SEC-002

#### Regras de Negócio
- Um usuário deve estar associado a uma (e apenas uma) empresa cadastrada.
- Um usuário deve ter um (e apenas um) perfil de acesso (Admin, Vendedor, Financeiro, Gerente).
- O email do usuário é único em todo o sistema.
- Ao criar um novo usuário, o sistema deve gerar uma senha temporária e enviá-la para o email do usuário.

#### Critérios de Aceite (Gherkin)
```gherkin
Cenário: Adalberto cadastra um novo vendedor
  Dado que Adalberto está logado como Administrador
  E ele está na tela de "Gerenciamento de Usuários"
  Quando ele clica em "Novo Usuário"
  E preenche o nome com "Carlos Vendedor", o email com "carlos@multiteiner.com.br", seleciona a empresa "Multiteiner Rio" e o perfil "Vendedor"
  E clica em "Salvar"
  Então o usuário "Carlos Vendedor" deve aparecer na lista de usuários
  E o sistema deve enviar um email para "carlos@multiteiner.com.br" com uma senha temporária.
```

#### Dados e Validações
- **Nome**: Obrigatório, texto, máx 100 caracteres.
- **Email**: Obrigatório, formato de email válido.
- **Empresa**: Obrigatório, selecionado de uma lista de empresas cadastradas.
- **Perfil**: Obrigatório, selecionado de uma lista de perfis existentes.

---

## Módulo: Cadastros (CAD)

### US-CAD-001: Gerenciamento de Clientes

*   **Descrição**: Como um **Adalberto (Administrador)** ou **Vera (Vendedora)**, eu quero **cadastrar, consultar, editar e excluir clientes**, para **manter a base de dados de clientes atualizada**.
*   **Referência PRD**: RF-CAD-001

#### Regras de Negócio
- Um cliente pode ser Pessoa Física (PF) ou Pessoa Jurídica (PJ).
- Se for PJ, o CNPJ é obrigatório e deve ser único.
- Se for PF, o CPF é obrigatório e deve ser único.
- O sistema deve validar o formato do CNPJ e CPF (cálculo do dígito verificador).
- Um cliente deve ter pelo menos um endereço e um contato.

#### Critérios de Aceite (Gherkin)
```gherkin
Cenário: Vera cadastra um novo cliente PJ
  Dado que Vera está logada no sistema
  E ela acessa a tela de "Clientes"
  Quando ela clica em "Novo Cliente"
  E seleciona o tipo "Pessoa Jurídica"
  E preenche a Razão Social, o CNPJ válido, o endereço e as informações de contato
  E clica em "Salvar"
  Então o novo cliente deve ser salvo com sucesso
  E deve aparecer na lista de clientes.

Cenário: Vera tenta cadastrar um cliente com CNPJ duplicado
  Dado que já existe um cliente com o CNPJ "00.111.222/0001-33"
  E Vera está na tela de cadastro de cliente
  Quando ela tenta salvar um novo cliente com o CNPJ "00.111.222/0001-33"
  Então o sistema deve exibir a mensagem de erro "CNPJ já cadastrado no sistema."
  E o cliente não deve ser salvo.
```

#### Requisitos de UX/UI
- **Listagem**: A tela principal deve ser uma tabela paginada com os clientes, com campos de busca por nome, CPF/CNPJ.
- **Formulário**: O formulário de cadastro/edição deve ter abas para "Dados Principais", "Endereços" e "Contatos".

---

### US-CAD-002: Gerenciamento de Produtos

*   **Descrição**: Como um **Adalberto (Administrador)**, eu quero **cadastrar e gerenciar os produtos e serviços**, para que **a equipe comercial possa usá-los ao criar propostas**.
*   **Referência PRD**: RF-CAD-002, RF-CAD-006

#### Regras de Negócio
- Um produto deve ter um tipo: "Venda" ou "Locação".
- Um produto deve ter um preço de venda e/ou um preço de locação (mensal).
- Um serviço (ex: Transporte) é um tipo especial de produto.

#### Critérios de Aceite (Gherkin)
```gherkin
Cenário: Adalberto cadastra um novo contêiner para locação
  Dado que Adalberto está logado como Administrador
  E ele está na tela de "Produtos"
  Quando ele clica em "Novo Produto"
  E preenche a descrição como "Contêiner Almoxarifado 20 pés", seleciona o tipo "Locação" e define o preço mensal como "500.00"
  E clica em "Salvar"
  Então o produto "Contêiner Almoxarifado 20 pés" deve ser salvo com sucesso.
```

---

## Módulo: Comercial (COM)

### US-COM-001: Criação de Proposta Comercial

*   **Descrição**: Como uma **Vera (Vendedora)**, eu quero **criar uma nova proposta comercial**, para **formalizar uma oferta para um cliente**.
*   **Referência PRD**: RF-COM-001, RF-COM-002, RF-COM-003

#### Regras de Negócio
- Uma proposta deve estar associada a um cliente e a um vendedor.
- Ao selecionar o cliente, o sistema deve exibir um alerta visual proeminente se o cliente estiver na lista negra ou tiver títulos vencidos.
- É possível adicionar múltiplos itens (produtos ou serviços) à proposta, especificando quantidade, valor e período (se for locação).
- O sistema deve calcular o valor total da proposta automaticamente.

#### Critérios de Aceite (Gherkin)
```gherkin
Cenário: Vera cria uma proposta para um cliente sem pendências
  Dado que Vera está logada
  E o cliente "Construtora Feliz" não tem pendências financeiras
  Quando Vera cria uma nova proposta para o cliente "Construtora Feliz"
  E adiciona o item "Contêiner Almoxarifado 20 pés" com quantidade 2 e período de 3 meses
  E clica em "Salvar Proposta"
  Então a proposta deve ser salva com o status "Em Elaboração"
  E o valor total deve ser calculado corretamente (2 * 500.00 * 3).

Cenário: Vera cria uma proposta para um cliente inadimplente
  Dado que Vera está logada
  E o cliente "Construtora Devedora" possui títulos vencidos
  Quando Vera cria uma nova proposta para o cliente "Construtora Devedora"
  Então ela deve ver um alerta visual na tela, como "Atenção: Cliente com pendências financeiras!"
```

---

### US-COM-002: Fluxo de Aprovação de Proposta

*   **Descrição**: Como um **Geraldo (Gerente Comercial)**, eu quero **revisar e aprovar propostas que exigem análise crítica**, para **garantir que as condições comerciais são vantajosas para a empresa**.
*   **Referência PRD**: RF-COM-004

#### Regras de Negócio
- Uma proposta entra em "Análise Crítica" se o desconto for maior que 10% ou se o cliente tiver pendências financeiras.
- Apenas usuários com perfil "Gerente" podem aprovar ou reprovar uma proposta em análise.
- Ao aprovar, o status da proposta muda para "Aprovada".
- Ao reprovar, o status muda para "Reprovada" e o gerente deve adicionar um motivo.

#### Critérios de Aceite (Gherkin)
```gherkin
Cenário: Geraldo aprova uma proposta com desconto
  Dado que Vera criou uma proposta com 15% de desconto, que está com o status "Aguardando Aprovação"
  E Geraldo está logado como Gerente
  Quando ele abre a proposta para análise
  E clica no botão "Aprovar"
  Então o status da proposta deve mudar para "Aprovada"
  E Vera deve receber uma notificação no sistema.
```

---

## Módulo: Locação (LOC) e Faturamento (FAT)

### US-LOC-001: Geração de Contrato de Locação

*   **Descrição**: Como uma **Vera (Vendedora)**, eu quero **gerar um contrato de locação a partir de uma proposta aprovada**, para **formalizar o início da operação**.
*   **Referência PRD**: RF-LOC-001, RF-COM-005

#### Regras de Negócio
- A geração de locação só é possível a partir de uma proposta com status "Aprovada".
- Ao gerar a locação, o sistema deve criar um registro na tabela `C_LOCACOES` com os dados da proposta.
- O sistema deve gerar um documento de "Aceite" em PDF para assinatura.

#### Critérios de Aceite (Gherkin)
```gherkin
Cenário: Geração de locação a partir de proposta aprovada
  Dado que a proposta P-2026-001 está com o status "Aprovada"
  Quando Vera abre a proposta P-2026-001
  E clica no botão "Gerar Locação"
  Então um novo registro de locação L-2026-001 deve ser criado
  E o sistema deve gerar um arquivo "Aceite-P-2026-001.pdf" para download.
```

---

### US-FAT-001: Faturamento em Lote

*   **Descrição**: Como uma **Fátima (Financeiro)**, eu quero **executar o processo de faturamento mensal**, para **gerar todos os títulos a receber das locações ativas de uma só vez**.
*   **Referência PRD**: RF-FAT-001, RF-FAT-002

#### Regras de Negócio
- O processo deve ser executado a partir de uma tela específica, com um botão "Gerar Faturamento do Mês".
- O sistema deve encontrar todas as locações ativas cuja data de faturamento seja no mês corrente.
- Para cada locação, deve ser criado um registro na tabela `C_TITULOS`.
- O valor do título deve corresponder ao valor mensal da locação (considerar cálculo *pro rata*).

#### Critérios de Aceite (Gherkin)
```gherkin
Cenário: Fátima gera o faturamento do mês de Março
  Dado que existem 150 locações ativas com faturamento previsto para Março/2026
  E Fátima está logada como Financeiro
  Quando ela acessa a tela "Faturamento em Lote"
  E clica em "Gerar Faturamento de Março/2026"
  Então o sistema deve processar as 150 locações
  E criar 150 novos títulos na tabela C_TITULOS
  E ao final, exibir a mensagem "Faturamento concluído. 150 títulos gerados com sucesso."
```

---

## Módulo: Financeiro (FIN)

### US-FIN-001: Geração de Remessa CNAB

*   **Descrição**: Como uma **Fátima (Financeiro)**, eu quero **gerar o arquivo de remessa CNAB 400**, para **enviar ao banco as instruções de cobrança dos boletos gerados**.
*   **Referência PRD**: RF-FIN-001

#### Regras de Negócio
- A tela deve permitir que Fátima filtre os títulos que deseja incluir na remessa (por data de vencimento, por empresa).
- O sistema deve gerar um arquivo de texto (`.rem`) no layout CNAB 400, contendo os dados dos títulos selecionados e o header/trailer do banco.
- Após a geração, os títulos devem ser marcados como "Enviado ao Banco".

#### Critérios de Aceite (Gherkin)
```gherkin
Cenário: Fátima gera a remessa do dia
  Dado que existem 50 títulos com status "Aguardando Envio"
  E Fátima está na tela de "Geração de Remessa"
  Quando ela seleciona os 50 títulos
  E clica em "Gerar Arquivo de Remessa"
  Então o sistema deve gerar um arquivo .rem para download
  E o status dos 50 títulos deve ser atualizado para "Enviado ao Banco".
```

---

### US-FIN-002: Baixa Manual de Título

*   **Descrição**: Como uma **Fátima (Financeiro)**, eu quero **dar baixa manual em um título**, para **registrar no sistema um pagamento que foi identificado por outros meios**.
*   **Referência PRD**: RF-FIN-003

#### Regras de Negócio
- Na tela de consulta de títulos, deve haver uma opção para "Baixar Título".
- A tela de baixa deve solicitar a data do pagamento e o valor pago.
- Se o valor pago for menor que o valor do título, o sistema deve registrar a diferença como saldo devedor.
- Após a baixa, o status do título deve mudar para "Liquidado".

#### Critérios de Aceite (Gherkin)
```gherkin
Cenário: Fátima dá baixa em um título pago integralmente
  Dado que o título T-123 no valor de R$ 500,00 está com status "Enviado ao Banco"
  E Fátima está na tela de detalhes do título T-123
  Quando ela clica em "Baixar Título"
  E informa a data de pagamento e o valor pago de R$ 500,00
  E clica em "Confirmar Baixa"
  Então o status do título T-123 deve ser atualizado para "Liquidado".
```

---

## Matriz de Rastreabilidade (PRD -> US)

| ID do Requisito (PRD) | ID da User Story | Descrição da US |
| :--- | :--- | :--- |
| RF-SEC-001 | US-SEC-001 | Autenticação de Usuário |
| RF-SEC-002 | US-SEC-002 | Cadastro de Usuários |
| RF-CAD-001 | US-CAD-001 | Gerenciamento de Clientes |
| RF-CAD-002, RF-CAD-006 | US-CAD-002 | Gerenciamento de Produtos |
| RF-COM-001, RF-COM-002, RF-COM-003 | US-COM-001 | Criação de Proposta Comercial |
| RF-COM-004 | US-COM-002 | Fluxo de Aprovação de Proposta |
| RF-LOC-001, RF-COM-005 | US-LOC-001 | Geração de Contrato de Locação |
| RF-FAT-001, RF-FAT-002 | US-FAT-001 | Faturamento em Lote |
| RF-FIN-001 | US-FIN-001 | Geração de Remessa CNAB |
| RF-FIN-003 | US-FIN-002 | Baixa Manual de Título |

---

## Próximos Passos

1.  **Validação com Stakeholders**: Apresentar estas User Stories para o sponsor (Vinicius) e para os usuários-chave (Vera, Fátima, Geraldo) para garantir que o comportamento descrito está correto.
2.  **UX/UI Design (`ms-ux-luiz`)**: Com as stories validadas, o agente de UX pode começar a desenhar os wireframes e protótipos para cada tela.
3.  **Sprint Planning (`ms-pm-rafael`)**: Com as stories e o design, o PM pode montar o plano para a primeira sprint de desenvolvimento.
