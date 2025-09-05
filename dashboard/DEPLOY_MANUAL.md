# 🚀 Deploy Manual no Vercel

## ⚠️ Problema: Deploy Automático Não Funcionou

Se o deploy automático não funcionou, siga estes passos para fazer o deploy manual:

## 📋 Passos para Deploy Manual

### 1. Acessar o Vercel Dashboard
- Vá para [vercel.com/dashboard](https://vercel.com/dashboard)
- Faça login com sua conta

### 2. Importar Projeto
1. **Clique em "New Project"**
2. **Selecione "Import Git Repository"**
3. **Escolha**: `g4trader/southmedia-sebrae-survey`
4. **Configure**:
   - **Framework Preset**: Next.js
   - **Root Directory**: `dashboard`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### 3. Configurações Avançadas
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install",
  "framework": "nextjs"
}
```

### 4. Variáveis de Ambiente (se necessário)
```
NEXT_PUBLIC_API_URL=https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app
```

### 5. Deploy
- **Clique em "Deploy"**
- **Aguarde** o build (2-3 minutos)
- **Acesse** a URL fornecida

## 🔧 Verificações Importantes

### ✅ Arquivos Necessários
- [x] `package.json` - Dependências corretas
- [x] `next.config.ts` - Configuração otimizada
- [x] `vercel.json` - Configuração do Vercel
- [x] `.vercelignore` - Arquivos ignorados
- [x] `src/app/page.tsx` - Dashboard redesenhado

### ✅ Build Local
```bash
cd dashboard
npm run build
# ✅ Build successful
```

### ✅ Estrutura do Projeto
```
dashboard/
├── src/app/page.tsx          # Dashboard principal
├── package.json              # Dependências
├── next.config.ts            # Configuração Next.js
├── vercel.json               # Configuração Vercel
├── .vercelignore             # Arquivos ignorados
└── .vercel/project.json      # Configuração projeto
```

## 🚨 Possíveis Problemas

### 1. **Root Directory Incorreto**
- **Problema**: Vercel tentando buildar na raiz
- **Solução**: Definir Root Directory como `dashboard`

### 2. **Framework Não Detectado**
- **Problema**: Vercel não reconhece Next.js
- **Solução**: Selecionar manualmente "Next.js"

### 3. **Build Command Incorreto**
- **Problema**: Comando de build falhando
- **Solução**: Usar `npm run build`

### 4. **Dependências Não Instaladas**
- **Problema**: Erro de dependências
- **Solução**: Verificar `package.json`

## 📞 Suporte

### Logs do Vercel
- **Build Logs**: Verificar na aba "Functions" do projeto
- **Deploy Logs**: Verificar na aba "Deployments"

### Comandos Úteis
```bash
# Verificar build local
cd dashboard && npm run build

# Verificar dependências
npm list --depth=0

# Verificar estrutura
ls -la dashboard/
```

## 🎯 Resultado Esperado

Após o deploy bem-sucedido:
- ✅ Dashboard acessível via URL do Vercel
- ✅ Design moderno com gradientes
- ✅ Gráficos interativos funcionando
- ✅ Dados da API carregando
- ✅ Responsivo em todos os dispositivos

---

**Se ainda houver problemas, verifique os logs do Vercel e entre em contato!** 🚀
