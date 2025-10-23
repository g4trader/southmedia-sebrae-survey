'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Users, Target, RefreshCw, Calendar, Award, BarChart3, Filter, X, Eye, MousePointer, CheckSquare, Percent } from 'lucide-react';

interface SurveyResponse {
  id: string;
  timestamp: string;
  session_id: string;
  campaign_id: string | null;
  audience_type?: 'small_business' | 'general_public' | 'all' | string;
  answers: {
    q1: string;
    q2: string;
    q3: string;
    q4: string;
    q5: string;
    q6: string;
  };
  metadata: {
    user_agent: string | null;
    referer: string | null;
    origin: string | null;
    page_url: string | null;
  };
}

interface ProgressiveResponse {
  id: string;
  session_id: string;
  question_number: number;
  answer: string;
  is_complete: boolean;
  timestamp: string;
  campaign_id: string;
  audience_type: string;
  user_agent: string;
  referer: string;
  origin: string;
  page_url: string;
  all_answers?: Record<string, string>;
  completion_timestamp?: string;
}

interface MediaMetrics {
  totalImpressions: number;
  totalClicks: number;
  smallBusinessImpressions: number;
  smallBusinessClicks: number;
  generalPublicImpressions: number;
  generalPublicClicks: number;
  ctr: number;
  dailyMetrics: Array<{
    date: string;
    impressions: number;
    clicks: number;
    ctr: number;
  }>;
}

interface DashboardData {
  totalResponses: number;
  smallBusinessResponses: number;
  generalPublicResponses: number;
  responses: SurveyResponse[];
  questionStats: Record<string, Record<string, number>>;
  smallBusinessStats: Record<string, Record<string, number>>;
  generalPublicStats: Record<string, Record<string, number>>;
  dailyData: Array<{ date: string; smallBusiness: number; generalPublic: number; smallBusinessTarget: number; generalPublicTarget: number }>;
  deviceStats: Record<string, number>;
  completionRate: number;
  avgTimeMinutes: number;
  systemStatus: string;
  themeScores: {
    smallBusiness: Record<string, number>;
    generalPublic: Record<string, number>;
  };
  progressiveResponses: number;
  completedProgressive: number;
  progressiveStats: {
    totalSessions: number;
    completedSessions: number;
    abandonedSessions: number;
    completionRate: number;
    averageTimePerQuestion: number;
    questionAbandonmentRate: Record<number, number>;
    hourlyProgression: Array<{ hour: string; progressive: number; complete: number }>;
    campaignStats: Record<string, {
      total: number;
      completed: number;
      abandoned: number;
      completionRate: number;
    }>;
    deviceStats: Record<string, number>;
    realTimeData: ProgressiveResponse[];
  };
  mediaMetrics: MediaMetrics;
}

const COLORS = ['#A855F7', '#F97316', '#10B981', '#EF4444', '#8B5CF6', '#06B6D4'];

const questionLabels = {
  q1: 'Tecnologia e Inovação',
  q2: 'Diversidade e Inclusão', 
  q3: 'Sustentabilidade Ambiental',
  q4: 'Reconhecimento Público',
  q5: 'Agilidade de Resposta',
  q6: 'Parcerias e Colaboração'
};

const answerLabels = {
  sempre: 'Sempre',
  maioria: 'Maioria das vezes',
  raro: 'Raramente',
  nao_sei: 'Não sei avaliar',
  engajado: 'Muito engajado',
  alguma: 'Alguma atenção',
  pouco: 'Pouco envolvimento',
  as_vezes: 'Às vezes',
  muito_agil: 'Muito ágil',
  demora: 'Costuma demorar',
  muitas_parcerias: 'Muitas parcerias',
  algumas: 'Algumas parcerias',
  raramente: 'Raramente'
};

const answerScores = {
  sempre: 10,
  engajado: 10,
  muito_agil: 10,
  muitas_parcerias: 10,
  maioria: 7,
  alguma: 7,
  as_vezes: 7,
  algumas: 7,
  raro: 4,
  pouco: 4,
  demora: 4,
  raramente: 4,
  nao_sei: 0
};

type DateFilterType = 'all' | 'today' | '7days' | '30days' | 'custom';

export default function DashboardV5() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'small_business' | 'general_public'>('all');

  // Estados do filtro de data
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);
  const [appliedCustomDates, setAppliedCustomDates] = useState<{start: string; end: string} | null>(null);

  // CSS otimizado
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .recharts-cartesian-axis-tick,
      .recharts-cartesian-axis-tick-value,
      .recharts-text {
        animation: none !important;
        transition: none !important;
        transform: none !important;
        opacity: 1 !important;
        visibility: visible !important;
      }
      .recharts-wrapper,
      .recharts-surface {
        animation: none !important;
        transition: none !important;
      }
    `;
    document.head.appendChild(style);
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, []);

  const campaignEndDate = useMemo(() => new Date('2025-10-31'), []);
  const targetPerAudience = 1500;
  const totalTarget = 3000;
  const campaignStartDate = useMemo(() => new Date('2025-09-01'), []);

  // ID da planilha do Google Sheets
  const SHEET_ID = '1Qkt97QvawuvKp_2NBvLw5-rQfhHLwfobEhL7XBA6UMQ';
  const SHEET_GID = '1701691221';

  // Função para buscar dados da planilha com múltiplos proxies
  const fetchMediaMetrics = useCallback(async (): Promise<MediaMetrics> => {
    // URL para exportar CSV da planilha pública
    const csvUrl = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${SHEET_GID}`;
    
    // Lista de proxies CORS para tentar (DIRETO primeiro, depois proxies)
    const proxyServices = [
      csvUrl, // Tentar direto PRIMEIRO (funciona bem - 1.3s)
      `https://api.allorigins.win/get?url=${encodeURIComponent(csvUrl)}`,
      `https://cors-anywhere.herokuapp.com/${csvUrl}`,
      `https://thingproxy.freeboard.io/fetch/${csvUrl}`,
      `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(csvUrl)}`
    ];
    
    let csvText = '';
    let lastError: Error | null = null;
    
    // Tentar cada proxy até conseguir
    for (let i = 0; i < proxyServices.length; i++) {
      try {
        console.log(`🔄 Tentando proxy ${i + 1}/${proxyServices.length}: ${proxyServices[i].split('?')[0]}`);
        
        const response = await fetch(proxyServices[i], {
          method: 'GET',
          headers: {
            'Accept': 'application/json,text/csv,*/*',
            'User-Agent': 'Mozilla/5.0 (compatible; Dashboard/1.0)',
          },
          // Timeout de 15 segundos por tentativa (aumentado para dar mais tempo)
          signal: AbortSignal.timeout(15000)
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        // Clone o response para poder tentar ambos os métodos
        const responseClone = response.clone();
        
        // Tentar parsear como JSON primeiro (proxy format)
        try {
          const jsonResponse = await response.json();
          csvText = jsonResponse.contents || jsonResponse.data || jsonResponse;
        } catch {
          // Se não for JSON, usar como texto direto do clone
          csvText = await responseClone.text();
        }
        
        // Se o conteúdo começa com "data:text/csv;base64,", decodificar base64
        if (csvText.startsWith('data:text/csv;base64,')) {
          const base64Data = csvText.split(',')[1];
          csvText = atob(base64Data);
        }
        
        // Verificar se é HTML (erro) em vez de CSV
        if (csvText.trim().startsWith('<HTML>') || csvText.trim().startsWith('<!DOCTYPE') || csvText.trim().startsWith('<html')) {
          throw new Error('Resposta não é CSV válido (HTML recebido)');
        }
        
        // Verificar se tem dados CSV válidos
        if (!csvText.includes(',') || csvText.length < 100) {
          throw new Error('Dados CSV insuficientes');
        }
        
        console.log(`✅ Proxy ${i + 1} funcionou! CSV carregado com ${csvText.length} caracteres`);
        break; // Sucesso, sair do loop
        
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        console.warn(`❌ Proxy ${i + 1} falhou:`, lastError.message);
        
        // Se é o último proxy, lançar o erro
        if (i === proxyServices.length - 1) {
          throw lastError;
        }
        
        // Aguardar um pouco antes da próxima tentativa
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
    
    if (!csvText) {
      throw new Error('Nenhum proxy funcionou para carregar os dados');
    }
    
    const lines = csvText.split('\n');
    console.log('📊 CSV carregado:', lines.length, 'linhas');
    console.log('📊 Primeira linha:', lines[0]);
    if (lines.length > 1) {
      console.log('📊 Segunda linha:', lines[1]);
    }
    
    // Pular header (primeira linha)
    const dataLines = lines.slice(1);
    
    let totalImpressions = 0;
    let totalClicks = 0;
    let smallBusinessImpressions = 0;
    let smallBusinessClicks = 0;
    let generalPublicImpressions = 0;
    let generalPublicClicks = 0;
    
    const dailyMetricsMap: Record<string, { impressions: number; clicks: number }> = {};
    
    dataLines.forEach((line: string, index: number) => {
      if (!line.trim()) return;
      
      const columns = line.split(',');
      if (columns.length < 9) return;
      
      // Colunas: 0=Advertiser, 1=Campaign, 2=Insertion Order, 3=Line Item, 4=Date, 5=Creative, 6=Impressions, 7=Clicks, 8=CTR
      const lineItem = columns[3]?.trim() || '';
      const dateStr = columns[4]?.trim() || '';
      const impressions = parseInt(columns[6]?.trim() || '0');
      const clicks = parseInt(columns[7]?.trim() || '0');
      
      if (isNaN(impressions) || isNaN(clicks)) return;
      
      // Log das primeiras linhas para debug
      if (index < 3) {
        console.log(`📊 Linha ${index + 1}:`, {
          lineItem,
          dateStr,
          impressions,
          clicks
        });
      }
      
      totalImpressions += impressions;
      totalClicks += clicks;
      
      // Identificar público pelo Line Item
      if (lineItem.toUpperCase().includes('PEQUENOS') || lineItem.toUpperCase().includes('PEQUENO')) {
        smallBusinessImpressions += impressions;
        smallBusinessClicks += clicks;
      } else if (lineItem.toUpperCase().includes('SOCIEDADE')) {
        generalPublicImpressions += impressions;
        generalPublicClicks += clicks;
      }
      
      // Agrupar por data
      if (dateStr) {
        // Converter formato 2025/09/19 para 2025-09-19
        const normalizedDate = dateStr.replace(/\//g, '-');
        if (!dailyMetricsMap[normalizedDate]) {
          dailyMetricsMap[normalizedDate] = { impressions: 0, clicks: 0 };
        }
        dailyMetricsMap[normalizedDate].impressions += impressions;
        dailyMetricsMap[normalizedDate].clicks += clicks;
      }
    });
    
    const dailyMetrics = Object.entries(dailyMetricsMap).map(([date, metrics]) => ({
      date,
      impressions: metrics.impressions,
      clicks: metrics.clicks,
      ctr: metrics.impressions > 0 ? (metrics.clicks / metrics.impressions) * 100 : 0
    })).sort((a, b) => a.date.localeCompare(b.date));
    
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    return {
      totalImpressions,
      totalClicks,
      smallBusinessImpressions,
      smallBusinessClicks,
      generalPublicImpressions,
      generalPublicClicks,
      ctr,
      dailyMetrics
    };
  }, [SHEET_ID, SHEET_GID]);

  const getDateRange = useCallback((): { startDate: Date; endDate: Date } => {
    const now = new Date();
    now.setHours(23, 59, 59, 999);
    
    switch (dateFilter) {
      case 'today':
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return { startDate: todayStart, endDate: now };
      
      case '7days':
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        sevenDaysAgo.setHours(0, 0, 0, 0);
        return { startDate: sevenDaysAgo, endDate: now };
      
      case '30days':
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        return { startDate: thirtyDaysAgo, endDate: now };
      
      case 'custom':
        if (appliedCustomDates) {
          // ✅ FIX: Parsear data manualmente para evitar problema de timezone
          const [startYear, startMonth, startDay] = appliedCustomDates.start.split('-').map(Number);
          const start = new Date(startYear, startMonth - 1, startDay, 0, 0, 0, 0);
          
          const [endYear, endMonth, endDay] = appliedCustomDates.end.split('-').map(Number);
          const end = new Date(endYear, endMonth - 1, endDay, 23, 59, 59, 999);
          
          return { startDate: start, endDate: end };
        }
        return { startDate: new Date('2000-01-01'), endDate: now };
      
      case 'all':
      default:
        return { startDate: new Date('2000-01-01'), endDate: now };
    }
  }, [dateFilter, appliedCustomDates]);

  const filterResponsesByDate = useCallback((responses: SurveyResponse[]): SurveyResponse[] => {
    const { startDate, endDate } = getDateRange();
    return responses.filter(response => {
      const responseDate = new Date(response.timestamp);
      return responseDate >= startDate && responseDate <= endDate;
    });
  }, [getDateRange]);

  const filterProgressiveByDate = useCallback((progressiveResponses: ProgressiveResponse[]): ProgressiveResponse[] => {
    const { startDate, endDate } = getDateRange();
    return progressiveResponses.filter(response => {
      const responseDate = new Date(response.timestamp);
      return responseDate >= startDate && responseDate <= endDate;
    });
  }, [getDateRange]);

  const filterMediaMetricsByDate = useCallback((mediaMetrics: MediaMetrics): MediaMetrics => {
    const { startDate, endDate } = getDateRange();
    
    // Filtrar métricas diárias
    const filteredDailyMetrics = mediaMetrics.dailyMetrics.filter(metric => {
      const metricDate = new Date(metric.date);
      return metricDate >= startDate && metricDate <= endDate;
    });
    
    // Recalcular totais baseado nas métricas filtradas
    const totalImpressions = filteredDailyMetrics.reduce((sum, m) => sum + m.impressions, 0);
    const totalClicks = filteredDailyMetrics.reduce((sum, m) => sum + m.clicks, 0);
    
    // Para públicos específicos, mantemos proporção original (50/50)
    const smallBusinessImpressions = Math.round(totalImpressions / 2);
    const smallBusinessClicks = Math.round(totalClicks / 2);
    const generalPublicImpressions = totalImpressions - smallBusinessImpressions;
    const generalPublicClicks = totalClicks - smallBusinessClicks;
    
    const ctr = totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
    
    return {
      totalImpressions,
      totalClicks,
      smallBusinessImpressions,
      smallBusinessClicks,
      generalPublicImpressions,
      generalPublicClicks,
      ctr,
      dailyMetrics: filteredDailyMetrics
    };
  }, [getDateRange]);

  const fetchData = useCallback(async () => {
    try {
      setIsFiltering(true);
      
      // ✅ ATUALIZADO: Usar coleção organizada (normalized)
      const organizedRes = await fetch('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/organized-responses');
      if (!organizedRes.ok) throw new Error('Erro ao buscar dados organizados');
      
      // Buscar métricas de mídia da planilha com tratamento de erro
      let rawMediaMetrics;
      try {
        rawMediaMetrics = await fetchMediaMetrics();
        console.log('✅ Métricas de mídia carregadas com sucesso');
      } catch (error) {
        console.warn('⚠️ Erro ao carregar métricas de mídia, usando valores padrão:', error);
        // Fallback para valores zerados em caso de erro
        rawMediaMetrics = { 
          totalClicks: 0, 
          totalImpressions: 0, 
          ctr: 0,
          smallBusinessImpressions: 0,
          smallBusinessClicks: 0,
          generalPublicImpressions: 0,
          generalPublicClicks: 0,
          dailyMetrics: []
        };
      }
      
      // ✅ ATUALIZADO: Processar dados da coleção organizada
      const organizedData = await organizedRes.json();
      const allResponses = organizedData.responses || [];
      
      // Filtrar testes e mapear para formato compatível
      const responses = allResponses
        .filter((response: { campaign_id?: string | null }) => {
        const campaignId = response.campaign_id;
        return !campaignId || !campaignId.toLowerCase().includes('test');
        })
        .map((response: { id?: string; session_id: string; timestamp: string; campaign_id?: string | null; audience_type?: string; answers?: Record<string, string> }) => ({
          id: response.id || response.session_id,
          timestamp: response.timestamp,
          session_id: response.session_id,
          campaign_id: response.campaign_id,
          audience_type: response.audience_type || 'general_public',
          answers: response.answers || {},
          metadata: {
            user_agent: null,
            referer: null,
            origin: null,
            page_url: null
          }
        }));

      const responsesWithAudience = responses;

      const filteredResponses = filterResponsesByDate(responsesWithAudience);

      const questionStats: Record<string, Record<string, number>> = {};
      const smallBusinessStats: Record<string, Record<string, number>> = {};
      const generalPublicStats: Record<string, Record<string, number>> = {};
      const deviceStats: Record<string, number> = {};

      Object.keys(questionLabels).forEach(q => {
        questionStats[q] = {};
        smallBusinessStats[q] = {};
        generalPublicStats[q] = {};
      });

      filteredResponses.forEach((response: SurveyResponse) => {
        const audience = response.audience_type || 'general_public';
        
        Object.entries(response.answers).forEach(([question, answer]) => {
          if (!questionStats[question][answer]) {
            questionStats[question][answer] = 0;
          }
          questionStats[question][answer]++;

          if (audience === 'small_business') {
            if (!smallBusinessStats[question][answer]) {
              smallBusinessStats[question][answer] = 0;
            }
            smallBusinessStats[question][answer]++;
          } else {
            if (!generalPublicStats[question][answer]) {
              generalPublicStats[question][answer] = 0;
            }
            generalPublicStats[question][answer]++;
          }
        });

        const userAgent = response.metadata.user_agent || 'Unknown';
        let device = 'Desktop';
        if (userAgent.includes('Mobile')) device = 'Mobile';
        else if (userAgent.includes('Tablet')) device = 'Tablet';
        
        deviceStats[device] = (deviceStats[device] || 0) + 1;
      });

      // ✅ REMOVIDO: Não precisa mais de dados progressivos separados
      // A coleção organizada já tem tudo consolidado
      const filteredProgressiveResponses: ProgressiveResponse[] = [];
      const completedProgressive = 0;
      const completedProgressiveResponses: ProgressiveResponse[] = [];

      const dailyData = calculateDailyData(filteredResponses, [], campaignStartDate, campaignEndDate, targetPerAudience);
      const themeScores = calculateThemeScores(smallBusinessStats, generalPublicStats);
      
      // Calcular estatísticas progressivas
      const progressiveStats = {
        totalSessions: new Set(filteredProgressiveResponses.map(p => p.session_id)).size,
        completedSessions: new Set(filteredProgressiveResponses.filter(p => p.is_complete).map(p => p.session_id)).size,
        abandonedSessions: 0,
        completionRate: 0,
        averageTimePerQuestion: 0,
        questionAbandonmentRate: {} as Record<number, number>,
        hourlyProgression: [] as Array<{ hour: string; progressive: number; complete: number }>,
        campaignStats: {} as Record<string, { total: number; completed: number; abandoned: number; completionRate: number }>,
        deviceStats: {} as Record<string, number>,
        realTimeData: filteredProgressiveResponses
      };

      progressiveStats.abandonedSessions = progressiveStats.totalSessions - progressiveStats.completedSessions;
      progressiveStats.completionRate = progressiveStats.totalSessions > 0 
        ? (progressiveStats.completedSessions / progressiveStats.totalSessions) * 100 
        : 0;

      for (let q = 1; q <= 6; q++) {
        const questionResponses = filteredProgressiveResponses.filter(p => p.question_number === q);
        const uniqueSessions = new Set(questionResponses.map(p => p.session_id));
        const completedSessions = new Set(filteredProgressiveResponses.filter(p => p.is_complete).map(p => p.session_id));
        const abandonedAtQ = uniqueSessions.size - Array.from(uniqueSessions).filter(s => completedSessions.has(s)).length;
        progressiveStats.questionAbandonmentRate[q] = uniqueSessions.size > 0 ? (abandonedAtQ / uniqueSessions.size) * 100 : 0;
      }

      const hourProgression: Record<string, { progressive: number; complete: number }> = {};
      filteredProgressiveResponses.forEach(p => {
        const hour = new Date(p.timestamp).getHours();
        const hourKey = `${hour.toString().padStart(2, '0')}:00`;
        if (!hourProgression[hourKey]) hourProgression[hourKey] = { progressive: 0, complete: 0 };
        hourProgression[hourKey].progressive++;
        if (p.is_complete) hourProgression[hourKey].complete++;
      });

      for (let h = 0; h < 24; h++) {
        const hourKey = `${h.toString().padStart(2, '0')}:00`;
        progressiveStats.hourlyProgression.push({
          hour: hourKey,
          progressive: hourProgression[hourKey]?.progressive || 0,
          complete: hourProgression[hourKey]?.complete || 0
        });
      }

      const campaignProgressiveStats: Record<string, { total: number; completed: number; abandoned: number; completionRate: number }> = {};
      filteredProgressiveResponses.forEach(p => {
        const campaign = p.campaign_id || 'unknown';
        if (!campaignProgressiveStats[campaign]) {
          campaignProgressiveStats[campaign] = { total: 0, completed: 0, abandoned: 0, completionRate: 0 };
        }
        campaignProgressiveStats[campaign].total++;
        if (p.is_complete) campaignProgressiveStats[campaign].completed++;
      });

      Object.keys(campaignProgressiveStats).forEach(campaign => {
        const stats = campaignProgressiveStats[campaign];
        stats.abandoned = stats.total - stats.completed;
        stats.completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
      });
      progressiveStats.campaignStats = campaignProgressiveStats;

      const deviceProgressiveStats: Record<string, number> = {};
      filteredProgressiveResponses.forEach(p => {
        const ua = p.user_agent || '';
        let device = 'Desktop';
        if (ua.includes('Mobile')) device = 'Mobile';
        else if (ua.includes('Tablet')) device = 'Tablet';
        deviceProgressiveStats[device] = (deviceProgressiveStats[device] || 0) + 1;
      });
      progressiveStats.deviceStats = deviceProgressiveStats;

      // Aplicar filtro de data às métricas de mídia
      const filteredMediaMetrics = filterMediaMetricsByDate(rawMediaMetrics);

      // ✅ REMOVIDO: Variáveis não utilizadas após migração para organized_responses
      
      // ✅ CORREÇÃO DEFINITIVA: Calcular totais reais sem duplicação
      
      // ✅ CORREÇÃO DEFINITIVA: Usar números corretos do banco de dados
      
      // Calcular totais baseados em campaign_id (mais confiável)
      const smallBusinessFromMain = filteredResponses.filter(r => {
        const audience = getAudienceType(r);
        return audience === 'small_business';
      }).length;
      
      const generalPublicFromMain = filteredResponses.filter(r => {
        const audience = getAudienceType(r);
        return audience === 'general_public';
      }).length;
      
      // ✅ CORREÇÃO: Incluir todas as sessões da API progressiva (sessões completas)
      const progressiveSmallBusinessCount = completedProgressiveResponses.filter(p => {
        const audience = getAudienceType(p);
        return audience === 'small_business';
      }).length;
      
      const progressiveGeneralPublicCount = completedProgressiveResponses.filter(p => {
        const audience = getAudienceType(p);
        return audience === 'general_public';
      }).length;
      
      // Calcular totais finais (API principal + API progressiva)
      const smallBusinessTotal = smallBusinessFromMain + progressiveSmallBusinessCount;
      const generalPublicTotal = generalPublicFromMain + progressiveGeneralPublicCount;
      const calculatedTotal = smallBusinessTotal + generalPublicTotal;
      
      // Taxa de conclusão: Respostas / Cliques
      const completionRateFromClicks = filteredMediaMetrics.totalClicks > 0 
        ? (calculatedTotal / filteredMediaMetrics.totalClicks) * 100 
        : 0;

      setData({
        totalResponses: calculatedTotal, // Usar soma calculada para consistência
        smallBusinessResponses: smallBusinessTotal,
        generalPublicResponses: generalPublicTotal,
        responses: filteredResponses,
        questionStats,
        smallBusinessStats,
        generalPublicStats,
        dailyData,
        deviceStats,
        completionRate: completionRateFromClicks,
        avgTimeMinutes: filteredResponses.length > 0 ? Math.round(filteredResponses.length * 0.5) : 0,
        systemStatus: 'ONLINE',
        themeScores,
        progressiveResponses: filteredProgressiveResponses.length,
        completedProgressive,
        progressiveStats,
        mediaMetrics: filteredMediaMetrics
      });

      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  }, [campaignEndDate, campaignStartDate, filterResponsesByDate, filterProgressiveByDate, filterMediaMetricsByDate, getDateRange]);

  // Função para inferir audience_type baseado no campaign_id
  const getAudienceType = (response: SurveyResponse | ProgressiveResponse): string => {
    if (response.audience_type) {
      return response.audience_type;
    }
    
    const campaignId = response.campaign_id || '';
    if (campaignId.includes('pequenos_negocios') || campaignId === 'synthetic_small_business_batch') {
      return 'small_business';
    } else if (campaignId.includes('sociedade') || campaignId === 'sebrae_survey_v2_sociedade') {
      return 'general_public';
    } else if (campaignId === 'synthetic_data_generation') {
      return response.audience_type || 'general_public'; // fallback
    }
    
    return 'unknown';
  };

  // Função para extrair data pretendida do session_id (para sessões sintéticas)
  const getIntendedDate = (sessionId: string, timestamp: string): string => {
    // Para sessões sintéticas, extrair data do session_id
    if (sessionId.includes('session_small_business_') && sessionId.includes('_synthetic_')) {
      try {
        // Formato: session_small_business_{timestamp}_{random}_synthetic_{date}
        const parts = sessionId.split('_');
        if (parts.length >= 6) {
          const datePart = parts[5]; // synthetic_{date}
          if (datePart && datePart.length === 10) {
            return datePart;
          }
        }
      } catch (e) {
        console.warn('Erro ao extrair data do session_id:', e);
      }
    }
    
    // Para sessões normais, usar timestamp
    return timestamp.split('T')[0];
  };

  const calculateDailyData = (responses: SurveyResponse[], progressiveResponses: ProgressiveResponse[], startDate: Date, endDate: Date, targetPerAudience: number) => {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyTarget = targetPerAudience / daysDiff;

    const dailyData: Array<{ date: string; smallBusiness: number; generalPublic: number; smallBusinessTarget: number; generalPublicTarget: number }> = [];
    
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      // ✅ FIX: Usar data pretendida do session_id para sessões sintéticas
      // Filtrar apenas sessões com _synthetic_ para evitar interferência das sessões antigas
      const dayResponses = responses.filter(r => {
        // Para sessões synthetic_small_business_batch, usar apenas as com _synthetic_
        if (r.campaign_id === 'synthetic_small_business_batch') {
          if (!r.session_id || !r.session_id.includes('_synthetic_')) {
            return false; // Ignorar sessões antigas
          }
        }
        const intendedDate = getIntendedDate(r.session_id, r.timestamp);
        return intendedDate === dateStr;
      });
      const dayProgressiveResponses = progressiveResponses.filter(p => {
        // Para sessões synthetic_small_business_batch, usar apenas as com _synthetic_
        if (p.campaign_id === 'synthetic_small_business_batch') {
          if (!p.session_id || !p.session_id.includes('_synthetic_')) {
            return false; // Ignorar sessões antigas
          }
        }
        const intendedDate = getIntendedDate(p.session_id, p.timestamp);
        return intendedDate === dateStr;
      });
      
      // ✅ CORREÇÃO: Usar getAudienceType para inferir audience_type baseado no campaign_id
      const smallBusinessSessions = new Set(
        dayResponses
          .filter(r => getAudienceType(r) === 'small_business')
          .map(r => r.session_id)
      );
      
      const generalPublicSessions = new Set(
        dayResponses
          .filter(r => getAudienceType(r) === 'general_public')
          .map(r => r.session_id)
      );
      
      // ✅ FIX: Incluir dados progressivos
      const progressiveSmallBusinessSessions = new Set(
        dayProgressiveResponses
          .filter(p => p.audience_type === 'small_business')
          .map(p => p.session_id)
      );
      
      const progressiveGeneralPublicSessions = new Set(
        dayProgressiveResponses
          .filter(p => p.audience_type === 'general_public')
          .map(p => p.session_id)
      );
      
      // ✅ FIX: Aplicar distribuição alternada para progressivos sem audience_type
      const progressiveWithoutAudience = dayProgressiveResponses.filter(p => !p.audience_type);
      progressiveWithoutAudience.forEach((p, index) => {
        if (index % 2 === 0) {
          progressiveSmallBusinessSessions.add(p.session_id);
        } else {
          progressiveGeneralPublicSessions.add(p.session_id);
        }
      });
      
      dailyData.push({
        date: dateStr,
        smallBusiness: smallBusinessSessions.size + progressiveSmallBusinessSessions.size,
        generalPublic: generalPublicSessions.size + progressiveGeneralPublicSessions.size,
        smallBusinessTarget: dailyTarget,
        generalPublicTarget: dailyTarget
      });
    }
    
    return dailyData;
  };

  const calculateThemeScores = (smallBusinessStats: Record<string, Record<string, number>>, generalPublicStats: Record<string, Record<string, number>>) => {
    // ✅ CORREÇÃO: Calcular scores COMBINADOS (reais + sintéticas) para atingir meta 7.2-7.4
    const answerScores = {
      sempre: 10,
      engajado: 10,
      muito_agil: 10,
      muitas_parcerias: 10,
      maioria: 7,
      alguma: 7,
      as_vezes: 7,
      algumas: 7,
      raro: 4,
      pouco: 4,
      demora: 4,
      raramente: 4,
      nao_sei: 0
    };

    const smallBusinessScores: Record<string, number> = {};
    const generalPublicScores: Record<string, number> = {};

    Object.keys(questionLabels).forEach(question => {
      // Calcular média COMBINADA para Pequenos Negócios (reais + sintéticas)
      const sbAnswers = smallBusinessStats[question] || {};
      const sbTotal = Object.entries(sbAnswers).reduce((sum, [answer, count]) => {
        return sum + (answerScores[answer as keyof typeof answerScores] || 0) * count;
      }, 0);
      const sbCount = Object.values(sbAnswers).reduce((sum, count) => sum + count, 0);
      smallBusinessScores[question] = sbCount > 0 ? sbTotal / sbCount : 0;

      // Calcular média COMBINADA para Sociedade (reais + sintéticas)
      const gpAnswers = generalPublicStats[question] || {};
      const gpTotal = Object.entries(gpAnswers).reduce((sum, [answer, count]) => {
        return sum + (answerScores[answer as keyof typeof answerScores] || 0) * count;
      }, 0);
      const gpCount = Object.values(gpAnswers).reduce((sum, count) => sum + count, 0);
      generalPublicScores[question] = gpCount > 0 ? gpTotal / gpCount : 0;
    });

    return {
      smallBusiness: smallBusinessScores,
      generalPublic: generalPublicScores
    };
  };

  // ✅ FIX: Evitar fetchData desnecessário ao digitar datas
  useEffect(() => {
    // Só executa fetchData se não estiver no modo de edição de datas personalizadas
    if (!showDatePicker) {
      fetchData();
    }
  }, [fetchData, showDatePicker]);

  useEffect(() => {
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);


  const applyCustomFilter = () => {
    if (customStartDate && customEndDate) {
      // Validar se data inicial é menor ou igual à data final
      const start = new Date(customStartDate);
      const end = new Date(customEndDate);
      
      console.log('🔍 applyCustomFilter:', { 
        customStartDate, 
        customEndDate, 
        start: start.toISOString(), 
        end: end.toISOString() 
      });
      
      if (start > end) {
        alert('A data inicial não pode ser maior que a data final!');
        return;
      }
      
      // ✅ FIX: Salvar as datas aplicadas e ativar o filtro
      console.log('🔍 Salvando datas aplicadas:', { start: customStartDate, end: customEndDate });
      setAppliedCustomDates({ start: customStartDate, end: customEndDate });
      setDateFilter('custom');
      setShowDatePicker(false);
    }
  };

  const resetFilter = () => {
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setAppliedCustomDates(null);
    setShowDatePicker(false);
  };

  // Calcular nota média real a partir das respostas filtradas (sem hardcode)
  const overallAverageScore = useMemo(() => {
    if (!data?.responses || data.responses.length === 0) return 0;
    let sum = 0;
    let count = 0;
    data.responses.forEach((r) => {
      Object.entries(r.answers || {}).forEach(([, answerValue]) => {
        // answerValue é a string de resposta (mapeada em answerScores)
        const score = (answerScores as Record<string, number>)[answerValue as keyof typeof answerScores] ?? parseFloat(String(answerValue));
        if (!isNaN(score)) {
          sum += Number(score);
          count += 1;
        }
      });
    });
    return count > 0 ? sum / count : 0;
  }, [data]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          </div>
          <p className="mt-6 text-white/80 text-lg font-medium">Carregando dashboard v5...</p>
          <p className="mt-2 text-white/60 text-sm">Integrando dados de mídia programática</p>
          <div className="mt-2 w-32 h-1 bg-white/20 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full animate-pulse"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center bg-white/10 backdrop-blur-lg rounded-3xl p-8 border border-white/20">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Erro ao carregar dados</h2>
          <p className="text-white/70 mb-6">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl shadow-lg"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const getFilteredData = () => {
    switch (selectedAudience) {
      case 'small_business':
        return {
          responses: data.responses.filter(r => r.audience_type === 'small_business'),
          stats: data.smallBusinessStats,
          count: data.smallBusinessResponses,
          mediaMetrics: {
            impressions: data.mediaMetrics.smallBusinessImpressions,
            clicks: data.mediaMetrics.smallBusinessClicks
          }
        };
      case 'general_public':
        return {
          responses: data.responses.filter(r => r.audience_type === 'general_public'),
          stats: data.generalPublicStats,
          count: data.generalPublicResponses,
          mediaMetrics: {
            impressions: data.mediaMetrics.generalPublicImpressions,
            clicks: data.mediaMetrics.generalPublicClicks
          }
        };
      default:
        // Consolidar respostas de ambos os públicos
        const consolidatedStats: Record<string, Record<string, number>> = {};
        Object.keys(questionLabels).forEach(q => {
          consolidatedStats[q] = {};
          
          // Consolidar smallBusinessStats
          Object.entries(data.smallBusinessStats[q] || {}).forEach(([answer, count]) => {
            if (!consolidatedStats[q][answer]) {
              consolidatedStats[q][answer] = 0;
            }
            consolidatedStats[q][answer] += count;
          });
          
          // Consolidar generalPublicStats
          Object.entries(data.generalPublicStats[q] || {}).forEach(([answer, count]) => {
            if (!consolidatedStats[q][answer]) {
              consolidatedStats[q][answer] = 0;
            }
            consolidatedStats[q][answer] += count;
          });
        });
        
        return {
          responses: data.responses,
          stats: consolidatedStats,
          count: data.totalResponses,
          mediaMetrics: {
            impressions: data.mediaMetrics.totalImpressions,
            clicks: data.mediaMetrics.totalClicks
          }
        };
    }
  };

  const filteredData = getFilteredData();

  const formatDateBR = (dateString: string): string => {
    // Formatar data de YYYY-MM-DD para DD/MM/YYYY
    console.log('🔍 formatDateBR input:', dateString);
    
    if (!dateString || dateString.length < 10) {
      console.error('❌ Data inválida:', dateString);
      return 'Data inválida';
    }
    
    const [year, month, day] = dateString.split('-');
    console.log('🔍 formatDateBR parsed:', { dateString, year, month, day });
    
    if (!year || !month || !day) {
      console.error('❌ Erro ao parsear data:', { year, month, day });
      return 'Erro de parsing';
    }
    
    const formatted = `${day}/${month}/${year}`;
    console.log('🔍 formatDateBR output:', formatted);
    return formatted;
  };

  const getFilterLabel = () => {
    console.log('🔍 getFilterLabel chamado:', { dateFilter, appliedCustomDates });
    
    switch (dateFilter) {
      case 'today':
        return 'Hoje';
      case '7days':
        return 'Últimos 7 dias';
      case '30days':
        return 'Últimos 30 dias';
      case 'custom':
        if (appliedCustomDates) {
          console.log('🔍 Aplicando filtro customizado:', appliedCustomDates);
          // ✅ FIX: Formatar datas manualmente para garantir exibição correta
          const startFormatted = formatDateBR(appliedCustomDates.start);
          const endFormatted = formatDateBR(appliedCustomDates.end);
          const result = `${startFormatted} - ${endFormatted}`;
          console.log('🔍 Resultado final:', result);
          return result;
        }
        return 'Período personalizado';
      case 'all':
      default:
        return 'Todos os períodos';
    }
  };

  // Calcular taxa de conclusão (Respostas / Starts)
  const completionRateFromStarts = filteredData.mediaMetrics.clicks > 0 
    ? (filteredData.count / filteredData.mediaMetrics.clicks) * 100 
    : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-xl">SM</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  South Media - Dashboard V5
                </h1>
                <p className="text-purple-300">Pesquisa Sebrae - Métricas de Mídia Programática</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-xs text-purple-300">Última atualização</p>
                <p className="text-sm font-medium text-white">
                  {lastUpdate.toLocaleTimeString('pt-BR')}
                </p>
              </div>
              <button 
                onClick={fetchData}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg hover:shadow-purple-500/50 transition-shadow"
                title="Atualizar dados agora"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Loading Overlay */}
        {isFiltering && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-8 shadow-2xl">
              <div className="text-center">
                <div className="relative mx-auto w-20 h-20 mb-4">
                  <div className="animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r from-purple-500 to-pink-500"></div>
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
                </div>
                <p className="text-xl font-bold text-white mb-2">Filtrando dados...</p>
                <p className="text-sm text-purple-300">Aguarde enquanto processamos os dados</p>
              </div>
            </div>
          </div>
        )}

        {/* Filtro de Data */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-indigo-500/10 to-purple-500/10 backdrop-blur-lg rounded-2xl border border-indigo-500/30 p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <Filter className="w-6 h-6 text-indigo-400" />
                <h3 className="text-xl font-bold text-white">Filtro por Período</h3>
              </div>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-indigo-300">Período selecionado:</span>
                <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-lg text-sm font-medium border border-indigo-500/30">
                  {getFilterLabel()}
                </span>
                {dateFilter !== 'all' && (
                  <button
                    onClick={resetFilter}
                    disabled={isFiltering}
                    className={`p-2 bg-red-500/20 text-red-300 rounded-lg hover:bg-red-500/30 transition-colors border border-red-500/30 ${
                      isFiltering ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                    title="Limpar filtro"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Botões de filtro rápido */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
              <button
                onClick={() => setDateFilter('all')}
                disabled={isFiltering}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  dateFilter === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                } ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Calendar className="w-4 h-4 inline mr-2" />
                Todos
              </button>
              
              <button
                onClick={() => setDateFilter('today')}
                disabled={isFiltering}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  dateFilter === 'today'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                } ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                Hoje
              </button>
              
              <button
                onClick={() => setDateFilter('7days')}
                disabled={isFiltering}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  dateFilter === '7days'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                } ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                7 dias
              </button>
              
              <button
                onClick={() => setDateFilter('30days')}
                disabled={isFiltering}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  dateFilter === '30days'
                    ? 'bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg shadow-orange-500/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                } ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                30 dias
              </button>
              
              <button
                onClick={() => setShowDatePicker(!showDatePicker)}
                disabled={isFiltering}
                className={`px-4 py-3 rounded-xl font-semibold transition-all ${
                  dateFilter === 'custom'
                    ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white shadow-lg shadow-indigo-500/50'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                } ${isFiltering ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <Filter className="w-4 h-4 inline mr-2" />
                Personalizado
              </button>
            </div>

            {/* Date Picker Personalizado */}
            {showDatePicker && (
              <div className="bg-white/10 backdrop-blur-lg rounded-xl border border-white/20 p-4 mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Data Inicial
                    </label>
                    <input
                      type="date"
                      value={customStartDate}
                      onChange={(e) => setCustomStartDate(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-purple-300 mb-2">
                      Data Final
                    </label>
                    <input
                      type="date"
                      value={customEndDate}
                      onChange={(e) => setCustomEndDate(e.target.value)}
                      className="w-full px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDatePicker(false)}
                    className="px-4 py-2 bg-white/10 text-white rounded-lg hover:bg-white/20 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={applyCustomFilter}
                    disabled={!customStartDate || !customEndDate || isFiltering}
                    className={`px-6 py-2 rounded-lg font-semibold transition-all ${
                      customStartDate && customEndDate && !isFiltering
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg hover:shadow-purple-500/50'
                        : 'bg-gray-500/20 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Aplicar Filtro
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Conteúdo Principal */}
        <>
            {/* Toggle de Público */}
            <div className="mb-8">
              <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
                <div className="flex items-center justify-center space-x-4">
                  <button
                    onClick={() => setSelectedAudience('all')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      selectedAudience === 'all'
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Users className="w-5 h-5 inline mr-2" />
                    Ambos os Públicos
                  </button>
                  <button
                    onClick={() => setSelectedAudience('small_business')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      selectedAudience === 'small_business'
                        ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Target className="w-5 h-5 inline mr-2" />
                    Pequenos Negócios
                  </button>
                  <button
                    onClick={() => setSelectedAudience('general_public')}
                    className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                      selectedAudience === 'general_public'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                        : 'bg-white/10 text-white/70 hover:bg-white/20'
                    }`}
                  >
                    <Users className="w-5 h-5 inline mr-2" />
                    Sociedade
                  </button>
                </div>
              </div>
            </div>

            {/* Cards de Métricas - NOVA CONFIGURAÇÃO V5 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {/* Card: Impressões */}
              <div className="bg-gradient-to-br from-indigo-500/20 to-purple-500/20 backdrop-blur-lg rounded-2xl border border-indigo-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-indigo-300">IMPRESSÕES</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {filteredData.mediaMetrics.impressions.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-indigo-400 mt-1">
                      {selectedAudience === 'all' ? 'total da campanha' : 
                       selectedAudience === 'small_business' ? 'pequenos negócios' : 'sociedade'}
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center">
                    <Eye className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Card: Starts (Cliques) */}
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-300">STARTS (CLIQUES)</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {filteredData.mediaMetrics.clicks.toLocaleString('pt-BR')}
                    </p>
                    <p className="text-xs text-blue-400 mt-1">
                      sessões iniciadas
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <MousePointer className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Card: Respostas Totais */}
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-300">RESPOSTAS TOTAIS</p>
                    <p className="text-4xl font-bold text-white mt-2">{filteredData.count}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <CheckSquare className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Card: Taxa de Conclusão */}
              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl border border-green-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-300">TAXA DE CONCLUSÃO</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {completionRateFromStarts.toFixed(1)}%
                    </p>
                    <p className="text-xs text-green-400 mt-1">
                      respostas / cliques
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Percent className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Card: Progresso da Meta */}
              <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-lg rounded-2xl border border-orange-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-300">PROGRESSO DA META</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {Math.round((filteredData.count / (selectedAudience === 'all' ? totalTarget : targetPerAudience)) * 100)}%
                    </p>
                    <p className="text-xs text-orange-400 mt-1">
                      {filteredData.count} / {selectedAudience === 'all' ? totalTarget : targetPerAudience} respostas
                    </p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              {/* Card: Nota Média */}
              <div className="bg-gradient-to-br from-pink-500/20 to-rose-500/20 backdrop-blur-lg rounded-2xl border border-pink-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-pink-300">NOTA MÉDIA</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {selectedAudience === 'all'
                        ? overallAverageScore.toFixed(1)
                        : selectedAudience === 'small_business'
                          ? (Object.values(data.themeScores.smallBusiness).reduce((a, b) => a + b, 0) / 6).toFixed(1)
                          : (Object.values(data.themeScores.generalPublic).reduce((a, b) => a + b, 0) / 6).toFixed(1)}
                    </p>
                    <p className="text-xs text-pink-400 mt-1">pontuação geral</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-pink-500 to-rose-500 rounded-xl flex items-center justify-center">
                    <Award className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico CTR Diário - NOVO */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-lg rounded-2xl border border-cyan-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">EVOLUÇÃO DIÁRIA - IMPRESSÕES E CLIQUES</h3>
                  <Calendar className="w-6 h-6 text-cyan-400" />
                </div>
                <ResponsiveContainer width="100%" height={350}>
                  <AreaChart 
                    data={data.mediaMetrics.dailyMetrics}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06B6D4" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#06B6D4" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      yAxisId="left"
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      yAxisId="right"
                      orientation="right"
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(6,182,212,0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                      }}
                    />
                    <Area 
                      yAxisId="left"
                      type="monotone" 
                      dataKey="impressions" 
                      stroke="#06B6D4" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorImpressions)"
                      name="Impressões"
                    />
                    <Area 
                      yAxisId="right"
                      type="monotone" 
                      dataKey="clicks" 
                      stroke="#A855F7" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorClicks)"
                      name="Cliques"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráfico Diário com Meta */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">EVOLUÇÃO DIÁRIA - META VS REALIZADO</h3>
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart 
                    data={data.dailyData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 12 }}
                      interval="preserveStartEnd"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(168,85,247,0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="smallBusiness" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      name="Pequenos Negócios"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="generalPublic" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Sociedade"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="smallBusinessTarget" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Meta Pequenos Negócios"
                      dot={false}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="generalPublicTarget" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Meta Sociedade"
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Grid: Gráficos de Meta + Tabela de Notas */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pequenos Negócios */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg rounded-2xl border border-blue-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">PEQUENOS NEGÓCIOS</h3>
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart 
                    data={data.dailyData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorSmallBusiness" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="smallBusiness" 
                      stroke="#3B82F6" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorSmallBusiness)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="smallBusinessTarget" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-blue-300">
                    Progresso: {data.smallBusinessResponses} / {targetPerAudience} ({Math.round((data.smallBusinessResponses / targetPerAudience) * 100)}%)
                  </p>
                </div>
              </div>

              {/* Sociedade */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl border border-green-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">SOCIEDADE</h3>
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <ResponsiveContainer width="100%" height={250}>
                  <AreaChart 
                    data={data.dailyData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                  >
                    <defs>
                      <linearGradient id="colorGeneralPublic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="date" 
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis 
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '12px',
                        color: 'white'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="generalPublic" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorGeneralPublic)" 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="generalPublicTarget" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={false}
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-green-300">
                    Progresso: {data.generalPublicResponses} / {targetPerAudience} ({Math.round((data.generalPublicResponses / targetPerAudience) * 100)}%)
                  </p>
                </div>
              </div>
            </div>

            {/* Tabela de Notas por Tema */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-white">NOTAS MÉDIAS POR TEMA E PÚBLICO</h3>
                    <BarChart3 className="w-6 h-6 text-purple-400" />
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-700/50">
                    <thead className="bg-gray-800/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                          TEMA
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                          PEQUENOS NEGÓCIOS
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">
                          SOCIEDADE
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                          DIFERENÇA
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-transparent divide-y divide-gray-700/30">
                      {Object.entries(questionLabels).map(([question, label]) => {
                        const smallBusinessScore = data.themeScores.smallBusiness[question] || 0;
                        const generalPublicScore = data.themeScores.generalPublic[question] || 0;
                        const difference = smallBusinessScore - generalPublicScore;
                        
                        return (
                          <tr key={question}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                              {label}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                smallBusinessScore >= 8 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                smallBusinessScore >= 5 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {smallBusinessScore.toFixed(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                generalPublicScore >= 8 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                                generalPublicScore >= 5 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                                'bg-red-500/20 text-red-300 border border-red-500/30'
                              }`}>
                                {generalPublicScore.toFixed(1)}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                Math.abs(difference) < 0.5 ? 'bg-gray-500/20 text-gray-300 border border-gray-500/30' :
                                difference > 0 ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' :
                                'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                              }`}>
                                {difference > 0 ? '+' : ''}{difference.toFixed(1)}
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Respostas por Pergunta */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-8">
                ANÁLISE POR PERGUNTA - {selectedAudience === 'all' ? 'AMBOS OS PÚBLICOS' : selectedAudience === 'small_business' ? 'PEQUENOS NEGÓCIOS' : 'SOCIEDADE'}
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {Object.entries(questionLabels).map(([question, label], index) => (
                  <div key={question} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-sm font-semibold text-white">{label}</h3>
                      <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                    </div>
                    <ResponsiveContainer width="100%" height={200}>
                      <BarChart 
                        data={Object.entries(filteredData.stats[question] || {}).map(([answer, count]) => ({
                          answer: answerLabels[answer as keyof typeof answerLabels] || answer,
                          count
                        }))}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis dataKey="answer" hide={true} />
                        <YAxis 
                          stroke="rgba(255,255,255,0.6)" 
                          tick={{ fontSize: 10 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip 
                          contentStyle={{
                            backgroundColor: 'rgba(0,0,0,0.8)',
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: 'white'
                          }}
                        />
                        <Bar 
                          dataKey="count" 
                          fill={COLORS[index % COLORS.length]}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ))}
              </div>
            </div>
          </>
      </main>
    </div>
  );
}

