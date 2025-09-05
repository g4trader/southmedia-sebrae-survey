# 🚀 Deploy do Dashboard no Vercel

## 📋 Pré-requisitos

1. **Conta no Vercel**: [vercel.com](https://vercel.com)
2. **Repositório no GitHub**: Código commitado e pushado
3. **Node.js**: Versão 18+ (o Vercel usa automaticamente)

## 🔧 Passos para Deploy

### 1. Preparar o Repositório

```bash
# No diretório do dashboard
cd dashboard

# Verificar se tudo está commitado
git status

# Se necessário, adicionar e commitar
git add .
git commit -m "feat: dashboard completo para Sebrae Survey"
git push origin main
```

### 2. Conectar ao Vercel

1. **Acesse**: [vercel.com/dashboard](https://vercel.com/dashboard)
2. **Clique**: "New Project"
3. **Import**: Selecione o repositório `southmedia-sebrae-survey`
4. **Configurar**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`

### 3. Configurações do Projeto

#### Variáveis de Ambiente (se necessário)
```
NEXT_PUBLIC_API_URL=https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app
```

#### Configurações de Build
- **Node.js Version**: 18.x
- **Install Command**: `npm install`
- **Build Command**: `npm run build`
- **Development Command**: `npm run dev`

### 4. Deploy Automático

Após a configuração:
1. **Clique**: "Deploy"
2. **Aguarde**: Build e deploy (2-3 minutos)
3. **Acesse**: URL fornecida pelo Vercel

## 🌐 URLs do Projeto

### Produção
- **Dashboard**: `https://sebrae-survey-dashboard.vercel.app` (exemplo)
- **API**: `https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app`

### Desenvolvimento
- **Local**: `http://localhost:3000`
- **Preview**: URLs de preview do Vercel para cada PR

## 📊 Funcionalidades do Dashboard

### ✅ Implementadas
- [x] Métricas em tempo real
- [x] Gráficos interativos (Recharts)
- [x] Análise por pergunta
- [x] Análise temporal
- [x] Análise de dispositivos
- [x] Tabela de respostas recentes
- [x] Atualização automática (30s)
- [x] Design responsivo
- [x] Interface moderna

### 📈 Visualizações
1. **Cards de Métricas**: Total, taxa de conclusão, tempo médio, status
2. **Gráfico de Linha**: Respostas por hora
3. **Gráfico de Pizza**: Distribuição de dispositivos
4. **Gráficos de Barras**: 6 gráficos, um para cada pergunta
5. **Tabela**: Últimas 10 respostas com detalhes

## 🔄 Atualizações Automáticas

O dashboard se atualiza automaticamente:
- **Frequência**: A cada 30 segundos
- **Fonte**: API do Cloud Run
- **Indicador**: Timestamp da última atualização

## 🎨 Customização

### Cores e Tema
```typescript
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];
```

### Perguntas e Respostas
```typescript
const questionLabels = {
  q1: 'Tecnologia e Inovação',
  q2: 'Diversidade e Inclusão', 
  // ... outras perguntas
};
```

## 📱 Responsividade

- **Mobile**: Layout adaptado para telas pequenas
- **Tablet**: Grid responsivo
- **Desktop**: Layout completo com todas as visualizações

## 🔒 Segurança

- **Headers**: Configurados no `vercel.json`
- **CORS**: API configurada para aceitar requisições
- **HTTPS**: Automático no Vercel

## 📈 Monitoramento

### Vercel Analytics
- **Performance**: Métricas de carregamento
- **Usage**: Estatísticas de uso
- **Errors**: Logs de erro

### API Monitoring
- **Cloud Run Logs**: `gcloud run services logs read sebrae-survey-api-fs`
- **Health Check**: Endpoint `/` da API

## 🚀 Próximos Passos

1. **Deploy**: Seguir os passos acima
2. **Teste**: Verificar todas as funcionalidades
3. **Customização**: Ajustar cores/logo conforme necessário
4. **Domínio**: Configurar domínio personalizado (opcional)
5. **Analytics**: Configurar Google Analytics (opcional)

## 📞 Suporte

- **Vercel Docs**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Docs**: [nextjs.org/docs](https://nextjs.org/docs)
- **Recharts Docs**: [recharts.org](https://recharts.org)

---

**Dashboard pronto para produção!** 🎉
