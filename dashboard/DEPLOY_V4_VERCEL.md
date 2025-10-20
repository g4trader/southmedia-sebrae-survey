# 🚀 Guia de Deploy - Dashboard V4 no Vercel

## 📋 Pré-requisitos

- ✅ Código commitado e pushado no GitHub
- ✅ Conta no Vercel
- ✅ Dashboard testado localmente

---

## 🎯 Opção 1: Deploy Automático (Recomendado)

### **Passo 1: Acessar o Vercel**

1. Acesse: https://vercel.com
2. Faça login com sua conta GitHub

### **Passo 2: Importar Projeto**

1. Clique em **"Add New..."** → **"Project"**
2. Selecione o repositório: **southmedia-sebrae-survey**
3. Clique em **"Import"**

### **Passo 3: Configurar Build**

```
Framework Preset: Next.js
Root Directory: dashboard
Build Command: npm run build
Output Directory: .next
Install Command: npm install
```

### **Passo 4: Variáveis de Ambiente**

Nenhuma variável de ambiente necessária (APIs públicas).

### **Passo 5: Deploy**

1. Clique em **"Deploy"**
2. Aguarde 2-3 minutos
3. ✅ Pronto! Dashboard no ar!

---

## 🔄 Opção 2: Deploy Manual via CLI

### **Passo 1: Instalar Vercel CLI**

```bash
npm install -g vercel
```

### **Passo 2: Login**

```bash
vercel login
```

### **Passo 3: Deploy**

```bash
cd dashboard
vercel --prod
```

Responda as perguntas:
```
Set up and deploy "~/dashboard"? Y
Which scope? (sua conta)
Link to existing project? N
What's your project's name? sebrae-survey-dashboard
In which directory is your code located? ./
```

---

## 🌐 URLs Após Deploy

### **Produção:**
```
https://sebrae-survey-dashboard.vercel.app/dashboard-v4
```

### **Preview (cada commit):**
```
https://sebrae-survey-dashboard-[hash].vercel.app/dashboard-v4
```

---

## ✅ Verificação Pós-Deploy

### **1. Testar Funcionalidades**

Acesse a URL de produção e teste:

- [ ] Dashboard carrega
- [ ] Filtro "Todos" funciona
- [ ] Filtro "Hoje" funciona
- [ ] Filtro "7 dias" funciona
- [ ] Filtro "30 dias" funciona
- [ ] Filtro "Personalizado" funciona
- [ ] Loading aparece ao filtrar
- [ ] Gráficos renderizam
- [ ] Toggle de público funciona
- [ ] Abas funcionam (Principal/Progressivo)

### **2. Verificar Performance**

Acesse: https://pagespeed.web.dev/

Cole a URL do dashboard e verifique:
- [ ] Performance > 90
- [ ] Acessibilidade > 90
- [ ] Melhores práticas > 90
- [ ] SEO > 90

### **3. Testar em Dispositivos**

- [ ] Desktop (Chrome, Firefox, Safari)
- [ ] Tablet (iPad, Android)
- [ ] Mobile (iPhone, Android)

---

## 🔧 Configuração Avançada

### **Custom Domain (Opcional)**

1. Acesse: Vercel Dashboard → Project → Settings → Domains
2. Adicione seu domínio: `dashboard.seudominio.com.br`
3. Configure DNS conforme instruções
4. Aguarde propagação (até 24h)

### **Environment Variables**

Se precisar adicionar variáveis:

```bash
vercel env add [NOME_DA_VARIAVEL]
```

Ou no painel:
1. Settings → Environment Variables
2. Add → Nome e Valor
3. Redeploy para aplicar

### **Build Optimizations**

O `next.config.ts` já está otimizado com:
- ✅ Compressão de assets
- ✅ Lazy loading de componentes
- ✅ Minificação de código
- ✅ Cache de build

---

## 📊 Monitoramento

### **Vercel Analytics**

1. Acesse: Project → Analytics
2. Veja métricas:
   - Page views
   - Visitors
   - Performance
   - Errors

### **Logs em Tempo Real**

```bash
vercel logs --follow
```

Ou no painel:
1. Project → Deployments
2. Clique no deployment
3. Veja logs em tempo real

---

## 🐛 Troubleshooting

### **Build Falhou**

```bash
# Localmente
cd dashboard
npm run build

# Verifica erros
npm run lint
```

### **Dashboard não carrega**

1. Verifique logs: `vercel logs`
2. Teste localmente: `npm run dev`
3. Verifique APIs estão acessíveis
4. Limpe cache: Settings → General → Clear Cache

### **Filtros não funcionam**

1. Verifique console do navegador (F12)
2. Teste APIs diretamente:
   ```
   https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/responses
   ```
3. Verifique CORS

### **Loading não aparece**

1. Teste em modo dev local
2. Verifique console para erros
3. Hard refresh: Ctrl+Shift+R (Win) / Cmd+Shift+R (Mac)

---

## 🔄 Atualização do Dashboard

### **Deploy Automático**

Cada `git push` cria um preview deployment automaticamente.

Para atualizar produção:
1. Merge para branch `main`
2. Push para GitHub
3. Vercel detecta e faz deploy automaticamente

### **Rollback**

Se algo der errado:
1. Acesse: Deployments
2. Encontre deployment anterior
3. Clique nos 3 pontos → **Promote to Production**

---

## 📈 Próximos Passos

### **1. Analytics Detalhado**

Adicione Google Analytics:

```tsx
// dashboard/src/app/layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

### **2. Monitoring**

Configure alertas:
- Vercel Alerts para erros
- Uptime monitoring (UptimeRobot, Pingdom)
- Performance monitoring (Sentry)

### **3. SEO**

Otimize metadata:
```tsx
// dashboard/src/app/dashboard-v4/page.tsx
export const metadata = {
  title: 'Dashboard V4 - Sebrae Survey',
  description: 'Dashboard com filtros de data...',
}
```

---

## 📞 Suporte

### **Vercel Support**
- https://vercel.com/support
- help@vercel.com

### **Documentação**
- https://vercel.com/docs
- https://nextjs.org/docs

### **Community**
- Discord: https://discord.gg/vercel
- GitHub Discussions

---

## 🎉 Checklist Final

Antes de considerar o deploy completo:

- [ ] ✅ Build sem erros
- [ ] ✅ Deploy feito com sucesso
- [ ] ✅ URL acessível
- [ ] ✅ Filtros funcionando
- [ ] ✅ Loading aparecendo
- [ ] ✅ Gráficos renderizando
- [ ] ✅ Responsivo em mobile
- [ ] ✅ Performance > 90
- [ ] ✅ Sem erros no console
- [ ] ✅ APIs respondendo
- [ ] ✅ Documentação atualizada
- [ ] ✅ Time notificado

---

## 📊 Estrutura do Projeto no Vercel

```
southmedia-sebrae-survey/
│
├── dashboard/              ← Root Directory
│   ├── src/
│   │   └── app/
│   │       ├── page.tsx           → /
│   │       ├── dashboard-v2/      → /dashboard-v2
│   │       ├── dashboard-v3/      → /dashboard-v3
│   │       └── dashboard-v4/      → /dashboard-v4 ✨ NOVO
│   ├── package.json
│   └── next.config.ts
│
└── ...outros arquivos
```

---

## 🚀 URLs Finais

| Versão | URL |
|--------|-----|
| **V1** | https://sebrae-survey-dashboard.vercel.app/ |
| **V2** | https://sebrae-survey-dashboard.vercel.app/dashboard-v2 |
| **V3** | https://sebrae-survey-dashboard.vercel.app/dashboard-v3 |
| **V4** | https://sebrae-survey-dashboard.vercel.app/dashboard-v4 🆕 |

---

**Bom deploy! 🚀**

**Desenvolvido por South Media para Sebrae/PR**



