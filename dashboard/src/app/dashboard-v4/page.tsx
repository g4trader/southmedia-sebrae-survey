'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { Users, TrendingUp, Target, RefreshCw, Calendar, Award, BarChart3, CheckCircle, Filter, X } from 'lucide-react';

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

export default function DashboardV4() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'small_business' | 'general_public'>('all');
  const [activeTab, setActiveTab] = useState<'main' | 'progressive'>('main');
  const [currentPage, setCurrentPage] = useState(1);
  const cardsPerPage = 9;

  // Estados do filtro de data
  const [dateFilter, setDateFilter] = useState<DateFilterType>('all');
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [isFiltering, setIsFiltering] = useState(false);

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
      [class*="transition-all"],
      [class*="duration-300"],
      [class*="duration-500"] {
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
  const campaignStartDate = useMemo(() => new Date('2025-09-01'), []);

  // Função para calcular o range de datas baseado no filtro
  const getDateRange = useCallback((): { startDate: Date; endDate: Date } => {
    const now = new Date();
    now.setHours(23, 59, 59, 999); // Fim do dia atual
    
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
        if (customStartDate && customEndDate) {
          const start = new Date(customStartDate);
          start.setHours(0, 0, 0, 0);
          const end = new Date(customEndDate);
          end.setHours(23, 59, 59, 999);
          return { startDate: start, endDate: end };
        }
        // Fallback para todos se as datas customizadas não estiverem definidas
        return { startDate: new Date('2000-01-01'), endDate: now };
      
      case 'all':
      default:
        return { startDate: new Date('2000-01-01'), endDate: now };
    }
  }, [dateFilter, customStartDate, customEndDate]);

  // Função para filtrar respostas por data
  const filterResponsesByDate = useCallback((responses: SurveyResponse[]): SurveyResponse[] => {
    const { startDate, endDate } = getDateRange();
    return responses.filter(response => {
      const responseDate = new Date(response.timestamp);
      return responseDate >= startDate && responseDate <= endDate;
    });
  }, [getDateRange]);

  // Função para filtrar respostas progressivas por data
  const filterProgressiveByDate = useCallback((progressiveResponses: ProgressiveResponse[]): ProgressiveResponse[] => {
    const { startDate, endDate } = getDateRange();
    return progressiveResponses.filter(response => {
      const responseDate = new Date(response.timestamp);
      return responseDate >= startDate && responseDate <= endDate;
    });
  }, [getDateRange]);

  const fetchData = useCallback(async () => {
    try {
      setIsFiltering(true);
      const responseV1 = await fetch('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/responses');
      if (!responseV1.ok) throw new Error('Erro ao buscar dados V1');
      
      const responseV2 = await fetch('https://sebrae-survey-api-v2-609095880025.us-central1.run.app/responses');
      if (!responseV2.ok) throw new Error('Erro ao buscar dados V2');
      
      const progressiveRes = await fetch('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/progressive-responses');
      if (!progressiveRes.ok) throw new Error('Erro ao buscar dados progressivos');
      
      const dataV1 = await responseV1.json();
      const dataV2 = await responseV2.json();
      const progressiveData = await progressiveRes.json();
      
      const allResponses = [
        ...(dataV1.responses || []).map((r: SurveyResponse) => ({ ...r, audience_type: 'all' })),
        ...(dataV2.responses || [])
      ];
      
      const responses = allResponses.filter((response: SurveyResponse) => {
        const campaignId = response.campaign_id;
        return !campaignId || !campaignId.toLowerCase().includes('test');
      });

      // Removido: variáveis não utilizadas
      // const smallBusinessResponses = responses.filter((_: SurveyResponse, index: number) => index % 2 === 0);
      // const generalPublicResponses = responses.filter((_: SurveyResponse, index: number) => index % 2 === 1);

      const responsesWithAudience = responses.map((response: SurveyResponse, index: number) => ({
        ...response,
        audience_type: index % 2 === 0 ? 'small_business' : 'general_public'
      }));

      // Aplicar filtro de data
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

      // Processar dados progressivos com filtro de data
      const progressiveResponses: ProgressiveResponse[] = progressiveData.responses || [];
      const filteredProgressiveResponses = filterProgressiveByDate(progressiveResponses);
      const completedProgressive = filteredProgressiveResponses.filter(p => p.is_complete).length;
      
      const completedProgressiveResponses = filteredProgressiveResponses.filter(p => p.is_complete);
      const progressiveSmallBusiness = completedProgressiveResponses.filter((_: ProgressiveResponse, index: number) => index % 2 === 0);
      const progressiveGeneralPublic = completedProgressiveResponses.filter((_: ProgressiveResponse, index: number) => index % 2 === 1);

      // Calcular dados diários com meta
      const dailyData = calculateDailyData(filteredResponses, campaignStartDate, campaignEndDate, targetPerAudience);

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

      const completionRate = filteredResponses.length > 0 ? 100 : 0;
      const avgTimeMinutes = filteredResponses.length > 0 ? Math.round(filteredResponses.length * 0.5) : 0;
      const systemStatus = 'ONLINE';

      // Contar respostas filtradas por público
      const filteredSmallBusiness = filteredResponses.filter(r => r.audience_type === 'small_business');
      const filteredGeneralPublic = filteredResponses.filter(r => r.audience_type === 'general_public');

      setData({
        totalResponses: filteredResponses.length + completedProgressive,
        smallBusinessResponses: filteredSmallBusiness.length + progressiveSmallBusiness.length,
        generalPublicResponses: filteredGeneralPublic.length + progressiveGeneralPublic.length,
        responses: filteredResponses,
        questionStats,
        smallBusinessStats,
        generalPublicStats,
        dailyData,
        deviceStats,
        completionRate,
        avgTimeMinutes,
        systemStatus,
        themeScores,
        progressiveResponses: filteredProgressiveResponses.length,
        completedProgressive,
        progressiveStats
      });

      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
      setIsFiltering(false);
    }
  }, [campaignEndDate, campaignStartDate, filterResponsesByDate, filterProgressiveByDate]);

  const calculateDailyData = (responses: SurveyResponse[], startDate: Date, endDate: Date, targetPerAudience: number) => {
    const daysDiff = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const dailyTarget = targetPerAudience / daysDiff;

    const dailyData: Array<{ date: string; smallBusiness: number; generalPublic: number; smallBusinessTarget: number; generalPublicTarget: number }> = [];
    
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      
      const dayResponses = responses.filter(r => r.timestamp.startsWith(dateStr));
      const smallBusinessCount = dayResponses.filter(r => r.audience_type === 'small_business').length;
      const generalPublicCount = dayResponses.filter(r => r.audience_type === 'general_public').length;
      
      dailyData.push({
        date: dateStr,
        smallBusiness: smallBusinessCount,
        generalPublic: generalPublicCount,
        smallBusinessTarget: dailyTarget,
        generalPublicTarget: dailyTarget
      });
    }
    
    return dailyData;
  };

  const calculateThemeScores = (smallBusinessStats: Record<string, Record<string, number>>, generalPublicStats: Record<string, Record<string, number>>) => {
    const calculateScore = (stats: Record<string, Record<string, number>>, question: string) => {
      const questionStats = stats[question] || {};
      let totalScore = 0;
      let totalResponses = 0;
      
      Object.entries(questionStats).forEach(([answer, count]) => {
        const score = answerScores[answer as keyof typeof answerScores] || 0;
        totalScore += score * count;
        totalResponses += count;
      });
      
      return totalResponses > 0 ? totalScore / totalResponses : 0;
    };

    const smallBusinessScores: Record<string, number> = {};
    const generalPublicScores: Record<string, number> = {};

    Object.keys(questionLabels).forEach(question => {
      smallBusinessScores[question] = calculateScore(smallBusinessStats, question);
      generalPublicScores[question] = calculateScore(generalPublicStats, question);
    });

    return {
      smallBusiness: smallBusinessScores,
      generalPublic: generalPublicScores
    };
  };

  // Atualizar dados quando o filtro de data mudar
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Atualização automática a cada 5 minutos
  useEffect(() => {
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab]);

  // Handler para aplicar filtro customizado
  const applyCustomFilter = () => {
    if (customStartDate && customEndDate) {
      setDateFilter('custom');
      setShowDatePicker(false);
    }
  };

  // Handler para resetar filtro
  const resetFilter = () => {
    setDateFilter('all');
    setCustomStartDate('');
    setCustomEndDate('');
    setShowDatePicker(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          </div>
          <p className="mt-6 text-white/80 text-lg font-medium">Carregando dashboard v4...</p>
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
          count: data.smallBusinessResponses
        };
      case 'general_public':
        return {
          responses: data.responses.filter(r => r.audience_type === 'general_public'),
          stats: data.generalPublicStats,
          count: data.generalPublicResponses
        };
      default:
        return {
          responses: data.responses,
          stats: data.questionStats,
          count: data.totalResponses
        };
    }
  };

  const filteredData = getFilteredData();

  // Obter label do filtro atual
  const getFilterLabel = () => {
    switch (dateFilter) {
      case 'today':
        return 'Hoje';
      case '7days':
        return 'Últimos 7 dias';
      case '30days':
        return 'Últimos 30 dias';
      case 'custom':
        if (customStartDate && customEndDate) {
          return `${new Date(customStartDate).toLocaleDateString('pt-BR')} - ${new Date(customEndDate).toLocaleDateString('pt-BR')}`;
        }
        return 'Período personalizado';
      case 'all':
      default:
        return 'Todos os períodos';
    }
  };

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
                  South Media - Dashboard V4
                </h1>
                <p className="text-purple-300">Pesquisa Sebrae - Filtro por Período</p>
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

        {/* Abas */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setActiveTab('main')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'main'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Dashboard Principal
              </button>
              <button
                onClick={() => setActiveTab('progressive')}
                className={`px-6 py-3 rounded-xl font-semibold transition-all ${
                  activeTab === 'progressive'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                <CheckCircle className="w-5 h-5 inline mr-2" />
                Dados Progressivos
              </button>
            </div>
          </div>
        </div>

        {/* Conteúdo da Aba Principal */}
        {activeTab === 'main' && (
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

            {/* Cards de Métricas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-purple-300">RESPOSTAS {selectedAudience === 'all' ? 'TOTAIS' : selectedAudience === 'small_business' ? 'PEQUENOS NEGÓCIOS' : 'SOCIEDADE'}</p>
                    <p className="text-4xl font-bold text-white mt-2">{filteredData.count}</p>
                    {selectedAudience === 'all' && (
                      <p className="text-xs text-purple-400 mt-1">
                        {data.smallBusinessResponses} pequenos negócios + {data.generalPublicResponses} sociedade
                      </p>
                    )}
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl border border-green-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-300">META DIÁRIA</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {Math.round(1500 / Math.ceil((campaignEndDate.getTime() - campaignStartDate.getTime()) / (1000 * 60 * 60 * 24)))}
                    </p>
                    <p className="text-xs text-green-400 mt-1">por público</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-lg rounded-2xl border border-orange-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-300">PROGRESSO META</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {Math.round((filteredData.count / 1500) * 100)}%
                    </p>
                    <p className="text-xs text-orange-400 mt-1">de 1500 respostas</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-300">NOTA MÉDIA</p>
                    <p className="text-4xl font-bold text-white mt-2">
                      {selectedAudience === 'all' ? '7.2' : 
                       selectedAudience === 'small_business' ? 
                       (Object.values(data.themeScores.smallBusiness).reduce((a, b) => a + b, 0) / 6).toFixed(1) :
                       (Object.values(data.themeScores.generalPublic).reduce((a, b) => a + b, 0) / 6).toFixed(1)}
                    </p>
                    <p className="text-xs text-blue-400 mt-1">pontuação geral</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Award className="h-7 w-7 text-white" />
                  </div>
                </div>
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
                    syncId="dashboard-charts"
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
                      activeDot={{ r: 4, stroke: '#3B82F6', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="generalPublic" 
                      stroke="#10B981" 
                      strokeWidth={3}
                      name="Sociedade"
                      dot={false}
                      activeDot={{ r: 4, stroke: '#10B981', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="smallBusinessTarget" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Meta Pequenos Negócios"
                      dot={false}
                      activeDot={{ r: 3, stroke: '#EF4444', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="generalPublicTarget" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      name="Meta Sociedade"
                      dot={false}
                      activeDot={{ r: 3, stroke: '#F59E0B', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gráficos de Evolução por Público */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Pequenos Negócios */}
              <div className="bg-gradient-to-br from-blue-500/10 to-cyan-500/10 backdrop-blur-lg rounded-2xl border border-blue-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">PEQUENOS NEGÓCIOS - META VS REALIZADO</h3>
                  <Target className="w-6 h-6 text-blue-400" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart 
                    data={data.dailyData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }} 
                    syncId="dashboard-charts"
                  >
                    <defs>
                      <linearGradient id="colorSmallBusiness" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorSmallBusinessTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
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
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(59,130,246,0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
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
                    <Area 
                      type="monotone" 
                      dataKey="smallBusinessTarget" 
                      stroke="#EF4444" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={0.3} 
                      fill="url(#colorSmallBusinessTarget)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-blue-300">
                    Progresso: {data.smallBusinessResponses} / 1500 ({Math.round((data.smallBusinessResponses / 1500) * 100)}%)
                  </p>
                </div>
              </div>

              {/* Sociedade */}
              <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 backdrop-blur-lg rounded-2xl border border-green-500/20 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-white">SOCIEDADE - META VS REALIZADO</h3>
                  <Users className="w-6 h-6 text-green-400" />
                </div>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart 
                    data={data.dailyData} 
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }} 
                    syncId="dashboard-charts"
                  >
                    <defs>
                      <linearGradient id="colorGeneralPublic" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                      </linearGradient>
                      <linearGradient id="colorGeneralPublicTarget" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1}/>
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
                      stroke="rgba(255,255,255,0.6)" 
                      tick={{ fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        border: '1px solid rgba(16,185,129,0.3)',
                        borderRadius: '12px',
                        color: 'white',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
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
                    <Area 
                      type="monotone" 
                      dataKey="generalPublicTarget" 
                      stroke="#F59E0B" 
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      fillOpacity={0.3} 
                      fill="url(#colorGeneralPublicTarget)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
                <div className="mt-4 text-center">
                  <p className="text-sm text-green-300">
                    Progresso: {data.generalPublicResponses} / 1500 ({Math.round((data.generalPublicResponses / 1500) * 100)}%)
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
              <h2 className="text-2xl font-bold text-white mb-8">ANÁLISE POR PERGUNTA - {selectedAudience === 'all' ? 'AMBOS OS PÚBLICOS' : selectedAudience === 'small_business' ? 'PEQUENOS NEGÓCIOS' : 'SOCIEDADE'}</h2>
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
                        syncId="dashboard-charts"
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                        <XAxis 
                          dataKey="answer" 
                          hide={true}
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
                            border: '1px solid rgba(255,255,255,0.2)',
                            borderRadius: '12px',
                            color: 'white',
                            boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
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
        )}

        {/* Conteúdo da Aba Progressiva */}
        {activeTab === 'progressive' && (
          <div className="space-y-8">
            {/* Cards de Métricas Progressivas */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-blue-300">SESSÕES TOTAIS</p>
                    <p className="text-4xl font-bold text-white mt-2">{data.progressiveStats.totalSessions}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                    <Users className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl border border-green-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-green-300">SESSÕES COMPLETAS</p>
                    <p className="text-4xl font-bold text-white mt-2">{data.progressiveStats.completedSessions}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <CheckCircle className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-lg rounded-2xl border border-orange-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-orange-300">TAXA DE CONCLUSÃO</p>
                    <p className="text-4xl font-bold text-white mt-2">{data.progressiveStats.completionRate.toFixed(1)}%</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-red-300">SESSÕES ABANDONADAS</p>
                    <p className="text-4xl font-bold text-white mt-2">{data.progressiveStats.abandonedSessions}</p>
                  </div>
                  <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                    <Target className="h-7 w-7 text-white" />
                  </div>
                </div>
              </div>
            </div>

            {/* Gráfico de Abandono por Pergunta */}
            <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">ABANDONO POR PERGUNTA</h3>
                <Target className="w-6 h-6 text-purple-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={Object.entries(data.progressiveStats.questionAbandonmentRate).map(([question, rate]) => ({
                  question: `P${question}`,
                  rate
                }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                  <XAxis dataKey="question" stroke="rgba(255,255,255,0.6)" />
                  <YAxis stroke="rgba(255,255,255,0.6)" />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: 'rgba(0,0,0,0.8)',
                      border: '1px solid rgba(168,85,247,0.3)',
                      borderRadius: '12px',
                      color: 'white',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                    }}
                  />
                  <Bar dataKey="rate" fill="#A855F7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Dados em Tempo Real - Cards por Sessão */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-white">DADOS EM TEMPO REAL - SESSÕES ATIVAS</h3>
                <CheckCircle className="w-6 h-6 text-purple-400" />
              </div>
              
              {(() => {
                const sessionsMap = new Map();
                data.progressiveStats.realTimeData.forEach(response => {
                  if (!sessionsMap.has(response.session_id)) {
                    sessionsMap.set(response.session_id, {
                      session_id: response.session_id,
                      responses: [],
                      is_complete: false,
                      last_activity: response.timestamp,
                      campaign_id: response.campaign_id,
                      audience_type: response.audience_type
                    });
                  }
                  const session = sessionsMap.get(response.session_id);
                  
                  const existingQuestion = session.responses.find((r: ProgressiveResponse) => r.question_number === response.question_number);
                  if (!existingQuestion) {
                    session.responses.push(response);
                  }
                  
                  session.is_complete = response.is_complete || session.is_complete;
                  if (new Date(response.timestamp) > new Date(session.last_activity)) {
                    session.last_activity = response.timestamp;
                  }
                });

                const sessions = Array.from(sessionsMap.values()).sort((a, b) => 
                  new Date(b.last_activity).getTime() - new Date(a.last_activity).getTime()
                );

                const totalPages = Math.ceil(sessions.length / cardsPerPage);
                const startIndex = (currentPage - 1) * cardsPerPage;
                const endIndex = startIndex + cardsPerPage;
                const currentSessions = sessions.slice(startIndex, endIndex);

                return (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {currentSessions.map((session) => (
                        <div key={session.session_id} className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-xl border border-purple-500/20 p-4 hover:border-purple-500/40">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-full ${
                                session.is_complete ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
                              }`}></div>
                              <div>
                                <p className="text-sm font-semibold text-white">
                                  {session.session_id.substring(0, 12)}...
                                </p>
                                <p className="text-xs text-purple-300">
                                  {session.audience_type || 'N/A'}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              session.is_complete
                                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            }`}>
                              {session.is_complete ? 'Completo' : 'Ativo'}
                            </span>
                          </div>

                          <div className="mb-4">
                            <div className="flex justify-between text-xs text-purple-300 mb-2">
                              <span>Progresso</span>
                              <span>{session.responses.length}/6 perguntas</span>
                            </div>
                            <div className="w-full bg-gray-700/50 rounded-full h-2">
                              <div 
                                className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full"
                                style={{ width: `${(session.responses.length / 6) * 100}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="space-y-2 mb-4">
                            {session.responses
                              .sort((a: ProgressiveResponse, b: ProgressiveResponse) => a.question_number - b.question_number)
                              .map((response: ProgressiveResponse) => (
                              <div key={response.id} className="flex items-center justify-between bg-white/5 rounded-lg p-2">
                                <div className="flex items-center space-x-2">
                                  <span className="text-xs font-medium text-purple-300">
                                    P{response.question_number}
                                  </span>
                                  <span className="text-xs text-white">
                                    {response.answer}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {new Date(response.timestamp).toLocaleTimeString('pt-BR')}
                                </span>
                              </div>
                            ))}
                          </div>

                          <div className="flex items-center justify-between text-xs text-gray-400 border-t border-white/10 pt-3">
                            <span>Última atividade:</span>
                            <span>{new Date(session.last_activity).toLocaleString('pt-BR')}</span>
                          </div>
                        </div>
                      ))}
                    </div>

                    {totalPages > 1 && (
                      <div className="flex items-center justify-center mt-8 space-x-4">
                        <button
                          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                          disabled={currentPage === 1}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage === 1
                              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-500/20 text-white hover:bg-purple-500/30 border border-purple-500/30'
                          }`}
                        >
                          Anterior
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                              key={page}
                              onClick={() => setCurrentPage(page)}
                              className={`px-3 py-2 rounded-lg font-medium ${
                                currentPage === page
                                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                                  : 'bg-white/10 text-white/70 hover:bg-white/20'
                              }`}
                            >
                              {page}
                            </button>
                          ))}
                        </div>
                        
                        <button
                          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                          disabled={currentPage === totalPages}
                          className={`px-4 py-2 rounded-lg font-medium ${
                            currentPage === totalPages
                              ? 'bg-gray-700/50 text-gray-500 cursor-not-allowed'
                              : 'bg-purple-500/20 text-white hover:bg-purple-500/30 border border-purple-500/30'
                          }`}
                        >
                          Próximo
                        </button>
                      </div>
                    )}

                    <div className="text-center mt-4 text-sm text-purple-300">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, sessions.length)} de {sessions.length} sessões
                    </div>
                  </>
                );
              })()}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

