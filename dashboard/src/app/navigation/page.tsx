'use client';

import Link from 'next/link';
import { ArrowRight, BarChart3, Users, Target, Award } from 'lucide-react';

export default function NavigationPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 flex items-center justify-center">
      <div className="max-w-4xl mx-auto px-4">
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <span className="text-white font-bold text-2xl">SM</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-purple-200 bg-clip-text text-transparent mb-4">
            South Media - Sebrae Survey
          </h1>
          <p className="text-purple-300 text-lg">
            Escolha a versão do dashboard que deseja visualizar
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Dashboard Original */}
          <Link href="/" className="group">
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-lg rounded-3xl border border-purple-500/30 p-8 hover:border-purple-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-8 w-8 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-purple-400 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Dashboard Original</h2>
              <p className="text-purple-300 mb-6">
                Versão atual do dashboard com análise geral das respostas da pesquisa Sebrae.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Análise geral das respostas
                </div>
                <div className="flex items-center text-sm text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Gráficos por pergunta
                </div>
                <div className="flex items-center text-sm text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Análise temporal e de dispositivos
                </div>
                <div className="flex items-center text-sm text-purple-200">
                  <div className="w-2 h-2 bg-purple-400 rounded-full mr-3"></div>
                  Tabela de respostas recentes
                </div>
              </div>
            </div>
          </Link>

          {/* Dashboard V2 */}
          <Link href="/dashboard-v2" className="group">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-lg rounded-3xl border border-blue-500/30 p-8 hover:border-blue-400/50 transition-all duration-300 transform hover:scale-105">
              <div className="flex items-center justify-between mb-6">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <ArrowRight className="h-6 w-6 text-blue-400 group-hover:translate-x-2 transition-transform duration-300" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-4">Dashboard V2 - Por Público</h2>
              <p className="text-blue-300 mb-6">
                Nova versão com análise separada por público e acompanhamento de metas.
              </p>
              <div className="space-y-3">
                <div className="flex items-center text-sm text-blue-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Separação por público (Pequenos Negócios vs Sociedade)
                </div>
                <div className="flex items-center text-sm text-blue-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Gráfico diário com meta vs realizado
                </div>
                <div className="flex items-center text-sm text-blue-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Evolução da meta por público
                </div>
                <div className="flex items-center text-sm text-blue-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Sistema de pontuação por tema
                </div>
                <div className="flex items-center text-sm text-blue-200">
                  <div className="w-2 h-2 bg-blue-400 rounded-full mr-3"></div>
                  Tabela de notas médias
                </div>
              </div>
            </div>
          </Link>
        </div>

        <div className="mt-12 text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl border border-white/20 p-6">
            <h3 className="text-lg font-semibold text-white mb-3">📊 Funcionalidades do Dashboard V2</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-purple-200">
              <div className="flex items-center">
                <Users className="h-4 w-4 mr-2 text-purple-400" />
                Toggle entre públicos
              </div>
              <div className="flex items-center">
                <Target className="h-4 w-4 mr-2 text-purple-400" />
                Meta de 1500 respostas por público
              </div>
              <div className="flex items-center">
                <Award className="h-4 w-4 mr-2 text-purple-400" />
                Sistema de pontuação (10-7-4-0)
              </div>
              <div className="flex items-center">
                <BarChart3 className="h-4 w-4 mr-2 text-purple-400" />
                Análise comparativa por tema
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-purple-400 text-sm">
            💡 <strong>Dica:</strong> O Dashboard V2 implementa todas as melhorias solicitadas pelo cliente, 
            incluindo separação por público, acompanhamento de metas e sistema de pontuação.
          </p>
        </div>
      </div>
    </div>
  );
}
