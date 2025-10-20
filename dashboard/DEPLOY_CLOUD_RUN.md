# ☁️ Deploy Dashboard V4 - Google Cloud Run

## 📋 Visão Geral

Guia completo para fazer deploy do Dashboard Next.js 15 no Google Cloud Run.

**Por que Cloud Run?**
- ✅ Escalabilidade automática
- ✅ Pay-per-use (sem custo quando inativo)
- ✅ Mesma infraestrutura das APIs
- ✅ SSL/HTTPS automático
- ✅ Integração com GCP

---

## 🎯 Pré-requisitos

### 1. Google Cloud SDK instalado

```bash
# Instalar gcloud (se ainda não tem)
# macOS
brew install --cask google-cloud-sdk

# Verificar
gcloud --version
```

### 2. Autenticação

```bash
gcloud auth login
gcloud config set project [SEU_PROJECT_ID]
```

### 3. Habilitar APIs necessárias

```bash
gcloud services enable \
  run.googleapis.com \
  cloudbuild.googleapis.com \
  artifactregistry.googleapis.com
```

---

## 📦 Preparação do Projeto

### Passo 1: Criar Dockerfile

Crie o arquivo `dashboard/Dockerfile`:

```dockerfile
# Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source files
COPY . .

# Build application
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV PORT=8080

# Copy necessary files from builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "server.js"]
```

### Passo 2: Configurar next.config.ts para standalone

Atualize `dashboard/next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  
  // Configurações existentes
  reactStrictMode: true,
  
  experimental: {
    optimizePackageImports: ['lucide-react', 'recharts'],
  },
};

export default nextConfig;
```

### Passo 3: Criar .dockerignore

Crie `dashboard/.dockerignore`:

```
# Dependencies
node_modules
npm-debug.log
yarn-error.log

# Testing
coverage
.nyc_output
test-results

# Next.js
.next
out

# Misc
.DS_Store
*.pem
.env*.local

# Git
.git
.gitignore

# IDE
.vscode
.idea
*.swp
*.swo
```

---

## 🚀 Deploy para Cloud Run

### Opção 1: Deploy Direto (Recomendado)

```bash
cd dashboard

gcloud run deploy sebrae-dashboard-v4 \
  --source . \
  --region southamerica-east1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1 \
  --max-instances 10 \
  --min-instances 0 \
  --port 8080 \
  --timeout 300 \
  --set-env-vars NODE_ENV=production
```

**Explicação dos parâmetros:**
- `--source .`: Build automático do Dockerfile
- `--region southamerica-east1`: Mesma região das APIs (São Paulo)
- `--allow-unauthenticated`: Acesso público
- `--memory 512Mi`: Memória suficiente para Next.js
- `--cpu 1`: 1 vCPU
- `--max-instances 10`: Máximo de instâncias simultâneas
- `--min-instances 0`: Escala para zero (economia)
- `--port 8080`: Porta do container
- `--timeout 300`: Timeout de 5 minutos

### Opção 2: Build Manual + Deploy

```bash
cd dashboard

# 1. Build da imagem
gcloud builds submit \
  --tag gcr.io/[PROJECT_ID]/sebrae-dashboard-v4

# 2. Deploy da imagem
gcloud run deploy sebrae-dashboard-v4 \
  --image gcr.io/[PROJECT_ID]/sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --platform managed \
  --allow-unauthenticated \
  --memory 512Mi \
  --cpu 1
```

---

## 🌐 Configuração de Domínio Personalizado

### 1. Mapear domínio

```bash
gcloud run domain-mappings create \
  --service sebrae-dashboard-v4 \
  --domain dashboard.seudominio.com.br \
  --region southamerica-east1
```

### 2. Configurar DNS

Adicione os registros DNS conforme instruído pelo comando acima.

---

## 🔧 Variáveis de Ambiente (Opcional)

Se precisar adicionar variáveis de ambiente:

```bash
gcloud run services update sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --set-env-vars "API_URL=https://sua-api.run.app"
```

Ou durante o deploy:

```bash
gcloud run deploy sebrae-dashboard-v4 \
  --source . \
  --region southamerica-east1 \
  --set-env-vars "API_URL=https://sua-api.run.app,NODE_ENV=production"
```

---

## 📊 Monitoramento

### Ver logs em tempo real

```bash
gcloud run services logs tail sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --follow
```

### Ver logs recentes

```bash
gcloud run services logs read sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --limit 100
```

### Métricas no console

```bash
# Abrir console do Cloud Run
gcloud run services describe sebrae-dashboard-v4 \
  --region southamerica-east1
```

---

## 🔄 Atualização do Dashboard

### Opção 1: Redeploy automático

Após fazer alterações:

```bash
cd dashboard
gcloud run deploy sebrae-dashboard-v4 \
  --source . \
  --region southamerica-east1
```

### Opção 2: CI/CD com GitHub Actions

Crie `.github/workflows/deploy-cloud-run.yml`:

```yaml
name: Deploy to Cloud Run

on:
  push:
    branches:
      - main
    paths:
      - 'dashboard/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - id: auth
        uses: google-github-actions/auth@v1
        with:
          credentials_json: ${{ secrets.GCP_SA_KEY }}
      
      - name: Deploy to Cloud Run
        uses: google-github-actions/deploy-cloudrun@v1
        with:
          service: sebrae-dashboard-v4
          region: southamerica-east1
          source: ./dashboard
```

---

## 🐛 Troubleshooting

### Build falhou

```bash
# Build local para testar
cd dashboard
docker build -t sebrae-dashboard-v4 .
docker run -p 8080:8080 sebrae-dashboard-v4
```

Acesse: http://localhost:8080

### Out of Memory

Aumente a memória:

```bash
gcloud run services update sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --memory 1Gi
```

### Timeout

Aumente o timeout:

```bash
gcloud run services update sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --timeout 600
```

### Container não inicia

Verifique logs:

```bash
gcloud run services logs read sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --limit 50
```

---

## 💰 Estimativa de Custos

### Cloud Run Pricing (São Paulo)

**Com tráfego baixo (~1000 visitas/mês):**
- CPU: ~$0.50/mês
- Memória: ~$0.30/mês
- Requests: ~$0.20/mês
- **Total: ~$1.00/mês** ✅

**Com tráfego médio (~10000 visitas/mês):**
- CPU: ~$3.00/mês
- Memória: ~$2.00/mês
- Requests: ~$1.00/mês
- **Total: ~$6.00/mês** ✅

**Nota:** Cloud Run tem free tier generoso:
- 2 milhões de requests/mês grátis
- 360,000 vCPU-segundos/mês grátis
- 180,000 GiB-segundos/mês grátis

---

## 🔒 Segurança

### 1. Restringir acesso (opcional)

Se quiser apenas IPs específicos:

```bash
gcloud run services update sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --ingress internal-and-cloud-load-balancing
```

### 2. Adicionar autenticação

Para adicionar Google Auth:

```bash
gcloud run services update sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --no-allow-unauthenticated
```

### 3. CORS e Headers

Configure no código Next.js (`next.config.ts`):

```typescript
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ]
}
```

---

## 📈 Performance

### Otimizações recomendadas

1. **Habilitar CDN:**
```bash
gcloud compute backend-services update [BACKEND_SERVICE] \
  --enable-cdn
```

2. **Configurar min-instances para tráfego alto:**
```bash
gcloud run services update sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --min-instances 1
```

3. **Cache no Next.js:**
```typescript
// next.config.ts
const nextConfig: NextConfig = {
  // ... outras configs
  
  headers: async () => [
    {
      source: '/_next/static/:path*',
      headers: [
        {
          key: 'Cache-Control',
          value: 'public, max-age=31536000, immutable',
        },
      ],
    },
  ],
}
```

---

## 🌐 URLs Finais

Após deploy, você terá:

**Cloud Run URL:**
```
https://sebrae-dashboard-v4-[hash]-rj.a.run.app
```

**Com domínio customizado:**
```
https://dashboard.seudominio.com.br
```

**Rotas disponíveis:**
- `/` - Dashboard V1
- `/dashboard-v2` - Dashboard V2
- `/dashboard-v3` - Dashboard V3
- `/dashboard-v4` - Dashboard V4 (novo!)

---

## ✅ Checklist de Deploy

Antes de considerar completo:

- [ ] Dockerfile criado
- [ ] next.config.ts configurado (standalone)
- [ ] .dockerignore criado
- [ ] Build local testado
- [ ] Deploy no Cloud Run executado
- [ ] URL acessível e funcionando
- [ ] Filtros de data testados
- [ ] Loading indicator funcionando
- [ ] Gráficos renderizando
- [ ] Responsivo em mobile
- [ ] Logs sem erros
- [ ] Performance satisfatória (< 3s)

---

## 🔄 Rollback

Se algo der errado:

```bash
# Listar revisões
gcloud run revisions list \
  --service sebrae-dashboard-v4 \
  --region southamerica-east1

# Voltar para revisão anterior
gcloud run services update-traffic sebrae-dashboard-v4 \
  --region southamerica-east1 \
  --to-revisions [REVISION_NAME]=100
```

---

## 📊 Comparação: Vercel vs Cloud Run

| Feature | Vercel | Cloud Run |
|---------|--------|-----------|
| **Setup** | Mais fácil | Requer Dockerfile |
| **Custo** | Free tier generoso | Pay-per-use |
| **Performance** | Edge network | Regional |
| **Escalabilidade** | Automática | Automática |
| **Integração GCP** | Limitada | Total |
| **CI/CD** | Automático | Manual/GitHub Actions |
| **Domínio customizado** | Fácil | Requer DNS |
| **Logs** | Dashboard | Cloud Logging |

**Recomendação:**
- **Vercel**: Melhor para protótipos e projetos simples
- **Cloud Run**: Melhor para integração com GCP e controle total

---

## 🎯 Comandos Úteis

```bash
# Ver informações do serviço
gcloud run services describe sebrae-dashboard-v4 \
  --region southamerica-east1

# Listar serviços
gcloud run services list --region southamerica-east1

# Deletar serviço
gcloud run services delete sebrae-dashboard-v4 \
  --region southamerica-east1

# Ver métricas de CPU/Memória
gcloud monitoring dashboards create --config-from-file=dashboard.yaml

# Atualizar tráfego entre revisões (canary)
gcloud run services update-traffic sebrae-dashboard-v4 \
  --to-revisions [NEW]=20,[OLD]=80 \
  --region southamerica-east1
```

---

## 🎉 Deploy Completo!

Após seguir este guia, você terá:

- ✅ Dashboard V4 rodando no Cloud Run
- ✅ Mesma infraestrutura das APIs
- ✅ Escalabilidade automática
- ✅ Custos otimizados
- ✅ Monitoramento integrado

---

**Desenvolvido por South Media para Sebrae/PR** 🚀



