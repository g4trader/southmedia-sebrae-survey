# 🎯 Dashboard V4 - Sebrae Survey

## 📋 Visão Geral

O **Dashboard V4** é a evolução mais recente do dashboard Sebrae, implementando **filtro avançado por período** além de todas as funcionalidades das versões anteriores.

## 🆕 Novidades da V4

### 🔍 **Sistema de Filtro por Período**

#### **Filtros Rápidos**
- ✅ **Todos**: Exibe todos os dados históricos
- ✅ **Hoje**: Dados apenas do dia atual
- ✅ **7 dias**: Últimos 7 dias
- ✅ **30 dias**: Últimos 30 dias
- ✅ **Personalizado**: Selecione data inicial e final customizadas

#### **Funcionalidades do Filtro**
1. **Aplicação em Tempo Real**: 
   - Filtra automaticamente todos os gráficos
   - Atualiza todas as métricas (cards)
   - Recalcula estatísticas e notas
   - Filtra dados progressivos

2. **Indicadores Visuais**:
   - Badge mostrando período selecionado
   - Cores diferentes por tipo de filtro
   - Botão de limpar filtro (X vermelho)
   - Feedback visual do filtro ativo

3. **Seletor Personalizado**:
   - Interface limpa com date pickers
   - Validação de datas
   - Botões de Aplicar/Cancelar
   - Formato de data brasileira (dd/mm/yyyy)

## 🎨 Interface da V4

```
┌─────────────────────────────────────────────────────────────┐
│                 DASHBOARD V4 HEADER                          │
│                 Filtro por Período                           │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ 🔍 FILTRO POR PERÍODO                                       │
│ [Todos] [Hoje] [7 dias] [30 dias] [Personalizado]         │
│ Período selecionado: Últimos 7 dias             [X Limpar] │
│                                                              │
│ [Se Personalizado selecionado:]                             │
│ ┌────────────────────────────────────────────┐             │
│ │ Data Inicial: [____/__/____]               │             │
│ │ Data Final:   [____/__/____]               │             │
│ │              [Cancelar] [Aplicar Filtro]   │             │
│ └────────────────────────────────────────────┘             │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ [Dashboard Principal] [Dados Progressivos]  ← Abas         │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ [Ambos] [Pequenos Negócios] [Sociedade]    ← Toggle        │
└─────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────┐
│ [Métricas filtradas] [Meta] [Progresso] [Nota]             │
└─────────────────────────────────────────────────────────────┘
│                   ... (resto do dashboard)                   │
```

## 🚀 Funcionalidades Completas

### **Herdadas da V3**
- ✅ Separação por público (Pequenos Negócios vs Sociedade)
- ✅ Gráfico diário com meta vs realizado
- ✅ Sistema de pontuação por tema (10-7-4-0)
- ✅ Tabela comparativa de notas
- ✅ Dados progressivos em aba separada
- ✅ Análise de abandono por pergunta
- ✅ Cards de sessões ativas em tempo real
- ✅ Paginação dos dados progressivos
- ✅ UI modernizada com glassmorphism

### **Novas da V4**
- 🆕 Filtro por período com 5 opções
- 🆕 Seletor de data personalizado
- 🆕 Indicadores visuais do filtro ativo
- 🆕 Botão de limpar filtro
- 🆕 Filtragem em tempo real de todos os dados
- 🆕 Recálculo automático de métricas

## 🔧 Uso do Filtro

### **Filtros Rápidos**
1. Clique em qualquer botão de filtro rápido
2. Os dados são filtrados automaticamente
3. Todas as métricas e gráficos são atualizados

### **Filtro Personalizado**
1. Clique no botão "Personalizado"
2. Um painel se abre com dois date pickers
3. Selecione a **Data Inicial**
4. Selecione a **Data Final**
5. Clique em "Aplicar Filtro"
6. Os dados são filtrados para o período selecionado

### **Limpar Filtro**
- Clique no botão [X] ao lado do período selecionado
- Ou clique no botão "Todos"

## 📊 Métricas Filtradas

Quando um filtro é aplicado, as seguintes métricas são recalculadas:

### **Cards Principais**
- **Total de Respostas**: Filtrado por período
- **Meta Diária**: Recalculada para o período
- **Progresso Meta**: Baseado nas respostas filtradas
- **Nota Média**: Recalculada com dados filtrados

### **Gráficos**
1. **Evolução Diária**: Mostra apenas dados do período
2. **Meta vs Realizado**: Ajustado para o período
3. **Respostas por Pergunta**: Estatísticas filtradas
4. **Tabela de Notas**: Calculada com dados do período

### **Dados Progressivos**
- **Sessões Totais**: Filtradas por período
- **Taxa de Conclusão**: Calculada para o período
- **Abandono por Pergunta**: Baseado em dados filtrados
- **Sessões em Tempo Real**: Apenas do período selecionado

## 🎨 Paleta de Cores do Filtro

- **Todos**: Roxo/Rosa (Purple/Pink gradient)
- **Hoje**: Azul/Cyan (Blue/Cyan gradient)
- **7 dias**: Verde/Esmeralda (Green/Emerald gradient)
- **30 dias**: Laranja/Amarelo (Orange/Yellow gradient)
- **Personalizado**: Índigo/Roxo (Indigo/Purple gradient)
- **Limpar**: Vermelho (Red)

## 🌐 URLs de Acesso

### **Desenvolvimento**
```
http://localhost:3000/dashboard-v4
```

### **Produção** (após deploy)
```
https://sebrae-survey-dashboard.vercel.app/dashboard-v4
```

## 📈 Casos de Uso

### **1. Análise de Campanha Específica**
- Selecione o período da campanha
- Veja métricas isoladas daquele período
- Compare com metas do período

### **2. Análise de Performance Diária**
- Use o filtro "Hoje"
- Acompanhe o progresso do dia em tempo real
- Monitore se a meta diária será atingida

### **3. Análise Semanal**
- Use o filtro "7 dias"
- Identifique tendências semanais
- Compare performance com semanas anteriores

### **4. Análise Mensal**
- Use o filtro "30 dias"
- Avalie performance do mês
- Planeje próximas ações

### **5. Comparação Entre Períodos**
- Use filtro personalizado para período específico
- Anote as métricas
- Mude o período e compare

## 🔄 Fluxo de Filtragem

```
┌──────────────────────────────────────────────────────────┐
│ 1. Usuário seleciona filtro                              │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 2. Sistema calcula range de datas (startDate, endDate)  │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 3. Filtra respostas por timestamp                        │
│    - Respostas gerais (V1 + V2)                         │
│    - Respostas progressivas                              │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 4. Recalcula estatísticas                                │
│    - Contadores por público                              │
│    - Estatísticas por pergunta                           │
│    - Notas por tema                                      │
│    - Dados diários                                       │
└───────────────────┬──────────────────────────────────────┘
                    │
                    ▼
┌──────────────────────────────────────────────────────────┐
│ 5. Atualiza interface                                     │
│    - Cards de métricas                                   │
│    - Todos os gráficos                                   │
│    - Tabelas                                             │
│    - Badge do filtro ativo                               │
└──────────────────────────────────────────────────────────┘
```

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones
- **HTML5 Date Input** - Seletor de datas nativo

## 📝 Notas Técnicas

### **Formato de Data**
- Backend: ISO 8601 (`2025-01-15T10:30:00Z`)
- Display: Formato brasileiro (`15/01/2025`)
- Input: YYYY-MM-DD (padrão HTML5)

### **Fuso Horário**
- Datas são processadas em horário local
- Início do dia: 00:00:00
- Fim do dia: 23:59:59

### **Performance**
- Filtragem feita no cliente (front-end)
- Otimizada para grandes volumes de dados
- Sem necessidade de nova chamada à API

### **Atualização Automática**
- Dashboard atualiza a cada 5 minutos
- Filtro é mantido após atualização
- Dados são refiltrados automaticamente

## 🎯 Melhorias Futuras

### **Curto Prazo**
- [ ] Salvar preferência de filtro no localStorage
- [ ] Adicionar filtro de comparação de períodos
- [ ] Exportar dados filtrados (CSV/Excel)

### **Médio Prazo**
- [ ] Filtro por campanha específica
- [ ] Filtro por dispositivo
- [ ] Filtro por horário do dia

### **Longo Prazo**
- [ ] Filtros combinados (período + campanha + público)
- [ ] Presets de filtros salvos
- [ ] Compartilhamento de visualizações filtradas

## 🔍 Troubleshooting

### **Filtro não aplica**
- Verifique se as datas estão no formato correto
- Certifique-se de que data inicial < data final
- Clique em "Aplicar Filtro" após selecionar as datas

### **Gráficos em branco**
- Pode não haver dados no período selecionado
- Tente ampliar o período
- Clique em "Todos" para ver todos os dados

### **Métricas zeradas**
- Normal se não houver dados no período
- Verifique se o filtro está correto
- Limpe o filtro e tente novamente

## 📞 Suporte

### **Documentação**
- **Dashboard V4**: `DASHBOARD_V4_README.md` (este arquivo)
- **Dashboard V3**: `DASHBOARD_V2_README.md`
- **Dashboard Original**: `README.md`

### **Arquivos Principais**
- **Dashboard V4**: `src/app/dashboard-v4/page.tsx`
- **Dashboard V3**: `src/app/dashboard-v3/page.tsx`
- **Dashboard V2**: `src/app/dashboard-v2/page.tsx`

---

## 🎉 Resumo das Versões

| Versão | Principais Funcionalidades |
|--------|---------------------------|
| **V1** | Dashboard básico, métricas gerais |
| **V2** | Separação por público, sistema de notas |
| **V3** | Dados progressivos, análise de abandono |
| **V4** | **Filtro por período, análise temporal** |

---

**Status**: ✅ Pronto para uso! 🚀

**Desenvolvido para o Sebrae/PR** - South Media



