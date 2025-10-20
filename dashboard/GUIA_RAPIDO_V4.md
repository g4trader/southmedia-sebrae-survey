# 🚀 Guia Rápido - Dashboard V4

## Como Usar o Filtro de Período

### 📅 **Filtros Rápidos** (1 clique)

#### **Todos os Dados**
```
Clique no botão [Todos]
└─> Mostra todo o histórico
```

#### **Dados de Hoje**
```
Clique no botão [Hoje]
└─> Mostra apenas dados de hoje
└─> Útil para acompanhamento diário
```

#### **Últimos 7 Dias**
```
Clique no botão [7 dias]
└─> Mostra dados da última semana
└─> Identifica tendências semanais
```

#### **Últimos 30 Dias**
```
Clique no botão [30 dias]
└─> Mostra dados do último mês
└─> Análise mensal de performance
```

---

## 🎯 **Filtro Personalizado** (período específico)

### Passo a Passo:

1. **Clique em [Personalizado]**
   ```
   Um painel se abre com dois campos de data
   ```

2. **Selecione a Data Inicial**
   ```
   Clique no primeiro campo
   └─> Escolha a data de início
   ```

3. **Selecione a Data Final**
   ```
   Clique no segundo campo
   └─> Escolha a data de fim
   ```

4. **Aplique o Filtro**
   ```
   Clique em [Aplicar Filtro]
   └─> Dados são filtrados imediatamente
   ```

5. **Para Cancelar**
   ```
   Clique em [Cancelar]
   └─> Fecha o painel sem aplicar
   ```

---

## 🔄 **Limpar Filtro**

### Opção 1: Botão X
```
Clique no [X] vermelho ao lado do período
└─> Remove o filtro atual
└─> Volta para "Todos"
```

### Opção 2: Botão Todos
```
Clique em [Todos]
└─> Remove qualquer filtro ativo
└─> Mostra todos os dados
```

---

## 📊 **O Que é Filtrado?**

Quando você aplica um filtro, **TUDO** é atualizado:

### ✅ Cards de Métricas
- Respostas Totais
- Meta Diária
- Progresso da Meta
- Nota Média

### ✅ Gráficos
- Evolução Diária
- Meta vs Realizado
- Gráficos por Pergunta
- Tabela de Notas

### ✅ Dados Progressivos
- Sessões Totais
- Taxa de Conclusão
- Abandono por Pergunta
- Sessões Ativas

---

## 💡 **Exemplos de Uso**

### **Exemplo 1: Verificar Performance de Hoje**
```
1. Clique em [Hoje]
2. Veja quantas respostas foram coletadas hoje
3. Compare com a meta diária
4. Monitore em tempo real
```

### **Exemplo 2: Análise Semanal**
```
1. Clique em [7 dias]
2. Veja o total de respostas da semana
3. Identifique dias com mais respostas
4. Planeje ações para próxima semana
```

### **Exemplo 3: Comparar Duas Semanas**
```
Semana 1:
1. Clique em [Personalizado]
2. Selecione 01/10/2025 a 07/10/2025
3. Anote: 234 respostas

Semana 2:
1. Clique em [Personalizado]
2. Selecione 08/10/2025 a 14/10/2025
3. Compare: 289 respostas (+23% 📈)
```

### **Exemplo 4: Análise de Campanha**
```
1. Clique em [Personalizado]
2. Selecione datas de início e fim da campanha
3. Veja performance isolada
4. Calcule ROI da campanha
```

---

## 🎨 **Cores dos Botões**

- 🟣 **Roxo/Rosa**: Todos os períodos
- 🔵 **Azul/Cyan**: Hoje
- 🟢 **Verde/Esmeralda**: 7 dias
- 🟠 **Laranja/Amarelo**: 30 dias
- 🟣 **Índigo/Roxo**: Personalizado
- 🔴 **Vermelho**: Limpar filtro

---

## 📱 **Acessar o Dashboard**

### Desenvolvimento:
```bash
cd dashboard
npm run dev
```
Abra: `http://localhost:3000/dashboard-v4`

### Produção:
```
https://sebrae-survey-dashboard.vercel.app/dashboard-v4
```

---

## 🎯 **Dicas Pro**

### ✨ **Atalho Visual**
O período atual está sempre visível no topo:
```
Período selecionado: [Últimos 7 dias] [X]
```

### ✨ **Atualização Automática**
O dashboard atualiza a cada 5 minutos, mas **mantém o filtro ativo**.

### ✨ **Combinação de Filtros**
Você pode combinar:
1. Filtro de Período
2. Filtro de Público (Ambos/Pequenos Negócios/Sociedade)
3. Aba (Principal/Progressivo)

Exemplo:
```
[7 dias] + [Pequenos Negócios] + [Dados Progressivos]
= Dados progressivos de pequenos negócios dos últimos 7 dias
```

---

## ⚠️ **Importante**

### **Sem Dados no Período**
Se você selecionar um período sem dados:
- Os gráficos ficam vazios
- As métricas mostram zero
- Isso é normal! Tente outro período.

### **Data Inicial > Data Final**
- O sistema não permite
- Selecione uma data inicial anterior à final
- O botão "Aplicar" fica desabilitado se inválido

---

## 🆘 **Problemas Comuns**

### **"Filtro não funciona"**
```
✅ Verifique se clicou em "Aplicar Filtro"
✅ Aguarde alguns segundos para processar
✅ Tente limpar o cache do navegador
```

### **"Gráficos em branco"**
```
✅ Pode não haver dados no período
✅ Clique em [Todos] para ver todos os dados
✅ Tente ampliar o período
```

### **"Datas não aparecem"**
```
✅ Use um navegador moderno (Chrome, Firefox, Safari, Edge)
✅ Verifique se JavaScript está habilitado
✅ Atualize a página (F5)
```

---

## 📞 **Precisa de Ajuda?**

### Documentação Completa:
- `DASHBOARD_V4_README.md` - Documentação técnica completa

### Contato:
- Abra uma issue no repositório
- Entre em contato com a equipe de desenvolvimento

---

**Desenvolvido por South Media para Sebrae/PR** 🚀



