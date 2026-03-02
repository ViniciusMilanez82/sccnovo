# ============================================================
# Stage 1: Build
# ============================================================
FROM node:20-alpine AS builder

RUN apk add --no-cache openssl

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./
COPY prisma ./prisma/

# Instalar todas as dependências (incluindo devDependencies para build)
RUN npm ci

# Gerar o cliente Prisma
RUN npx prisma generate

# Copiar o restante do código-fonte
COPY . .

# Compilar TypeScript
RUN npm run build

# ============================================================
# Stage 2: Production
# ============================================================
FROM node:20-alpine AS production

# Instalar openssl (necessário para o Prisma no Alpine)
RUN apk add --no-cache openssl wget

WORKDIR /app

# Instalar apenas dependências de produção
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --only=production && npx prisma generate

# Copiar os arquivos compilados do stage de build
COPY --from=builder /app/dist ./dist

# Variáveis de ambiente padrão (serão sobrescritas pelo docker-compose)
ENV NODE_ENV=production
ENV PORT=3000

# Expor a porta da API
EXPOSE 3000

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=5 \
  CMD wget -qO- http://localhost:3000/api/health || exit 1

# Iniciar o servidor
CMD ["node", "dist/server.js"]
