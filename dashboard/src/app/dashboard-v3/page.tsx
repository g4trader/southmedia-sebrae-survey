'use client';

import { useState, useEffect } from 'react';

interface Response {
  id: string;
  timestamp: string;
  session_id: string;
  campaign_id: string;
  answers?: {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    q5?: string;
    q6?: string;
  };
  metadata?: {
    is_complete: boolean;
    user_agent: string;
    origin: string;
    page_url: string;
    referer: string;
  };
}

interface ProgressiveResponse {
  id: string;
  timestamp: string;
  session_id: string;
  question_number: number;
  answer: string;
  is_complete: boolean;
  campaign_id: string;
  audience_type: string;
  all_answers?: {
    q1?: string;
    q2?: string;
    q3?: string;
    q4?: string;
    q5?: string;
    q6?: string;
  };
}

interface DashboardData {
  totalResponses: number;
  progressiveResponses: number;
  completedProgressive: number;
  recentResponses: Response[];
  recentProgressive: ProgressiveResponse[];
  campaignStats: {
    [key: string]: {
      total: number;
      progressive: number;
      completed: number;
    };
  };
}

export default function DashboardV3() {
  const [data, setData] = useState<DashboardData>({
    totalResponses: 0,
    progressiveResponses: 0,
    completedProgressive: 0,
    recentResponses: [],
    recentProgressive: [],
    campaignStats: {}
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar dados das duas coleções em paralelo
      const [responsesRes, progressiveRes] = await Promise.all([
        fetch('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/responses'),
        fetch('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/progressive-responses')
      ]);

      if (!responsesRes.ok || !progressiveRes.ok) {
        throw new Error('Erro ao buscar dados das APIs');
      }

      const responsesData = await responsesRes.json();
      const progressiveData = await progressiveRes.json();

      // Processar dados das respostas completas
      const responses: Response[] = responsesData.responses || [];
      
      // Processar dados progressivos
      const progressiveResponses: ProgressiveResponse[] = progressiveData.responses || [];
      
      // Contar respostas completas progressivas
      const completedProgressive = progressiveResponses.filter(p => p.is_complete).length;
      
      // Calcular estatísticas por campanha
      const campaignStats: { [key: string]: { total: number; progressive: number; completed: number } } = {};
      
      // Contar respostas completas por campanha
      responses.forEach(r => {
        const campaign = r.campaign_id || 'unknown';
        if (!campaignStats[campaign]) {
          campaignStats[campaign] = { total: 0, progressive: 0, completed: 0 };
        }
        campaignStats[campaign].total++;
      });
      
      // Contar respostas progressivas por campanha
      progressiveResponses.forEach(p => {
        const campaign = p.campaign_id || 'unknown';
        if (!campaignStats[campaign]) {
          campaignStats[campaign] = { total: 0, progressive: 0, completed: 0 };
        }
        campaignStats[campaign].progressive++;
        if (p.is_complete) {
          campaignStats[campaign].completed++;
        }
      });

      setData({
        totalResponses: responses.length,
        progressiveResponses: progressiveResponses.length,
        completedProgressive,
        recentResponses: responses.slice(0, 10),
        recentProgressive: progressiveResponses.slice(0, 10),
        campaignStats
      });

      setLastUpdate(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); // Atualizar a cada 30 segundos
    return () => clearInterval(interval);
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getAnswerText = (question: string, answer: string) => {
    const answerMap: { [key: string]: { [key: string]: string } } = {
      q1: {
        'sempre': 'Sempre',
        'maioria': 'Maioria das vezes',
        'as_vezes': 'Às vezes',
        'raro': 'Raramente',
        'nunca': 'Nunca'
      },
      q2: {
        'muito_util': 'Muito útil',
        'util': 'Útil',
        'neutro': 'Neutro',
        'pouco_util': 'Pouco útil',
        'inutil': 'Inútil'
      },
      q3: {
        'muito_engajado': 'Muito engajado',
        'engajado': 'Engajado',
        'neutro': 'Neutro',
        'pouco_engajado': 'Pouco engajado',
        'nao_engajado': 'Não engajado'
      },
      q4: {
        'sempre': 'Sempre',
        'maioria': 'Maioria das vezes',
        'as_vezes': 'Às vezes',
        'raro': 'Raramente',
        'nunca': 'Nunca'
      },
      q5: {
        'muito_agil': 'Muito ágil',
        'agil': 'Ágil',
        'neutro': 'Neutro',
        'lento': 'Lento',
        'muito_lento': 'Muito lento'
      },
      q6: {
        'muitas_parcerias': 'Muitas parcerias',
        'algumas_parcerias': 'Algumas parcerias',
        'poucas_parcerias': 'Poucas parcerias',
        'nenhuma_parceria': 'Nenhuma parceria'
      }
    };
    
    return answerMap[question]?.[answer] || answer;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando dados...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Erro ao carregar dados</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={fetchData}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            📊 Dashboard SEBRAE Survey v3
          </h1>
          <p className="text-gray-600">
            Última atualização: {formatDate(lastUpdate.toISOString())}
          </p>
        </div>

        {/* Estatísticas Principais */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-blue-600">
                {data.totalResponses}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Respostas Completas</p>
                <p className="text-xs text-gray-400">Coleção principal</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-green-600">
                {data.progressiveResponses}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Respostas Progressivas</p>
                <p className="text-xs text-gray-400">Coleção progressiva</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-purple-600">
                {data.completedProgressive}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Completas Progressivas</p>
                <p className="text-xs text-gray-400">is_complete = true</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="text-3xl font-bold text-orange-600">
                {data.totalResponses + data.completedProgressive}
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-500">Total Real</p>
                <p className="text-xs text-gray-400">Completas + Progressivas</p>
              </div>
            </div>
          </div>
        </div>

        {/* Estatísticas por Campanha */}
        <div className="bg-white rounded-lg shadow mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">📈 Estatísticas por Campanha</h2>
          </div>
          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Campanha
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progressivas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completas Progressivas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Real
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {Object.entries(data.campaignStats).map(([campaign, stats]) => (
                    <tr key={campaign}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {campaign}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stats.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stats.progressive}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {stats.completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {stats.total + stats.completed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Respostas Recentes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Respostas Completas Recentes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">📋 Respostas Completas Recentes</h2>
            </div>
            <div className="p-6">
              {data.recentResponses.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma resposta encontrada</p>
              ) : (
                <div className="space-y-4">
                  {data.recentResponses.map((response) => (
                    <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {response.campaign_id}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(response.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Session: {response.session_id}</p>
                        {response.answers && (
                          <div className="mt-2">
                            {Object.entries(response.answers).map(([q, a]) => (
                              <p key={q} className="truncate">
                                {q}: {getAnswerText(q, a)}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Respostas Progressivas Recentes */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">🔄 Respostas Progressivas Recentes</h2>
            </div>
            <div className="p-6">
              {data.recentProgressive.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhuma resposta encontrada</p>
              ) : (
                <div className="space-y-4">
                  {data.recentProgressive.map((response) => (
                    <div key={response.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-sm font-medium text-gray-900">
                          {response.campaign_id}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(response.timestamp)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        <p>Session: {response.session_id}</p>
                        <p>Pergunta: {response.question_number}</p>
                        <p>Resposta: {getAnswerText(`q${response.question_number}`, response.answer)}</p>
                        <p className={`font-medium ${response.is_complete ? 'text-green-600' : 'text-blue-600'}`}>
                          {response.is_complete ? '✅ Completa' : '🔄 Progressiva'}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Botão de Atualização */}
        <div className="mt-8 text-center">
          <button 
            onClick={fetchData}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            🔄 Atualizar Dados
          </button>
        </div>
      </div>
    </div>
  );
}
