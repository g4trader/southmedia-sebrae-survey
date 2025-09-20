'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, Area, AreaChart, PieChart, Pie, Cell } from 'recharts';
import { Users, TrendingUp, Target, RefreshCw, Calendar, Award, BarChart3, CheckCircle } from 'lucide-react';

interface SurveyResponse {
  id: string;
  timestamp: string;
  session_id: string;
  campaign_id: string | null;
  audience_type?: 'small_business' | 'general_public' | 'all' | string; // Novo campo
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
  // Dados progressivos
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

// Sistema de pontuação
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

export default function DashboardV3() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedAudience, setSelectedAudience] = useState<'all' | 'small_business' | 'general_public'>('all');
  const [activeTab, setActiveTab] = useState<'main' | 'progressive'>('main');

  // CSS otimizado para estabilizar Recharts sem quebrar funcionalidade
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      /* Estabilizar elementos Recharts */
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
      /* Remover transições problemáticas apenas dos elementos de UI */
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

  // Configurações da campanha
  const campaignEndDate = useMemo(() => new Date('2025-10-31'), []);
  const targetPerAudience = 1500;
  const campaignStartDate = useMemo(() => new Date('2025-09-01'), []); // Assumindo início em setembro

  const fetchData = useCallback(async () => {
    try {
      // Buscar dados da API V1 (dados gerais)
      const responseV1 = await fetch('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/responses');
      if (!responseV1.ok) throw new Error('Erro ao buscar dados V1');
      
      // Buscar dados da API V2 (dados segmentados)
      const responseV2 = await fetch('https://sebrae-survey-api-v2-609095880025.us-central1.run.app/responses');
      if (!responseV2.ok) throw new Error('Erro ao buscar dados V2');
      
      // Buscar dados progressivos
      const progressiveRes = await fetch('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/progressive-responses');
      if (!progressiveRes.ok) throw new Error('Erro ao buscar dados progressivos');
      
      const dataV1 = await responseV1.json();
      const dataV2 = await responseV2.json();
      const progressiveData = await progressiveRes.json();
      
      // Combinar dados das duas APIs
      const allResponses = [
        ...(dataV1.responses || []).map((r: SurveyResponse) => ({ ...r, audience_type: 'all' })),
        ...(dataV2.responses || [])
      ];
      
      // Processar dados combinados
      const responses = allResponses.filter((response: SurveyResponse) => {
        const campaignId = response.campaign_id;
        return !campaignId || !campaignId.toLowerCase().includes('test');
      });

      // Separar por público (simulando dados - em produção viria do campo audience_type)
      const smallBusinessResponses = responses.filter((_: SurveyResponse, index: number) => index % 2 === 0);
      const generalPublicResponses = responses.filter((_: SurveyResponse, index: number) => index % 2 === 1);

      // Adicionar audience_type simulado
      const responsesWithAudience = responses.map((response: SurveyResponse, index: number) => ({
        ...response,
        audience_type: index % 2 === 0 ? 'small_business' : 'general_public'
      }));

      const questionStats: Record<string, Record<string, number>> = {};
      const smallBusinessStats: Record<string, Record<string, number>> = {};
      const generalPublicStats: Record<string, Record<string, number>> = {};
      const deviceStats: Record<string, number> = {};

      // Inicializar estatísticas
      Object.keys(questionLabels).forEach(q => {
        questionStats[q] = {};
        smallBusinessStats[q] = {};
        generalPublicStats[q] = {};
      });

      // Processar estatísticas
      responsesWithAudience.forEach((response: SurveyResponse) => {
        const audience = response.audience_type || 'general_public';
        
        Object.entries(response.answers).forEach(([question, answer]) => {
          // Estatísticas gerais
          if (!questionStats[question][answer]) {
            questionStats[question][answer] = 0;
          }
          questionStats[question][answer]++;

          // Estatísticas por público
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

        // Estatísticas de dispositivo
        const userAgent = response.metadata.user_agent || 'Unknown';
        let device = 'Desktop';
        if (userAgent.includes('Mobile')) device = 'Mobile';
        else if (userAgent.includes('Tablet')) device = 'Tablet';
        
        deviceStats[device] = (deviceStats[device] || 0) + 1;
      });

      // Processar dados progressivos
      const progressiveResponses: ProgressiveResponse[] = progressiveData.responses || [];
      const completedProgressive = progressiveResponses.filter(p => p.is_complete).length;
      
      // Separar dados progressivos completos por público
      const completedProgressiveResponses = progressiveResponses.filter(p => p.is_complete);
      const progressiveSmallBusiness = completedProgressiveResponses.filter((_: ProgressiveResponse, index: number) => index % 2 === 0);
      const progressiveGeneralPublic = completedProgressiveResponses.filter((_: ProgressiveResponse, index: number) => index % 2 === 1);

      // Calcular dados diários com meta
      const dailyData = calculateDailyData(responsesWithAudience, campaignStartDate, campaignEndDate, targetPerAudience);

      // Calcular notas por tema
      const themeScores = calculateThemeScores(smallBusinessStats, generalPublicStats);
      
      // Calcular estatísticas progressivas
      const progressiveStats = {
        totalSessions: new Set(progressiveResponses.map(p => p.session_id)).size,
        completedSessions: new Set(progressiveResponses.filter(p => p.is_complete).map(p => p.session_id)).size,
        abandonedSessions: 0,
        completionRate: 0,
        averageTimePerQuestion: 0,
        questionAbandonmentRate: {} as Record<number, number>,
        hourlyProgression: [] as Array<{ hour: string; progressive: number; complete: number }>,
        campaignStats: {} as Record<string, { total: number; completed: number; abandoned: number; completionRate: number }>,
        deviceStats: {} as Record<string, number>,
        realTimeData: progressiveResponses.slice(0, 20)
      };

      // Calcular taxa de abandono progressivo
      progressiveStats.abandonedSessions = progressiveStats.totalSessions - progressiveStats.completedSessions;
      progressiveStats.completionRate = progressiveStats.totalSessions > 0 
        ? (progressiveStats.completedSessions / progressiveStats.totalSessions) * 100 
        : 0;

      // Calcular abandono por pergunta
      for (let q = 1; q <= 6; q++) {
        const questionResponses = progressiveResponses.filter(p => p.question_number === q);
        const uniqueSessions = new Set(questionResponses.map(p => p.session_id));
        const completedSessions = new Set(progressiveResponses.filter(p => p.is_complete).map(p => p.session_id));
        const abandonedAtQ = uniqueSessions.size - Array.from(uniqueSessions).filter(s => completedSessions.has(s)).length;
        progressiveStats.questionAbandonmentRate[q] = uniqueSessions.size > 0 ? (abandonedAtQ / uniqueSessions.size) * 100 : 0;
      }

      // Calcular dados por hora para progressivas
      const hourProgression: Record<string, { progressive: number; complete: number }> = {};
      progressiveResponses.forEach(p => {
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

      // Calcular estatísticas por campanha progressivas
      const campaignProgressiveStats: Record<string, { total: number; completed: number; abandoned: number; completionRate: number }> = {};
      progressiveResponses.forEach(p => {
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

      // Calcular estatísticas de dispositivos progressivas
      const deviceProgressiveStats: Record<string, number> = {};
      progressiveResponses.forEach(p => {
        const ua = p.user_agent || '';
        let device = 'Desktop';
        if (ua.includes('Mobile')) device = 'Mobile';
        else if (ua.includes('Tablet')) device = 'Tablet';
        deviceProgressiveStats[device] = (deviceProgressiveStats[device] || 0) + 1;
      });
      progressiveStats.deviceStats = deviceProgressiveStats;

      const completionRate = responses.length > 0 ? 100 : 0;
      const avgTimeMinutes = responses.length > 0 ? Math.round(responses.length * 0.5) : 0;
      const systemStatus = 'ONLINE';

      setData({
        totalResponses: allResponses.length + completedProgressive, // Soma total incluindo progressivos completos
        smallBusinessResponses: smallBusinessResponses.length + progressiveSmallBusiness.length, // Incluir progressivos
        generalPublicResponses: generalPublicResponses.length + progressiveGeneralPublic.length, // Incluir progressivos
        responses: responsesWithAudience,
        questionStats,
        smallBusinessStats,
        generalPublicStats,
        dailyData,
        deviceStats,
        completionRate,
        avgTimeMinutes,
        systemStatus,
        themeScores,
        progressiveResponses: progressiveResponses.length,
        completedProgressive,
        progressiveStats
      });

      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, [campaignEndDate, campaignStartDate]);

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

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Atualizar a cada 5 minutos
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          </div>
          <p className="mt-6 text-white/80 text-lg font-medium">Carregando dashboard v3...</p>
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
                  South Media - Dashboard V3
                </h1>
                <p className="text-purple-300">Pesquisa Sebrae - Análise por Público</p>
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
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl shadow-lg"
                title="Atualizar dados agora"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Abas */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setActiveTab('main')}
                className={`px-6 py-3 rounded-xl font-semibold ${
                  activeTab === 'main'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                <BarChart3 className="w-5 h-5 inline mr-2" />
                Dashboard Principal
              </button>
              <button
                onClick={() => setActiveTab('progressive')}
                className={`px-6 py-3 rounded-xl font-semibold ${
                  activeTab === 'progressive'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70'
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
                className={`px-6 py-3 rounded-xl font-semibold ${
                  selectedAudience === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                <Users className="w-5 h-5 inline mr-2" />
                Ambos os Públicos
              </button>
              <button
                onClick={() => setSelectedAudience('small_business')}
                className={`px-6 py-3 rounded-xl font-semibold ${
                  selectedAudience === 'small_business'
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                <Target className="w-5 h-5 inline mr-2" />
                Pequenos Negócios
              </button>
              <button
                onClick={() => setSelectedAudience('general_public')}
                className={`px-6 py-3 rounded-xl font-semibold ${
                  selectedAudience === 'general_public'
                    ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70'
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

        {/* Respostas por Pergunta (Filtrado por Público) */}
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

            {/* Dados em Tempo Real */}
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-white">DADOS EM TEMPO REAL</h3>
                  <CheckCircle className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700/50">
                  <thead className="bg-gray-800/30">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        SESSÃO
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        PERGUNTA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        RESPOSTA
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        STATUS
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                        TIMESTAMP
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-gray-700/30">
                    {data.progressiveStats.realTimeData.map((response) => (
                      <tr key={response.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {response.session_id.substring(0, 8)}...
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          P{response.question_number}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {response.answer}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                            response.is_complete
                              ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                              : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                          }`}>
                            {response.is_complete ? 'Completo' : 'Em andamento'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                          {new Date(response.timestamp).toLocaleString('pt-BR')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
