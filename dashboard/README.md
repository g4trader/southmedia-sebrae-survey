# 📊 Sebrae Survey Dashboard

Dashboard em tempo real para acompanhamento das respostas da pesquisa Sebrae sobre empreendedorismo no Paraná.

## 🚀 Funcionalidades

- **Métricas em Tempo Real**: Total de respostas, taxa de conclusão, tempo médio
- **Visualizações Interativas**: Gráficos de barras, pizza e linha
- **Análise por Pergunta**: Distribuição das respostas para cada pergunta
- **Análise Temporal**: Respostas por hora do dia
- **Análise de Dispositivos**: Desktop, Mobile, Tablet
- **Tabela de Respostas**: Últimas 10 respostas recebidas
- **Atualização Automática**: Dados atualizados a cada 30 segundos

## 🛠️ Tecnologias

- **Next.js 15** - Framework React
- **TypeScript** - Tipagem estática
- **Tailwind CSS** - Estilização
- **Recharts** - Gráficos e visualizações
- **Lucide React** - Ícones

## 📈 Métricas Disponíveis

### Cards Principais
- **Total de Respostas**: Número total de respostas coletadas
- **Taxa de Conclusão**: Percentual de pesquisas completadas
- **Tempo Médio**: Tempo estimado para completar a pesquisa
- **Status do Sistema**: Indicador de saúde da API

### Visualizações
1. **Respostas por Hora**: Gráfico de linha mostrando distribuição temporal
2. **Dispositivos**: Gráfico de pizza com tipos de dispositivo
3. **Respostas por Pergunta**: 6 gráficos de barras, um para cada pergunta

### Perguntas Analisadas
1. **Tecnologia e Inovação**: "O Sebrae acompanha as novidades em tecnologia?"
2. **Diversidade e Inclusão**: "O Sebrae promove diversidade e inclusão?"
3. **Sustentabilidade Ambiental**: "Como você vê o trabalho do Sebrae em sustentabilidade?"
4. **Reconhecimento Público**: "O Sebrae valoriza e divulga sucessos?"
5. **Agilidade de Resposta**: "O Sebrae responde rapidamente às demandas?"
6. **Parcerias e Colaboração**: "O Sebrae trabalha bem em parceria?"

## 🔧 Instalação e Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar em produção
npm start
```

## 🌐 Deploy no Vercel

1. **Conectar repositório** ao Vercel
2. **Configurar variáveis de ambiente** (se necessário)
3. **Deploy automático** a cada push

### Configuração do Vercel

O projeto inclui `vercel.json` com:
- Configuração de runtime Node.js 18.x
- Headers de segurança
- Otimizações de performance

## 📊 Fonte de Dados

O dashboard consome dados da API do Cloud Run:
- **Endpoint**: `https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/responses`
- **Frequência**: Atualização a cada 30 segundos
- **Formato**: JSON com respostas estruturadas

## 🎨 Design

- **Responsivo**: Funciona em desktop, tablet e mobile
- **Dark/Light**: Suporte a temas (futuro)
- **Acessível**: Componentes com ARIA labels
- **Moderno**: Interface limpa e intuitiva

## 📱 Responsividade

- **Mobile First**: Design otimizado para dispositivos móveis
- **Breakpoints**: sm (640px), md (768px), lg (1024px), xl (1280px)
- **Grid Adaptativo**: Layout que se adapta ao tamanho da tela

## 🔒 Segurança

- **Headers de Segurança**: X-Frame-Options, X-XSS-Protection
- **CORS**: Configurado para aceitar apenas origens confiáveis
- **Validação**: Dados validados antes da exibição

## 📈 Performance

- **Lazy Loading**: Componentes carregados sob demanda
- **Memoização**: Dados em cache para melhor performance
- **Otimização de Imagens**: Next.js Image component
- **Bundle Splitting**: Código dividido automaticamente

## 🚀 Próximas Funcionalidades

- [ ] Exportação de dados (CSV, PDF)
- [ ] Filtros por data e campanha
- [ ] Comparação entre períodos
- [ ] Alertas e notificações
- [ ] Dashboard de administração
- [ ] Integração com Google Analytics
- [ ] Relatórios automáticos por email

## 📞 Suporte

Para dúvidas ou problemas:
- **Issues**: Abrir issue no repositório
- **Documentação**: README.md e comentários no código
- **API**: Verificar logs do Cloud Run

---

**Desenvolvido para o Sebrae/PR** 🚀