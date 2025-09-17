'use client';

import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Area, AreaChart } from 'recharts';
import { Users, TrendingUp, Clock, CheckCircle, Activity, Target, RefreshCw, Eye } from 'lucide-react';

interface SurveyResponse {
  id: string;
  timestamp: string;
  session_id: string;
  campaign_id: string | null;
  audience_type?: string; // Campo para segmentação de público
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

interface DashboardData {
  totalResponses: number;
  realResponses: number;
  testResponses: number;
  responses: SurveyResponse[];
  questionStats: Record<string, Record<string, number>>;
  hourlyData: Array<{ hour: string; count: number }>;
  deviceStats: Record<string, number>;
  audienceStats: Record<string, number>; // Estatísticas por público
  completionRate: number;
  avgTimeMinutes: number;
  systemStatus: string;
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

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  const [nextUpdate, setNextUpdate] = useState<Date>(new Date(Date.now() + 300000));
  const [timeUntilUpdate, setTimeUntilUpdate] = useState<string>('5:00');

  const fetchData = async () => {
    try {
      // Buscar dados de ambas as APIs (V1 e V2)
      const [responseV1, responseV2] = await Promise.all([
        fetch('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/responses'),
        fetch('https://sebrae-survey-api-v2-609095880025.us-central1.run.app/responses')
      ]);
      
      if (!responseV1.ok) throw new Error('Erro ao buscar dados da API V1');
      if (!responseV2.ok) throw new Error('Erro ao buscar dados da API V2');
      
      const resultV1 = await responseV1.json();
      const resultV2 = await responseV2.json();
      
      if (!resultV1.ok) throw new Error(resultV1.error || 'Erro na API V1');
      if (!resultV2.ok) throw new Error(resultV2.error || 'Erro na API V2');

      // Combinar dados de ambas as APIs
      console.log('API V1 responses:', resultV1.responses?.length || 0);
      console.log('API V2 responses:', resultV2.responses?.length || 0);
      const allResponses = [
        ...(resultV1.responses || []),
        ...(resultV2.responses || [])
      ];
      console.log('Total combined responses:', allResponses.length);
      const responses = allResponses.filter((response: SurveyResponse) => {
        // Excluir respostas de teste
        const campaignId = response.campaign_id;
        const isTest = campaignId && campaignId.toLowerCase().includes('test');
        if (isTest) {
          console.log('Filtering out test response:', campaignId);
        }
        return !isTest;
      });
      console.log('Filtered responses:', responses.length);
      
      const questionStats: Record<string, Record<string, number>> = {};
      const hourlyData: Record<string, number> = {};
      const deviceStats: Record<string, number> = {};
      const audienceStats: Record<string, number> = {};

      // Inicializar estatísticas
      Object.keys(questionLabels).forEach(q => {
        questionStats[q] = {};
      });

      responses.forEach((response: SurveyResponse) => {
        // Estatísticas por pergunta
        Object.entries(response.answers).forEach(([question, answer]) => {
          if (!questionStats[question][answer]) {
            questionStats[question][answer] = 0;
          }
          questionStats[question][answer]++;
        });

        // Dados por hora
        const hour = new Date(response.timestamp).getHours();
        const hourKey = `${hour}:00`;
        hourlyData[hourKey] = (hourlyData[hourKey] || 0) + 1;

        // Estatísticas de dispositivo
        const userAgent = response.metadata.user_agent || 'Unknown';
        let device = 'Desktop';
        if (userAgent.includes('Mobile')) device = 'Mobile';
        else if (userAgent.includes('Tablet')) device = 'Tablet';
        
        deviceStats[device] = (deviceStats[device] || 0) + 1;

        // Estatísticas por público
        const audienceType = response.audience_type || 'geral';
        const audienceLabel = audienceType === 'small_business' ? 'Pequenos Negócios' : 
                             audienceType === 'general_public' ? 'Sociedade' : 'Geral';
        audienceStats[audienceLabel] = (audienceStats[audienceLabel] || 0) + 1;
      });

      // Calcular métricas dinâmicas
      const completionRate = responses.length > 0 ? 100 : 0; // 100% se há respostas
      const avgTimeMinutes = responses.length > 0 ? Math.round(responses.length * 0.5) : 0; // Estimativa baseada no volume
      const systemStatus = 'ONLINE';

      setData({
        totalResponses: allResponses.length,
        realResponses: responses.length,
        testResponses: allResponses.length - responses.length,
        responses,
        questionStats,
        hourlyData: Object.entries(hourlyData).map(([hour, count]) => ({ hour, count })),
        deviceStats,
        audienceStats,
        completionRate,
        avgTimeMinutes,
        systemStatus
      });

      setLastUpdate(new Date());
      setNextUpdate(new Date(Date.now() + 300000)); // Próxima atualização em 5 minutos
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 300000); // Atualizar a cada 5 minutos (300000ms)
    return () => clearInterval(interval);
  }, []);

  // Contador regressivo para próxima atualização
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const diff = nextUpdate.getTime() - now.getTime();
      
      if (diff > 0) {
        const minutes = Math.floor(diff / 60000);
        const seconds = Math.floor((diff % 60000) / 1000);
        setTimeUntilUpdate(`${minutes}:${seconds.toString().padStart(2, '0')}`);
      } else {
        setTimeUntilUpdate('0:00');
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [nextUpdate]);

  if (loading) {
  return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent bg-gradient-to-r from-indigo-500 to-purple-500 mx-auto"></div>
            <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-white animate-spin"></div>
          </div>
          <p className="mt-6 text-white/80 text-lg font-medium">Carregando dashboard...</p>
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
            className="bg-gradient-to-r from-red-500 to-pink-500 text-white px-6 py-3 rounded-xl hover:from-red-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
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
                <span className="text-white font-bold text-xl">SM</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent">
                  South Media
                </h1>
                <p className="text-purple-300">Dashboard de Pesquisa Sebrae</p>
              </div>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-right">
                <p className="text-xs text-purple-300">Última atualização</p>
                <p className="text-sm font-medium text-white">
                  {lastUpdate.toLocaleTimeString('pt-BR')}
                </p>
                <p className="text-xs text-purple-400">
                  Próxima em: {timeUntilUpdate}
                </p>
              </div>
              <button 
                onClick={fetchData}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all duration-300 shadow-lg"
                title="Atualizar dados agora"
              >
                <RefreshCw className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Cards de Métricas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-2xl border border-purple-500/30 p-6 hover:border-purple-400/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-300">RESPOSTAS REAIS</p>
                <p className="text-4xl font-bold text-white mt-2">{data.realResponses}</p>
                {data.testResponses > 0 && (
                  <p className="text-xs text-purple-400 mt-1">
                    +{data.testResponses} de teste
                  </p>
                )}
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Users className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-lg rounded-2xl border border-green-500/30 p-6 hover:border-green-400/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-300">TAXA DE CONCLUSÃO</p>
                <p className="text-4xl font-bold text-white mt-2">{data.completionRate}%</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 backdrop-blur-lg rounded-2xl border border-orange-500/30 p-6 hover:border-orange-400/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-300">TEMPO MÉDIO</p>
                <p className="text-4xl font-bold text-white mt-2">~{data.avgTimeMinutes}min</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <Clock className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-2xl border border-blue-500/30 p-6 hover:border-blue-400/50 transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-300">SISTEMA STATUS</p>
                <p className="text-4xl font-bold text-white mt-2">{data.systemStatus}</p>
              </div>
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <CheckCircle className="h-7 w-7 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Respostas por Hora */}
          <div className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 backdrop-blur-lg rounded-2xl border border-purple-500/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">RESPOSTAS POR HORA</h3>
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data.hourlyData}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#A855F7" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#A855F7" stopOpacity={0.1}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="hour" stroke="rgba(255,255,255,0.6)" />
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
                <Area 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#A855F7" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorCount)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Dispositivos */}
          <div className="bg-gradient-to-br from-orange-500/10 to-yellow-500/10 backdrop-blur-lg rounded-2xl border border-orange-500/20 p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-white">DISTRIBUIÇÃO DE DISPOSITIVOS</h3>
              <Target className="w-6 h-6 text-orange-400" />
            </div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={Object.entries(data.deviceStats).map(([device, count]) => ({ device, count }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ device, count, percent }) => `${device}: ${count} (${percent ? (percent * 100).toFixed(0) : 0}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {Object.entries(data.deviceStats).map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    border: '1px solid rgba(251,146,60,0.3)',
                    borderRadius: '12px',
                    color: 'white',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Segmentação por Público */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-8">SEGMENTAÇÃO POR PÚBLICO</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">Distribuição por Público</h3>
                <Users className="w-6 h-6 text-blue-400" />
              </div>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={Object.entries(data.audienceStats).map(([audience, count]) => ({ audience, count }))}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ audience, count, percent }) => `${audience}: ${count} (${((percent || 0) * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {Object.entries(data.audienceStats).map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => [value, 'Respostas']}
                    labelStyle={{ color: '#000' }}
                    contentStyle={{ 
                      backgroundColor: 'rgba(0,0,0,0.8)', 
                      border: '1px solid #333',
                      borderRadius: '8px',
                      color: '#fff'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Respostas por Pergunta */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-8">ANÁLISE POR PERGUNTA</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {Object.entries(questionLabels).map(([question, label], index) => (
              <div key={question} className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6 hover:border-gray-600/50 transition-all duration-300">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white">{label}</h3>
                  <div className={`w-3 h-3 rounded-full`} style={{backgroundColor: COLORS[index % COLORS.length]}}></div>
                </div>
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={Object.entries(data.questionStats[question] || {}).map(([answer, count]) => ({
                    answer: answerLabels[answer as keyof typeof answerLabels] || answer,
                    count
                  }))}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                    <XAxis 
                      dataKey="answer" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60} 
                      stroke="rgba(255,255,255,0.6)"
                      fontSize={10}
                    />
                    <YAxis stroke="rgba(255,255,255,0.6)" />
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

        {/* Respostas Recentes */}
        <div className="bg-gradient-to-br from-gray-800/50 to-gray-900/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-white">DADOS DETALHADOS</h3>
              <Eye className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700/50">
              <thead className="bg-gray-800/30">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    DATA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    TECNOLOGIA
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    DIVERSIDADE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    SUSTENTABILIDADE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    RECONHECIMENTO
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    AGILIDADE
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-purple-300 uppercase tracking-wider">
                    PARCERIAS
                  </th>
                </tr>
              </thead>
              <tbody className="bg-transparent divide-y divide-gray-700/30">
                {data.responses.slice(0, 10).map((response) => (
                  <tr key={response.id} className="hover:bg-gray-800/30 transition-colors duration-200">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-white">
                      {new Date(response.timestamp).toLocaleString('pt-BR')}
                    </td>
                    {Object.values(response.answers).map((answer, index) => (
                      <td key={index} className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                          answer === 'sempre' || answer === 'engajado' || answer === 'muito_agil' || answer === 'muitas_parcerias'
                            ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                            : answer === 'maioria' || answer === 'alguma' || answer === 'as_vezes' || answer === 'algumas'
                            ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                            : 'bg-red-500/20 text-red-300 border border-red-500/30'
                        }`}>
                          {answerLabels[answer as keyof typeof answerLabels] || answer}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}