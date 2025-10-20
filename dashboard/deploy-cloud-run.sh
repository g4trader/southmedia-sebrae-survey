#!/bin/bash

# Script de Deploy para Google Cloud Run
# Dashboard V4 - Sebrae Survey

set -e

echo "╔══════════════════════════════════════════════════════════════════════╗"
echo "║                                                                      ║"
echo "║        🚀 DEPLOY DASHBOARD V4 - GOOGLE CLOUD RUN 🚀                 ║"
echo "║                                                                      ║"
echo "╚══════════════════════════════════════════════════════════════════════╝"
echo ""

# Cores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Configurações
SERVICE_NAME="sebrae-dashboard-v4"
REGION="southamerica-east1"
MEMORY="512Mi"
CPU="1"
MAX_INSTANCES="10"
MIN_INSTANCES="0"
PORT="8080"

echo -e "${BLUE}📋 Verificando pré-requisitos...${NC}"

# Verificar se gcloud está instalado
if ! command -v gcloud &> /dev/null; then
    echo -e "${RED}❌ gcloud CLI não encontrado${NC}"
    echo "Instale: https://cloud.google.com/sdk/docs/install"
    exit 1
fi

echo -e "${GREEN}✅ gcloud CLI encontrado${NC}"

# Verificar autenticação
if ! gcloud auth list --filter=status:ACTIVE --format="value(account)" &> /dev/null; then
    echo -e "${YELLOW}⚠️  Você não está autenticado${NC}"
    echo "Execute: gcloud auth login"
    exit 1
fi

ACTIVE_ACCOUNT=$(gcloud auth list --filter=status:ACTIVE --format="value(account)")
echo -e "${GREEN}✅ Autenticado como: ${ACTIVE_ACCOUNT}${NC}"

# Obter projeto atual
PROJECT_ID=$(gcloud config get-value project 2>/dev/null)
if [ -z "$PROJECT_ID" ]; then
    echo -e "${YELLOW}⚠️  Nenhum projeto configurado${NC}"
    echo "Configure: gcloud config set project [PROJECT_ID]"
    exit 1
fi

echo -e "${GREEN}✅ Projeto: ${PROJECT_ID}${NC}"
echo ""

# Confirmar deploy
echo -e "${YELLOW}📦 Configuração do Deploy:${NC}"
echo "   • Serviço: $SERVICE_NAME"
echo "   • Região: $REGION"
echo "   • Memória: $MEMORY"
echo "   • CPU: $CPU"
echo "   • Porta: $PORT"
echo "   • Max Instâncias: $MAX_INSTANCES"
echo "   • Min Instâncias: $MIN_INSTANCES"
echo ""

read -p "Deseja continuar com o deploy? (s/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[SsYy]$ ]]; then
    echo "Deploy cancelado."
    exit 0
fi

echo ""
echo -e "${BLUE}🔨 Iniciando deploy...${NC}"
echo ""

# Executar deploy
gcloud run deploy $SERVICE_NAME \
  --source . \
  --region $REGION \
  --platform managed \
  --allow-unauthenticated \
  --memory $MEMORY \
  --cpu $CPU \
  --max-instances $MAX_INSTANCES \
  --min-instances $MIN_INSTANCES \
  --port $PORT \
  --timeout 300 \
  --set-env-vars NODE_ENV=production

DEPLOY_STATUS=$?

echo ""
if [ $DEPLOY_STATUS -eq 0 ]; then
    echo -e "${GREEN}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${GREEN}║                                                                      ║${NC}"
    echo -e "${GREEN}║                    ✅ DEPLOY REALIZADO COM SUCESSO!                  ║${NC}"
    echo -e "${GREEN}║                                                                      ║${NC}"
    echo -e "${GREEN}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    
    # Obter URL do serviço
    SERVICE_URL=$(gcloud run services describe $SERVICE_NAME --region $REGION --format="value(status.url)")
    
    echo -e "${BLUE}🌐 URL do Dashboard:${NC}"
    echo "   $SERVICE_URL"
    echo ""
    echo -e "${BLUE}📍 Rotas disponíveis:${NC}"
    echo "   • $SERVICE_URL/ (Dashboard V1)"
    echo "   • $SERVICE_URL/dashboard-v2"
    echo "   • $SERVICE_URL/dashboard-v3"
    echo "   • $SERVICE_URL/dashboard-v4 ⭐ NOVO"
    echo ""
    
    echo -e "${BLUE}📊 Comandos úteis:${NC}"
    echo "   • Ver logs: gcloud run services logs tail $SERVICE_NAME --region $REGION"
    echo "   • Ver detalhes: gcloud run services describe $SERVICE_NAME --region $REGION"
    echo "   • Abrir no navegador: open $SERVICE_URL/dashboard-v4"
    echo ""
else
    echo -e "${RED}╔══════════════════════════════════════════════════════════════════════╗${NC}"
    echo -e "${RED}║                                                                      ║${NC}"
    echo -e "${RED}║                      ❌ DEPLOY FALHOU                                ║${NC}"
    echo -e "${RED}║                                                                      ║${NC}"
    echo -e "${RED}╚══════════════════════════════════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${YELLOW}💡 Dicas para resolver:${NC}"
    echo "   1. Verifique os logs de build: gcloud builds list"
    echo "   2. Teste build local: docker build -t test ."
    echo "   3. Verifique permissões do projeto"
    echo "   4. Consulte: dashboard/DEPLOY_CLOUD_RUN.md"
    exit 1
fi



