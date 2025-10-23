#!/bin/bash

# Script para deploy da Cloud Function de normalização automática

echo "🚀 Deploy da Cloud Function de Normalização Automática"
echo "=================================================="

# Configurar projeto
PROJECT_ID="automatizar-452311"
FUNCTION_NAME="normalize-survey-data"
REGION="southamerica-east1"

echo "📋 Configurações:"
echo "   Projeto: $PROJECT_ID"
echo "   Função: $FUNCTION_NAME"
echo "   Região: $REGION"
echo ""

# Verificar se gcloud está configurado
if ! gcloud config get-value project > /dev/null 2>&1; then
    echo "❌ gcloud não está configurado. Configurando..."
    gcloud config set project $PROJECT_ID
fi

# Verificar se estamos no projeto correto
CURRENT_PROJECT=$(gcloud config get-value project)
if [ "$CURRENT_PROJECT" != "$PROJECT_ID" ]; then
    echo "🔄 Alterando para projeto correto..."
    gcloud config set project $PROJECT_ID
fi

echo "✅ Projeto configurado: $(gcloud config get-value project)"
echo ""

# Fazer deploy da função
echo "🚀 Fazendo deploy da Cloud Function..."
gcloud functions deploy $FUNCTION_NAME \
    --runtime python311 \
    --trigger-http \
    --allow-unauthenticated \
    --region $REGION \
    --source . \
    --entry-point normalize_survey_data \
    --set-env-vars PROJECT_ID=$PROJECT_ID \
    --set-env-vars FS_COLLECTION=responses \
    --set-env-vars FS_PROGRESSIVE_COLLECTION=progressive_responses \
    --set-env-vars FS_ORGANIZED_COLLECTION=organized_responses \
    --memory 512MB \
    --timeout 540s

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Deploy concluído com sucesso!"
    echo ""
    echo "📊 Informações da função:"
    echo "   Nome: $FUNCTION_NAME"
    echo "   Região: $REGION"
    echo "   Projeto: $PROJECT_ID"
    echo ""
    echo "🌐 URL da função:"
    gcloud functions describe $FUNCTION_NAME --region $REGION --format="value(httpsTrigger.url)"
    echo ""
    echo "🧪 Para testar:"
    echo "   curl -X POST \$(gcloud functions describe $FUNCTION_NAME --region $REGION --format='value(httpsTrigger.url)')"
    echo ""
else
    echo "❌ Erro no deploy da função"
    exit 1
fi


