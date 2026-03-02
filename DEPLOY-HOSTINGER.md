_# Guia de Deploy — SCC-NG na VPS Hostinger com Docker

Este guia detalha o processo **automatizado** para implantar o sistema SCC-NG em uma VPS da Hostinger. O processo todo é feito com um único comando.

**Tempo estimado:** 5-10 minutos

---

## Pré-requisitos

1.  **Acesso SSH à VPS:** Você precisa conseguir se conectar à sua VPS como usuário `root` ou um usuário com permissões `sudo`.
2.  **Docker e Docker Compose:** O ambiente da VPS já deve ter o Docker e o Docker Compose instalados e funcionando. O plano "VPS Hostinger com Docker" já inclui isso.

---

## Passo 1: Executar o Script de Instalação Automática

Conecte-se à sua VPS via SSH e execute o comando abaixo. Ele vai baixar e executar o script de instalação, que cuida de todo o processo.

```bash
bash <(curl -fsSL https://raw.githubusercontent.com/ViniciusMilanez82/sccnovo/main/install.sh)
```

### O que o script faz?

O script foi projetado para automatizar todas as etapas de configuração:

1.  **Verifica Dependências:** Confere se `git`, `docker` e `docker-compose` estão instalados.
2.  **Clona o Repositório:** Baixa a versão mais recente do SCC-NG para o diretório `/opt/scc-ng`.
3.  **Cria o `.env`:** Gera automaticamente o arquivo `.env` com senhas seguras para o banco de dados e para a chave JWT.
4.  **Build e Deploy:** Executa `docker-compose up -d --build` para construir as imagens do backend e frontend e iniciar todos os contêineres.
5.  **Prepara o Banco de Dados:** Aguarda o PostgreSQL ficar pronto, cria todas as tabelas com `prisma db push`, e popula o banco com os usuários iniciais (`admin`, `gerente`, `vendedor`) executando o script de `seed`.
6.  **Exibe o Status:** Mostra o status final dos contêineres e as informações de acesso.

---

## Passo 2: Acessar o Sistema

Após a conclusão do script, o sistema estará no ar.

*   **URL de Acesso:** `http://<IP_DA_SUA_VPS>:8081`
*   **Frontend:** Acessível na porta `8081`. A porta `80` pode estar em uso por outros sistemas na VPS.
*   **Backend:** Rodando internamente na porta `3000`.

**Credenciais de acesso iniciais:**

| Perfil   | E-mail                     | Senha         |
| :------- | :------------------------- | :------------ |
| Admin    | `admin@multiteiner.com.br` | `Admin@2026!` |
| Gerente  | `geraldo@multiteiner.com.br`| `Gerente@2026!`|
| Vendedor | `vera@multiteiner.com.br`  | `Vendedor@2026!`|

---

## Próximos Passos (Opcional, mas recomendado)

### Configurar SSL/HTTPS com Certbot

Para ter o cadeado de segurança no seu site, você precisará de um domínio apontando para o IP da VPS e de um proxy reverso (como Nginx ou Traefik) para gerenciar os certificados SSL, uma vez que a porta 80 já está em uso.

Esta configuração é avançada e depende do ambiente da sua VPS. A recomendação é usar um Nginx Proxy Manager em um contêiner separado para gerenciar todos os seus domínios e certificados de forma centralizada.

---

## Comandos Úteis de Gerenciamento

Todos os comandos devem ser executados dentro do diretório `/opt/scc-ng`.

*   **Ver logs em tempo real:**
    ```bash
    docker-compose logs -f
    ```

*   **Parar todos os serviços:**
    ```bash
    docker-compose down
    ```

*   **Reiniciar os serviços:**
    ```bash
    docker-compose restart
    ```

*   **Atualizar a aplicação (após mudanças no código):**
    ```bash
    git pull origin main
    docker-compose up -d --build
    ```

*   **Acessar o terminal do backend:**
    ```bash
    docker-compose exec backend sh
    ```

*   **Acessar o banco de dados PostgreSQL:**
    ```bash
    docker-compose exec postgresql psql -U scc_user -d scc_ng_db
    ```
_
