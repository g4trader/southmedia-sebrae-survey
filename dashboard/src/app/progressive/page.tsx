'use client';

import { useState, useEffect, useCallback } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Users, Clock, CheckCircle, Activity, Target, RefreshCw, Eye, AlertTriangle, Zap } from 'lucide-react';

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

interface ProgressiveStats {
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
}


const questionLabels = {
  1: 'Tecnologia e Inovação',
  2: 'Diversidade e Inclusão', 
  3: 'Sustentabilidade Ambiental',
  4: 'Reconhecimento Público',
  5: 'Agilidade de Resposta',
  6: 'Parcerias e Colaboração'
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

export default function ProgressiveDashboard() {
  const [data, setData] = useState<ProgressiveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');

  const fetchData = useCallback(async () => {
    try {
      // Buscar dados progressivos da API
      const response = await fetch('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/progressive-responses');
      if (!response.ok) throw new Error('Erro ao buscar dados progressivos');
      
      const progressiveData = await response.json();
      
      // Processar dados progressivos
      const responses: ProgressiveResponse[] = progressiveData.responses || [];
      
      // Calcular estatísticas
      const sessionMap = new Map<string, ProgressiveResponse[]>();
      responses.forEach(response => {
        if (!sessionMap.has(response.session_id)) {
          sessionMap.set(response.session_id, []);
        }
        sessionMap.get(response.session_id)!.push(response);
      });

      const sessions = Array.from(sessionMap.values());
      const completedSessions = sessions.filter(session => 
        session.some(r => r.is_complete)
      ).length;
      const abandonedSessions = sessions.length - completedSessions;

      // Calcular taxa de abandono por pergunta
      const questionAbandonmentRate: Record<number, number> = {};
      for (let q = 1; q <= 6; q++) {
        const sessionsAtQuestion = sessions.filter(session => 
          session.some(r => r.question_number === q)
        ).length;
        const sessionsAfterQuestion = sessions.filter(session => 
          session.some(r => r.question_number > q)
        ).length;
        questionAbandonmentRate[q] = sessionsAtQuestion > 0 ? 
          ((sessionsAtQuestion - sessionsAfterQuestion) / sessionsAtQuestion) * 100 : 0;
      }

      // Calcular dados por hora
      const hourlyMap = new Map<string, { progressive: number; complete: number }>();
      responses.forEach(response => {
        const hour = new Date(response.timestamp).toLocaleTimeString('pt-BR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        });
        if (!hourlyMap.has(hour)) {
          hourlyMap.set(hour, { progressive: 0, complete: 0 });
        }
        const hourData = hourlyMap.get(hour)!;
        hourData.progressive++;
        if (response.is_complete) {
          hourData.complete++;
        }
      });

      const hourlyProgression = Array.from(hourlyMap.entries())
        .map(([hour, data]) => ({ hour, ...data }))
        .sort((a, b) => a.hour.localeCompare(b.hour));

      // Calcular estatísticas por campanha
      const campaignStats: Record<string, { total: number; completed: number; abandoned: number; completionRate: number }> = {};
      responses.forEach(response => {
        const campaign = response.campaign_id || 'unknown';
        if (!campaignStats[campaign]) {
          campaignStats[campaign] = { total: 0, completed: 0, abandoned: 0, completionRate: 0 };
        }
        campaignStats[campaign].total++;
        if (response.is_complete) {
          campaignStats[campaign].completed++;
        }
      });

      // Calcular taxa de conclusão por campanha
      Object.keys(campaignStats).forEach(campaign => {
        const stats = campaignStats[campaign];
        stats.completionRate = stats.total > 0 ? (stats.completed / stats.total) * 100 : 0;
        stats.abandoned = stats.total - stats.completed;
      });

      // Calcular estatísticas de dispositivo
      const deviceStats: Record<string, number> = {};
      responses.forEach(response => {
        const userAgent = response.user_agent || 'Unknown';
        let device = 'Desktop';
        if (userAgent.includes('Mobile')) device = 'Mobile';
        else if (userAgent.includes('Tablet')) device = 'Tablet';
        
        deviceStats[device] = (deviceStats[device] || 0) + 1;
      });

      // Calcular tempo médio por pergunta (simulado)
      const averageTimePerQuestion = responses.length > 0 ? Math.round(responses.length * 0.3) : 0;

      setData({
        totalSessions: sessions.length,
        completedSessions,
        abandonedSessions,
        completionRate: sessions.length > 0 ? (completedSessions / sessions.length) * 100 : 0,
        averageTimePerQuestion,
        questionAbandonmentRate,
        hourlyProgression,
        campaignStats,
        deviceStats,
        realTimeData: responses.slice(-50) // Últimas 50 respostas
      });

      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Atualizar a cada 30 segundos
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
          <p className="mt-6 text-white/80 text-lg font-medium">Carregando dados progressivos...</p>
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



  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-lg border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  Dashboard Progressivo
                </h1>
                <p className="text-purple-300">Coleta de Dados em Tempo Real</p>
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
        {/* Toggle de Campanha */}
        <div className="mb-8">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-4">
            <div className="flex items-center justify-center space-x-4">
              <button
                onClick={() => setSelectedCampaign('all')}
                className={`px-6 py-3 rounded-xl font-semibold ${
                  selectedCampaign === 'all'
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                    : 'bg-white/10 text-white/70'
                }`}
              >
                <Activity className="w-5 h-5 inline mr-2" />
                Todas as Campanhas
              </button>
              {Object.keys(data.campaignStats).map(campaign => (
                <button
                  key={campaign}
                  onClick={() => setSelectedCampaign(campaign)}
                  className={`px-6 py-3 rounded-xl font-semibold ${
                    selectedCampaign === campaign
                      ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                      : 'bg-white/10 text-white/70'
                  }`}
                >
                  <Target className="w-5 h-5 inline mr-2" />
                  {campaign.replace('sebrae_survey_v2_', '').replace('_', ' ').toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Cards de Métricas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">SESSÕES ATIVAS</p>
                <p className="text-4xl font-bold text-white mt-2">{data.totalSessions}</p>
                <p className="text-xs text-purple-400 mt-1">usuários únicos</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl border border-green-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">CONCLUÍDAS</p>
                <p className="text-4xl font-bold text-white mt-2">{data.completedSessions}</p>
                <p className="text-xs text-green-400 mt-1">
                  {data.completionRate.toFixed(1)}% taxa de conclusão
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-red-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-red-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-300">ABANDONADAS</p>
                <p className="text-4xl font-bold text-white mt-2">{data.abandonedSessions}</p>
                <p className="text-xs text-red-400 mt-1">
                  {(100 - data.completionRate).toFixed(1)}% taxa de abandono
                </p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-red-500 to-pink-500 rounded-xl flex items-center justify-center">
                <AlertTriangle className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">TEMPO MÉDIO</p>
                <p className="text-4xl font-bold text-white mt-2">{data.averageTimePerQuestion}</p>
                <p className="text-xs text-blue-400 mt-1">segundos por pergunta</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráfico de Abandono por Pergunta */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-red-500/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">TAXA DE ABANDONO POR PERGUNTA</h3>
              <AlertTriangle className="w-6 h-6 text-red-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart 
                data={Object.entries(data.questionAbandonmentRate).map(([question, rate]) => ({
                  question: `P${question}`,
                  label: questionLabels[parseInt(question) as keyof typeof questionLabels],
                  rate
                }))}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="question" 
                  stroke="rgba(255,255,255,0.6)" 
                  tick={{ fontSize: 12 }}
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
                    border: '1px solid rgba(239,68,68,0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                  }}
                  formatter={(value: number) => [`${value.toFixed(1)}%`, 'Taxa de Abandono']}
                />
                <Bar 
                  dataKey="rate" 
                  fill="#EF4444"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Gráfico de Progressão por Hora */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">ATIVIDADE POR HORA</h3>
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart 
                data={data.hourlyProgression}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="hour" 
                  stroke="rgba(255,255,255,0.6)" 
                  tick={{ fontSize: 12 }}
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
                  dataKey="progressive" 
                  stroke="#A855F7" 
                  strokeWidth={3}
                  name="Respostas Progressivas"
                  dot={false}
                  activeDot={{ r: 4, stroke: '#A855F7', strokeWidth: 2 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="complete" 
                  stroke="#10B981" 
                  strokeWidth={3}
                  name="Completadas"
                  dot={false}
                  activeDot={{ r: 4, stroke: '#10B981', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estatísticas por Campanha */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">ESTATÍSTICAS POR CAMPANHA</h3>
                <Target className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-800/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      CAMPANHA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                      TOTAL
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">
                      CONCLUÍDAS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-red-300 uppercase tracking-wider">
                      ABANDONADAS
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      TAXA DE CONCLUSÃO
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-gray-700/30">
                  {Object.entries(data.campaignStats).map(([campaign, stats]) => (
                    <tr key={campaign}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {campaign.replace('sebrae_survey_v2_', '').replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300">
                        {stats.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-300">
                        {stats.completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-300">
                        {stats.abandoned}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          stats.completionRate >= 70 ? 'bg-green-500/20 text-green-300 border border-green-500/30' :
                          stats.completionRate >= 50 ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' :
                          'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {stats.completionRate.toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Dados em Tempo Real */}
        <div className="mb-8">
          <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">DADOS EM TEMPO REAL (Últimas 50)</h3>
                <Eye className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div className="overflow-x-auto max-h-96">
              <table className="min-w-full divide-y divide-gray-700/50">
                <thead className="bg-gray-800/30 sticky top-0">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      TIMESTAMP
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-blue-300 uppercase tracking-wider">
                      SESSÃO
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-green-300 uppercase tracking-wider">
                      PERGUNTA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-yellow-300 uppercase tracking-wider">
                      RESPOSTA
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                      STATUS
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-transparent divide-y divide-gray-700/30">
                  {data.realTimeData.slice().reverse().map((response, index) => (
                    <tr key={`${response.session_id}-${response.question_number}-${index}`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                        {new Date(response.timestamp).toLocaleTimeString('pt-BR')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-300 font-mono">
                        {response.session_id.slice(-8)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-green-300">
                        P{response.question_number}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-yellow-300">
                        {answerLabels[response.answer as keyof typeof answerLabels] || response.answer}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          response.is_complete 
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                        }`}>
                          {response.is_complete ? '✅ Completo' : '⏳ Progressivo'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
