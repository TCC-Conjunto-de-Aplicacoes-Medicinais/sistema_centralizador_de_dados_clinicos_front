# ============================================================
# ESTÁGIO 1: Instalação de dependências e Build
# ============================================================
FROM node:20-alpine AS builder

WORKDIR /app

# Instala libc6-compat para compatibilidade de bibliotecas nativas se necessário
RUN apk add --no-cache libc6-compat

# Copia arquivos de dependência primeiro
COPY package.json package-lock.json ./

# Instala todas as dependências
RUN npm ci

# Copia todo o código fonte
COPY . .

# Executa o build da aplicação Next.js
RUN npm run build

# ============================================================
# ESTÁGIO 2: Execução em Produção
# ============================================================
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Cria usuário não-root por segurança
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Copia apenas os artefatos compilados e dependências necessárias
COPY --from=builder /app/package.json ./
COPY --from=builder /app/package-lock.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# Ajusta permissões
RUN chown -R nextjs:nodejs /app

USER nextjs

# Define a porta do frontend (8003)
EXPOSE 8003
ENV PORT=8003

# Inicializa o Next.js no modo start na porta 8003
CMD ["npx", "next", "start", "-p", "8003"]
