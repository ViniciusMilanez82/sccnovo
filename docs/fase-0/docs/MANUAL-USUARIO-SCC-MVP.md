# Manual do Usuário — SCC-NG MVP

---

**Produto**: Sistema de Controle de Contêineres (SCC-NG)
**Versão**: `v1.0.0-MVP`
**Público-Alvo**: Usuários finais (Vendedores, Gerentes, Financeiro, Administradores)

---

## 1. Introdução

Bem-vindo ao SCC-NG! Este manual é o seu guia completo para utilizar todas as funcionalidades da versão MVP do novo Sistema de Controle de Contêineres da Multiteiner. Aqui você aprenderá a navegar pelo sistema, gerenciar clientes, criar propostas, administrar contratos e muito mais.

## 2. Primeiros Passos: Acessando o Sistema

Para acessar o sistema, utilize o endereço fornecido pela equipe de TI e a sua senha inicial.

1.  **Acesse a tela de login**.
2.  **Digite seu e-mail e senha**.
3.  **Clique em "Entrar"**.

Ao fazer o primeiro login, é altamente recomendável que você altere sua senha na seção "Meu Perfil".

## 3. O Dashboard: Sua Visão Geral

Ao entrar no sistema, a primeira tela que você verá é o **Dashboard**. Ele foi projetado para fornecer uma visão rápida e em tempo real dos indicadores mais importantes do negócio.

- **Cards de KPIs**: No topo, você encontra os números principais: Contratos Ativos, Clientes Ativos, Receita do Mês e Faturas Vencidas.
- **Gráfico de Receita**: Um gráfico de barras mostra a evolução da receita nos últimos 6 meses.
- **Contratos por Status**: Um resumo visual de quantos contratos estão em cada estágio (Ativo, Encerrado, etc.).
- **Faturas Recentes**: Uma lista das últimas faturas emitidas para acesso rápido.

## 4. Módulo de Clientes

Neste módulo, você pode gerenciar toda a base de clientes da Multiteiner.

- **Para criar um novo cliente**: Clique em "Novo Cliente", preencha os dados (o endereço é preenchido automaticamente ao digitar um CEP válido) e salve.
- **Para encontrar um cliente**: Utilize a barra de busca para filtrar por nome, CPF/CNPJ ou cidade.
- **Para editar um cliente**: Clique no ícone de lápis na linha do cliente desejado, faça as alterações e salve.

## 5. Módulo Comercial (Produtos e Propostas)

Este módulo é o coração das suas vendas.

### 5.1. Produtos

- **Local**: Menu "Produtos".
- **Função**: Gerenciar o catálogo de contêineres e serviços disponíveis para locação.
- **Como usar**: Cadastre novos produtos com código, nome e preço mensal. Você pode ativar ou desativar um produto a qualquer momento.

### 5.2. Propostas

- **Local**: Menu "Propostas".
- **Função**: Criar, gerenciar e aprovar propostas comerciais para os clientes.
- **Fluxo de Trabalho**:
    1.  **Criar**: Clique em "Nova Proposta", selecione o cliente, adicione os produtos do catálogo, defina as quantidades e aplique descontos se necessário.
    2.  **Enviar para Aprovação**: Salve a proposta. Seu status mudará para "Aguardando Aprovação".
    3.  **Aprovar/Reprovar**: Um usuário com perfil de **Gerente** deve acessar a proposta e clicar em "Aprovar" ou "Reprovar".

## 6. Módulo de Locação (Contratos)

- **Local**: Menu "Contratos".
- **Função**: Administrar todos os contratos de locação ativos, suspensos ou encerrados.
- **Como criar um contrato**:
A forma padrão é converter uma proposta aprovada. Vá até a tela de Propostas, encontre uma proposta com status "Aprovada" e clique na opção **"Gerar Contrato"**. O sistema criará o contrato automaticamente com todos os dados.
- **Encerrar um contrato**: Na lista de contratos, clique na opção de encerrar o contrato desejado.

## 7. Módulo de Faturamento

- **Local**: Menu "Faturamento".
- **Função**: Gerar e controlar as faturas mensais dos contratos de locação.
- **Como gerar uma fatura**:
    1.  Clique em "Gerar Fatura".
    2.  Insira o ID do contrato ativo para o qual deseja faturar.
    3.  Defina a data de emissão e vencimento.
    4.  Clique em "Gerar". A fatura será criada com o valor exato do contrato e status "PENDENTE".
- **Ações**: Você pode marcar uma fatura como "Enviada" ou "Cancelada" diretamente na lista.

## 8. Módulo Financeiro (Recebíveis)

- **Local**: Menu "Financeiro".
- **Função**: Controlar os pagamentos das faturas (contas a receber).
- **Visão Geral**: A tela principal mostra cards com o resumo dos valores a receber, vencidos e já pagos.
- **Como baixar um pagamento**:
    1.  Na lista de recebíveis, encontre a fatura que foi paga pelo cliente.
    2.  Clique no botão **"Baixar"**.
    3.  No modal, confirme o valor pago, a data e a forma de pagamento (PIX, Boleto, etc.).
    4.  Clique em "Confirmar Pagamento". A fatura será marcada como "PAGA" e sairá da lista de pendências.

## 9. Suporte

Em caso de dúvidas ou problemas, entre em contato com o suporte de TI da Multiteiner.
