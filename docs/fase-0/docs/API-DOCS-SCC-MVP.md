# Documentação da API — SCC-NG MVP

---

**Versão**: `v1.0.0-MVP`
**Público-Alvo**: Desenvolvedores

---

## 1. Visão Geral

Esta documentação descreve a API RESTful do sistema SCC-NG. A API é o coração do backend, responsável por todas as regras de negócio e persistência de dados. Todas as respostas são em formato JSON.

**URL Base**: `https://<seu-dominio-aws>.com/api`

## 2. Autenticação

A API utiliza **JSON Web Tokens (JWT)** para autenticação. Todas as requisições, exceto `/auth/login`, devem incluir o token no header `Authorization`.

`Authorization: Bearer <seu-jwt-token>`

### POST /auth/login

Autentica um usuário e retorna um token JWT.

- **Body**:
    - `email` (string, required)
    - `password` (string, required)

- **Resposta de Sucesso (200)**:

```json
{
  "status": "success",
  "token": "ey...",
  "user": {
    "id": "...",
    "name": "Administrador",
    "email": "admin@multiteiner.com.br",
    "role": "ADMIN"
  }
}
```

## 3. Endpoints

A seguir, a lista de endpoints disponíveis no MVP.

### Clientes (`/clients`)

- `GET /`: Lista clientes com paginação e filtros.
- `POST /`: Cria um novo cliente.
- `GET /{id}`: Obtém os detalhes de um cliente.
- `PUT /{id}`: Atualiza um cliente.
- `DELETE /{id}`: Inativa um cliente.

### Produtos (`/products`)

- `GET /`: Lista produtos.
- `POST /`: Cria um novo produto.
- `GET /{id}`: Obtém um produto.
- `PUT /{id}`: Atualiza um produto.

### Propostas (`/proposals`)

- `GET /`: Lista propostas.
- `POST /`: Cria uma nova proposta.
- `GET /{id}`: Obtém uma proposta.
- `PATCH /{id}/approve`: Aprova uma proposta (requer perfil GERENTE ou ADMIN).
- `PATCH /{id}/reject`: Reprova uma proposta.

### Contratos (`/contracts`)

- `GET /`: Lista contratos.
- `POST /from-proposal/{proposalId}`: Cria um contrato a partir de uma proposta aprovada.
- `GET /{id}`: Obtém um contrato.
- `PATCH /{id}/close`: Encerra um contrato.

### Faturamento (`/invoices`)

- `GET /`: Lista faturas.
- `POST /`: Gera uma nova fatura a partir de um contrato.
- `GET /{id}`: Obtém uma fatura.
- `PATCH /{id}/send`: Marca uma fatura como enviada.
- `PATCH /{id}/cancel`: Cancela uma fatura.

### Financeiro (`/receivables`)

- `GET /`: Lista recebíveis (faturas pendentes, vencidas, etc.).
- `GET /summary`: Retorna um resumo financeiro (total a receber, vencido, pago).
- `POST /payment`: Registra um novo pagamento para uma fatura.

### Dashboard (`/dashboard`)

- `GET /kpis`: Retorna os principais KPIs para o dashboard.
- `GET /revenue-chart`: Retorna os dados para o gráfico de receita mensal.

## 4. Estrutura de Erros

Erros na API (status 4xx ou 5xx) seguem uma estrutura padrão:

```json
{
  "status": "error",
  "message": "Descrição do erro.",
  "details": [] // Opcional, para erros de validação
}
```

**Exemplo de Erro de Validação (400 Bad Request)**:

```json
{
    "status": "error",
    "message": "O ID da fatura é obrigatório.",
    "details": [
        {
            "type": "field",
            "value": "",
            "msg": "O ID da fatura é obrigatório.",
            "path": "invoiceId",
            "location": "body"
        }
    ]
}
```
