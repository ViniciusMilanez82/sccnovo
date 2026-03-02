# Guia de Deploy — SCC-NG na VPS Hostinger com Docker

Este guia detalha o processo completo para implantar o sistema SCC-NG em uma VPS da Hostinger que já possui o Gerenciador Docker.

**Tempo estimado:** 15-20 minutos

---

## Pré-requisitos

1.  **Acesso SSH à VPS:** Você precisa conseguir se conectar à sua VPS via terminal (SSH).
2.  **Domínio Configurado:** Um domínio (ex: `scc.suaempresa.com.br`) já deve estar apontando para o IP da sua VPS.
3.  **Docker e Docker Compose:** O Gerenciador Docker da Hostinger já garante que ambos estão instalados.

---

## Passo 1: Conectar na VPS e Instalar Git

Conecte-se à sua VPS e instale o `git` para podermos clonar o repositório.

```bash
# Conecte via SSH (substitua com seu usuário e IP)
ssh seu_usuario@ip_da_vps

# Instale o Git
sudo apt-get update && sudo apt-get install -y git
```

---

## Passo 2: Clonar o Repositório do SCC-NG

Clone a versão mais recente do projeto diretamente do GitHub para a sua VPS.

```bash
# Clone o repositório para uma pasta chamada 'scc-ng'
git clone https://github.com/ViniciusMilanez82/sccnovo.git scc-ng

# Entre na pasta do projeto
cd scc-ng
```

---

## Passo 3: Configurar as Variáveis de Ambiente

O sistema precisa de algumas senhas e chaves secretas. Vamos criá-las agora.

1.  **Copie o arquivo de exemplo:**

    ```bash
    cp .env.example .env
    ```

2.  **Gere uma chave secreta para o JWT:**

    ```bash
    # Este comando gera uma chave segura e a exibe no terminal
    openssl rand -base64 64
    ```

3.  **Edite o arquivo `.env`:**

    Abra o arquivo com um editor de texto (como `nano`) e preencha as variáveis.

    ```bash
    nano .env
    ```

    O arquivo deve ficar assim:

    ```dotenv
    # --- Banco de Dados PostgreSQL ---
    POSTGRES_USER=scc_user
    POSTGRES_PASSWORD=COLOQUE_UMA_SENHA_FORTE_AQUI
    POSTGRES_DB=scc_ng_db

    # --- Autenticação JWT ---
    # Cole a chave gerada no passo anterior aqui
    JWT_SECRET=COLE_A_CHAVE_SECRETA_GERADA_AQUI
    JWT_EXPIRES_IN=8h
    ```

    **Salve e feche o arquivo** (em `nano`, use `Ctrl+X`, depois `Y` e `Enter`).

---

## Passo 4: Subir os Contêineres com Docker Compose

Este é o passo principal. O Docker Compose vai ler o arquivo `docker-compose.yml`, construir as imagens do backend e frontend, e iniciar todos os serviços na ordem correta.

```bash
# Suba os contêineres em modo "detached" (background)
docker-compose up -d --build
```

O processo pode levar alguns minutos na primeira vez, pois ele precisa baixar as imagens base e construir as aplicações.

---

## Passo 5: Executar a Migração do Banco de Dados

Com os contêineres rodando, precisamos criar as tabelas no banco de dados e popular com os dados iniciais (usuário admin).

```bash
# Execute o comando de migração dentro do contêiner do backend
docker-compose exec backend npm run db:migrate

# Execute o seed para criar os usuários iniciais
docker-compose exec backend npm run db:seed
```

---

## Passo 6: Configurar o SSL (HTTPS) com Certbot

Para ter o cadeado de segurança no seu site, vamos usar o Let's Encrypt.

1.  **Instale o Certbot:**

    ```bash
    sudo apt-get install -y certbot python3-certbot-nginx
    ```

2.  **Gere o certificado SSL:**

    Substitua `scc.suaempresa.com.br` pelo seu domínio real.

    ```bash
    sudo certbot --nginx -d scc.suaempresa.com.br
    ```

    O Certbot fará algumas perguntas. Responda-as para completar o processo. Ele irá detectar a configuração do Nginx (que está rodando no contêiner do frontend) e configurar o SSL automaticamente.

---

## Concluído!

Se tudo correu bem, seu sistema SCC-NG está no ar e acessível em `https://scc.suaempresa.com.br`.

**Credenciais de acesso iniciais:**

| Usuário | E-mail | Senha | Perfil |
|---|---|---|---|
| Administrador | `admin@multiteiner.com.br` | `Admin@2026!` | ADMIN |
| Geraldo | `geraldo@multiteiner.com.br` | `Gerente@2026!` | GERENTE |
| Vera | `vera@multiteiner.com.br` | `Vendedor@2026!` | VENDEDOR |

### Comandos Úteis

-   **Ver logs em tempo real:** `docker-compose logs -f`
-   **Parar todos os serviços:** `docker-compose down`
-   **Reiniciar os serviços:** `docker-compose restart`
-   **Atualizar a aplicação (após um `git pull`):** `docker-compose up -d --build`
