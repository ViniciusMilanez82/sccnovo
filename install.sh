#!/bin/bash
# ============================================================
# SCC-NG — Script de Instalação Automática
# VPS Hostinger com Docker
#
# USO:
#   bash <(curl -fsSL https://raw.githubusercontent.com/ViniciusMilanez82/sccnovo/main/install.sh)
#
# ============================================================

set -e  # Para o script se qualquer comando falhar

# --- Cores para output ---
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
BOLD='\033[1m'
NC='\033[0m' # No Color

# --- Funções de log ---
log_info()    { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[OK]${NC}   $1"; }
log_warn()    { echo -e "${YELLOW}[AVISO]${NC} $1"; }
log_error()   { echo -e "${RED}[ERRO]${NC}  $1"; exit 1; }
log_step()    { echo -e "\n${BOLD}${BLUE}===> $1${NC}"; }

# ============================================================
# BANNER
# ============================================================
echo -e "${BOLD}"
echo "  ███████╗ ██████╗ ██████╗    ███╗   ██╗ ██████╗ "
echo "  ██╔════╝██╔════╝██╔════╝    ████╗  ██║██╔════╝ "
echo "  ███████╗██║     ██║         ██╔██╗ ██║██║  ███╗"
echo "  ╚════██║██║     ██║         ██║╚██╗██║██║   ██║"
echo "  ███████║╚██████╗╚██████╗    ██║ ╚████║╚██████╔╝"
echo "  ╚══════╝ ╚═════╝ ╚═════╝    ╚═╝  ╚═══╝ ╚═════╝ "
echo -e "${NC}"
echo -e "  ${BOLD}Sistema de Controle de Contêineres — Next Generation${NC}"
echo -e "  ${YELLOW}Instalação automática para VPS Hostinger${NC}"
echo ""

# ============================================================
# PASSO 1: Verificar dependências
# ============================================================
log_step "Verificando dependências..."

if ! command -v docker &> /dev/null; then
    log_error "Docker não encontrado. Instale o Docker antes de continuar."
fi
log_success "Docker encontrado: $(docker --version)"

if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null 2>&1; then
    log_error "Docker Compose não encontrado. Instale o Docker Compose antes de continuar."
fi
log_success "Docker Compose encontrado."

if ! command -v git &> /dev/null; then
    log_info "Git não encontrado. Instalando..."
    apt-get update -qq && apt-get install -y -qq git
    log_success "Git instalado."
fi
log_success "Git encontrado: $(git --version)"

# ============================================================
# PASSO 2: Clonar o repositório
# ============================================================
log_step "Clonando o repositório SCC-NG..."

INSTALL_DIR="/opt/scc-ng"

if [ -d "$INSTALL_DIR" ]; then
    log_warn "Diretório $INSTALL_DIR já existe. Atualizando..."
    cd "$INSTALL_DIR"
    git pull origin main
else
    git clone https://github.com/ViniciusMilanez82/sccnovo.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi
log_success "Repositório clonado em $INSTALL_DIR"

# ============================================================
# PASSO 3: Gerar senhas seguras e criar .env
# ============================================================
log_step "Gerando configurações de segurança..."

if [ -f ".env" ]; then
    log_warn "Arquivo .env já existe. Mantendo configurações existentes."
else
    # Gerar senhas aleatórias e seguras
    DB_PASSWORD=$(openssl rand -hex 20)
    JWT_SECRET=$(openssl rand -hex 48)

    cat > .env << EOF
# ============================================================
# SCC-NG — Variáveis de Ambiente (geradas automaticamente)
# Gerado em: $(date)
# ============================================================
# --- Banco de Dados PostgreSQL ---
POSTGRES_USER=scc_user
POSTGRES_PASSWORD="${DB_PASSWORD}"
POSTGRES_DB=scc_ng_db
# --- Autenticação JWT ---
JWT_SECRET="${JWT_SECRET}"
JWT_EXPIRES_IN=8h
EOF

    log_success "Arquivo .env criado com senhas geradas automaticamente."
    log_warn "IMPORTANTE: Guarde as senhas abaixo em local seguro!"
    echo ""
    echo -e "  ${BOLD}Senha do Banco de Dados:${NC} ${YELLOW}${DB_PASSWORD}${NC}"
    echo -e "  ${BOLD}Chave JWT:${NC}              ${YELLOW}(gerada e salva no .env)${NC}"
    echo ""
fi

# ============================================================
# PASSO 4: Build e subida dos contêineres
# ============================================================
log_step "Construindo e iniciando os contêineres (pode levar alguns minutos)..."

# Usar 'docker compose' (v2) ou 'docker-compose' (v1)
if docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    COMPOSE_CMD="docker-compose"
fi

$COMPOSE_CMD up -d --build
log_success "Contêineres iniciados."

# ============================================================
# PASSO 5: Aguardar o banco de dados ficar pronto
# ============================================================
log_step "Aguardando o banco de dados ficar pronto..."

MAX_RETRIES=30
RETRY_COUNT=0
until $COMPOSE_CMD exec -T postgresql pg_isready -U scc_user -d scc_ng_db &> /dev/null; do
    RETRY_COUNT=$((RETRY_COUNT + 1))
    if [ $RETRY_COUNT -ge $MAX_RETRIES ]; then
        log_error "Banco de dados não ficou pronto após ${MAX_RETRIES} tentativas."
    fi
    echo -n "."
    sleep 2
done
echo ""
log_success "Banco de dados pronto."

# ============================================================
# PASSO 6: Criar tabelas e dados iniciais
# ============================================================
log_step "Criando tabelas e dados iniciais..."

# Usar db push (sem arquivos de migration — schema como fonte de verdade)
$COMPOSE_CMD exec -T backend npx prisma db push --accept-data-loss
log_success "Tabelas criadas/sincronizadas com o schema."

# Executar seed em JavaScript puro (sem ts-node)
$COMPOSE_CMD exec -T backend node prisma/seed.js
log_success "Dados iniciais criados."

# ============================================================
# PASSO 7: Verificar status final
# ============================================================
log_step "Verificando status dos serviços..."

echo ""
$COMPOSE_CMD ps
echo ""

# ============================================================
# CONCLUÍDO
# ============================================================
echo -e "${GREEN}${BOLD}"
echo "  ╔══════════════════════════════════════════════╗"
echo "  ║   ✅  SCC-NG INSTALADO COM SUCESSO!          ║"
echo "  ╚══════════════════════════════════════════════╝"
echo -e "${NC}"

# Detectar o IP da VPS
VPS_IP=$(curl -s ifconfig.me 2>/dev/null || hostname -I | awk '{print $1}')

echo -e "  ${BOLD}Acesse o sistema em:${NC}"
echo -e "  ${BLUE}http://${VPS_IP}${NC}"
echo ""
echo -e "  ${BOLD}Credenciais de acesso iniciais:${NC}"
echo -e "  ┌─────────────────────────────────────────────────┐"
echo -e "  │ Admin:   admin@multiteiner.com.br / Admin@2026!  │"
echo -e "  │ Gerente: geraldo@multiteiner.com.br / Gerente@2026! │"
echo -e "  │ Vendedor: vera@multiteiner.com.br / Vendedor@2026! │"
echo -e "  └─────────────────────────────────────────────────┘"
echo ""
echo -e "  ${YELLOW}${BOLD}Próximo passo recomendado: configurar SSL (HTTPS)${NC}"
echo -e "  Execute: ${BOLD}sudo certbot --nginx -d seu.dominio.com.br${NC}"
echo ""
