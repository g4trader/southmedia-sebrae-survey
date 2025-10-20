# 🎯 Dashboard V5 - Integração com Mídia Programática

## 📋 Visão Geral

O **Dashboard V5** integra métricas de **mídia programática** (impressões e cliques) com os dados de respostas da pesquisa, permitindo análise completa do funil de conversão.

## 🆕 Novidades da V5

### 🔗 **Integração com Google Sheets**

O Dashboard V5 se conecta diretamente à [planilha de mídia programática](https://docs.google.com/spreadsheets/d/1Qkt97QvawuvKp_2NBvLw5-rQfhHLwfobEhL7XBA6UMQ) e extrai dados em tempo real:

- **Coluna Impressions**: Total de impressões da campanha
- **Coluna Clicks**: Total de cliques (considerados como "Starts")
- **Atualização**: Automática a cada 5 minutos
- **Filtros**: Aplica filtros de data também aos dados de mídia

### 📊 **Novos Cards de Métricas**

#### **Card 1: Impressões** 👁️
- Total de impressões da campanha
- Filtrado por público selecionado
- Fonte: Google Sheets (Coluna G)

#### **Card 2: Starts (Cliques)** 🖱️
- Total de cliques nos criativos
- **Interpretação**: Sessões iniciadas
- Fonte: Google Sheets (Coluna H)

#### **Card 3: Respostas Totais** ✅
- Total de pesquisas completadas
- Fonte: APIs do backend

#### **Card 4: Taxa de Conclusão** 📈
- **Cálculo**: (Respostas Totais / Cliques) × 100
- **Interpretação**: % de quem clicou e completou a pesquisa
- **Exemplo**: 150 respostas / 500 cliques = 30%

#### **Card 5: Progresso da Meta** 🎯
- **Meta**: 3000 respostas totais (1500 por público)
- **Cálculo**: (Respostas / Meta) × 100
- **Interpretação**: % da meta atingida

#### **Card 6: Nota Média** ⭐
- Pontuação média dos temas (0-10)
- Sistema de pontuação: 10-7-4-0

---

## 🎨 Novo Layout V5

```
┌─────────────────────────────────────────────────────────────┐
│ [Filtro por Período]                                        │
│ [Todos] [Hoje] [7 dias] [30 dias] [Personalizado]         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ [Dashboard Principal] [Dados Progressivos]                  │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ [Ambos] [Pequenos Negócios] [Sociedade]                    │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ 👁️ IMPRESSÕES  │  🖱️ STARTS  │  ✅ RESPOSTAS TOTAIS       │
│ 1,234,567      │  12,345     │  3,456                      │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ 📈 TAXA        │  🎯 PROGRESSO │  ⭐ NOTA MÉDIA            │
│ 28.0%          │  86%          │  7.8                       │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│               FUNIL DE CONVERSÃO                            │
│  👁️              🖱️                ✅                      │
│  Impressões →  Starts (Cliques) →  Respostas              │
│  1,234,567     12,345 (1.0%)     3,456 (28%)              │
└─────────────────────────────────────────────────────────────┘
│ [Gráfico: Evolução Diária - Impressões e Cliques]         │
│ [Gráfico: Meta vs Realizado]                              │
│ [Tabela: Notas por Tema]                                  │
│ [Gráficos: Análise por Pergunta]                          │
```

---

## 📈 Métricas e Cálculos

### **Taxa de Conclusão**

```
Taxa de Conclusão = (Respostas Totais / Cliques) × 100

Exemplo:
- Cliques (Starts): 500
- Respostas: 150
- Taxa: (150 / 500) × 100 = 30%

Interpretação:
- < 20%: Baixa (melhorar experiência)
- 20-40%: Média (dentro do esperado)
- > 40%: Alta (excelente engajamento)
```

### **Progresso da Meta**

```
Meta Total: 3000 respostas
- Pequenos Negócios: 1500
- Sociedade: 1500

Progresso = (Respostas Atuais / Meta) × 100

Exemplo:
- Respostas: 2580
- Meta: 3000
- Progresso: (2580 / 3000) × 100 = 86%
```

### **CTR (Click-Through Rate)**

```
CTR = (Cliques / Impressões) × 100

Exemplo:
- Impressões: 1,000,000
- Cliques: 10,000
- CTR: (10,000 / 1,000,000) × 100 = 1%

Benchmarks:
- 0.5-1%: Display padrão
- 1-2%: Bom para display
- > 2%: Excelente
```

---

## 🔗 Integração com Google Sheets

### **Como Funciona**

```
1. Dashboard busca dados da planilha via API do Google Sheets
2. URL: https://docs.google.com/spreadsheets/.../export?format=csv
3. Processa CSV e extrai:
   - Coluna G (Impressions)
   - Coluna H (Clicks)
   - Coluna E (Date)
4. Identifica público pelo Line Item (coluna D):
   - "PEQUENOS NEGÓCIOS" → small_business
   - "SOCIEDADE" → general_public
5. Aplica filtros de data
6. Calcula métricas agregadas
```

### **Requisitos da Planilha**

✅ **Permissões**: Planilha deve estar pública ou compartilhada
✅ **Formato**: CSV exportável
✅ **Colunas obrigatórias**:
- Coluna E: Date (formato: YYYY/MM/DD)
- Coluna G: Impressions (número)
- Coluna H: Clicks (número)
- Coluna D: Line Item (texto identificando público)

---

## 🎯 Casos de Uso

### **1. Análise de Performance de Campanha**

```
Cenário: Avaliar eficácia da campanha

Métricas a observar:
- CTR > 1% ✅
- Taxa de Conclusão > 25% ✅
- Progresso da Meta > 80% ✅

Ações:
- CTR baixo → Otimizar criativos
- Taxa baixa → Simplificar pesquisa
- Meta longe → Aumentar budget
```

### **2. Comparação Entre Públicos**

```
Use o toggle para comparar:

Pequenos Negócios:
- Impressões: 500k
- Starts: 5k (CTR: 1%)
- Respostas: 1,500 (30% conclusão)

Sociedade:
- Impressões: 500k
- Starts: 5k (CTR: 1%)
- Respostas: 1,500 (30% conclusão)

Insight: Performance equilibrada ✅
```

### **3. Otimização do Funil**

```
Funil Atual:
1M impressões → 10k clicks (1%) → 2.5k respostas (25%)

Oportunidades:
1. Aumentar CTR (1% → 1.5%)
   → +5k clicks potenciais
   
2. Aumentar conclusão (25% → 30%)
   → +1.25k respostas extras
   
Total potencial: +3k respostas 🚀
```

---

## 🔄 Atualização de Dados

### **Frequência**

- **Automática**: A cada 5 minutos
- **Manual**: Botão de refresh no header
- **Filtros**: Imediato ao aplicar filtro

### **Fontes de Dados**

| Métrica | Fonte | Atualização |
|---------|-------|-------------|
| Impressões | Google Sheets | Manual na planilha |
| Cliques | Google Sheets | Manual na planilha |
| Respostas | API Cloud Run | Tempo real |
| Progressivos | API Cloud Run | Tempo real |
| Notas | Calculado | Em tempo real |

---

## 🚀 Funcionalidades Herdadas

### **Da V4:**
- ✅ Sistema de filtros por data (5 opções)
- ✅ Loading indicator durante filtragem
- ✅ Todos os gráficos e visualizações

### **Da V3:**
- ✅ Separação por público
- ✅ Dados progressivos em aba separada
- ✅ Análise de abandono

### **Da V2:**
- ✅ Sistema de pontuação por tema
- ✅ Tabela comparativa de notas

---

## 🌐 URLs de Acesso

### **Desenvolvimento**
```
http://localhost:3000/dashboard-v5
```

### **Produção - Vercel**
```
https://dashboard-drab-mu.vercel.app/dashboard-v5
```

### **Produção - Cloud Run**
```
https://sebrae-dashboard-v4-609095880025.southamerica-east1.run.app/dashboard-v5
```

---

## 🧪 Testes

### **Executar Testes**

```bash
python3 test_dashboard_v5.py
```

**9 testes implementados:**
1. ✅ Integração Google Sheets
2. ✅ Carregamento da página
3. ✅ Cards de métricas
4. ✅ Funil de conversão
5. ✅ Gráfico de impressões/cliques
6. ✅ Valores das métricas
7. ✅ Filtros de data
8. ✅ Cálculo de taxa de conclusão
9. ✅ Meta de 3000

---

## 📊 KPIs Principais

### **Para o Cliente (Sebrae)**

| KPI | Meta | Como Medir |
|-----|------|------------|
| Respostas Totais | 3000 | Card "Respostas Totais" |
| Taxa de Conclusão | > 25% | Card "Taxa de Conclusão" |
| Progresso da Meta | 100% | Card "Progresso da Meta" |
| Nota Média | > 7.0 | Card "Nota Média" |

### **Para a Agência (South Media)**

| KPI | Benchmark | Como Medir |
|-----|-----------|------------|
| CTR | > 1% | Gráfico de evolução diária |
| Impressões | Conforme budget | Card "Impressões" |
| Starts | Conforme CTR | Card "Starts" |
| Conversão (Click→Resposta) | > 25% | Taxa de Conclusão |

---

## 🎨 Design e UX

### **Paleta de Cores V5**

- **Impressões**: Índigo/Roxo (#6366F1 → #A855F7)
- **Starts**: Azul/Cyan (#3B82F6 → #06B6D4)
- **Respostas**: Roxo/Rosa (#A855F7 → #EC4899)
- **Taxa**: Verde/Esmeralda (#10B981 → #34D399)
- **Progresso**: Laranja/Amarelo (#F97316 → #FCD34D)
- **Nota**: Rosa/Rose (#EC4899 → #FB7185)

### **Ícones**

- 👁️ `Eye` - Impressões
- 🖱️ `MousePointer` - Starts (Cliques)
- ✅ `CheckSquare` - Respostas
- 📈 `Percent` - Taxa de Conclusão
- 🎯 `Target` - Progresso da Meta
- ⭐ `Award` - Nota Média

---

## 🔧 Configuração Técnica

### **Google Sheets API**

```typescript
// ID da planilha
const SHEET_ID = '1Qkt97QvawuvKp_2NBvLw5-rQfhHLwfobEhL7XBA6UMQ';
const SHEET_GID = '1701691221'; // GID da aba específica

// URL de exportação CSV (planilha pública)
const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
```

### **Processamento de Dados**

```typescript
// Ler CSV
const response = await fetch(csvUrl);
const csvText = await response.text();
const lines = csvText.split('\n');

// Processar linhas
lines.forEach(line => {
  const columns = line.split(',');
  const impressions = parseInt(columns[7]); // Coluna G
  const clicks = parseInt(columns[8]);      // Coluna H
  const date = columns[5];                  // Coluna E
  const lineItem = columns[3];              // Coluna D (identificar público)
  
  // Agregar dados...
});
```

### **Identificação de Público**

```typescript
// Identifica público pelo nome do Line Item
if (lineItem.includes('PEQUENOS') || lineItem.includes('PEQUENO')) {
  smallBusinessImpressions += impressions;
  smallBusinessClicks += clicks;
} else if (lineItem.includes('SOCIEDADE')) {
  generalPublicImpressions += impressions;
  generalPublicClicks += clicks;
}
```

---

## 📈 Análises Disponíveis

### **1. Funil de Conversão Completo**

```
Impressões → Cliques → Respostas
   100%        1.0%       0.3%

Onde perder usuários:
- Impressão → Clique: 99% (normal para display)
- Clique → Resposta: 70% (pode melhorar)
```

### **2. Performance por Público**

```
Compare:
- CTR por público
- Taxa de conclusão por público
- Progresso da meta por público
```

### **3. Evolução Temporal**

```
Gráficos mostram:
- Impressões diárias
- Cliques diários
- CTR diário
- Respostas diárias vs meta
```

---

## 🎯 Melhorias da V5 sobre V4

| Feature | V4 | V5 |
|---------|----|----|
| Filtros de data | ✅ | ✅ |
| Loading indicator | ✅ | ✅ |
| Dados progressivos | ✅ | ✅ |
| **Integração Google Sheets** | ❌ | ✅ |
| **Métricas de mídia** | ❌ | ✅ |
| **Impressões** | ❌ | ✅ |
| **Starts (Cliques)** | ❌ | ✅ |
| **Taxa de Conclusão** | ❌ | ✅ |
| **Funil de Conversão** | ❌ | ✅ |
| **Meta de 3000** | ❌ | ✅ |

---

## 🔧 Troubleshooting

### **Problema: Impressões/Cliques mostram 0**

**Possíveis causas:**
1. Planilha não está pública
2. URL da planilha incorreta
3. Formato da planilha mudou
4. Erro de CORS

**Solução:**
1. Verifique se a planilha é acessível: [Link da planilha](https://docs.google.com/spreadsheets/d/1Qkt97QvawuvKp_2NBvLw5-rQfhHLwfobEhL7XBA6UMQ)
2. Teste a URL de export: `https://docs.google.com/spreadsheets/d/1Qkt97QvawuvKp_2NBvLw5-rQfhHLwfobEhL7XBA6UMQ/export?format=csv&gid=1701691221`
3. Verifique console do navegador (F12) para erros

### **Problema: Taxa de Conclusão muito baixa**

**Análise:**
- Se < 20%: Pesquisa muito longa ou complexa
- Se 20-40%: Normal para pesquisas online
- Se > 40%: Excelente!

**Ações:**
- Simplificar perguntas
- Reduzir número de perguntas
- Melhorar UX do formulário
- Testar diferentes criativos

### **Problema: Meta não está sendo atingida**

**Análise funil:**
1. **Impressões baixas** → Aumentar budget/lances
2. **CTR baixo** → Otimizar criativos
3. **Conclusão baixa** → Melhorar pesquisa

---

## 🚀 Roadmap V6

### **Sugestões para próxima versão:**

- [ ] Integração com Google Analytics 4
- [ ] Exportação de dados (CSV, Excel, PDF)
- [ ] Alertas quando meta < 50%
- [ ] Comparação de períodos (ex: semana vs semana)
- [ ] Segmentação por dispositivo
- [ ] Análise de horários de pico
- [ ] Previsão de meta (IA/ML)
- [ ] Dashboard de custos (CPC, CPM)

---

## 📞 Suporte

### **Documentação**
- Dashboard V5: `DASHBOARD_V5_README.md`
- Dashboard V4: `DASHBOARD_V4_README.md`
- Deploy: `DEPLOY_V4_VERCEL.md`, `DEPLOY_CLOUD_RUN.md`

### **Testes**
- Local: `python3 test_dashboard_v5.py`
- Cloud Run: `./run_cloud_run_tests.sh`

---

## 🎉 Resumo V5

**O Dashboard V5 é a versão mais completa**, integrando:

1. ✅ **Métricas de mídia** (Impressões + Cliques)
2. ✅ **Google Sheets** (dados em tempo real)
3. ✅ **Funil completo** (Impressão → Click → Resposta)
4. ✅ **Taxa de conclusão** (métrica-chave)
5. ✅ **Meta de 3000** (1500 por público)
6. ✅ **Todas features anteriores** (V4, V3, V2, V1)

**Status**: ✅ Pronto para uso em produção!

---

**Desenvolvido por South Media para Sebrae/PR** 🚀



