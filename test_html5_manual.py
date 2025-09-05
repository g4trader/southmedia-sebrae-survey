#!/usr/bin/env python3
"""
Teste Manual do HTML5 do Sebrae Survey
Simula o comportamento do usuário testando a integração com a API
"""

import requests
import json
import uuid
import time
import re

class SebraeSurveyHTML5Test:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.api_url = "https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app"
        self.test_session_id = str(uuid.uuid4())
        
    def test_html5_availability(self):
        """Testa se o HTML5 está disponível"""
        print("🔍 Testando disponibilidade do HTML5...")
        try:
            response = requests.get(f"{self.base_url}/creative/sebrae_carousel_336x280_API.html", timeout=10)
            assert response.status_code == 200
            assert "sebrae" in response.text.lower()
            assert "survey" in response.text.lower() or "pesquisa" in response.text.lower()
            print("✅ HTML5 está disponível e contém conteúdo esperado")
            return True
        except Exception as e:
            print(f"❌ Erro ao acessar HTML5: {e}")
            return False
    
    def test_html5_api_integration(self):
        """Testa se o HTML5 tem a integração com a API configurada"""
        print("🔍 Testando integração da API no HTML5...")
        try:
            response = requests.get(f"{self.base_url}/creative/sebrae_carousel_336x280_API.html", timeout=10)
            html_content = response.text
            
            # Verifica se a URL da API está configurada
            assert self.api_url in html_content
            assert "/collect" in html_content
            
            # Verifica se há JavaScript para envio
            assert "fetch(" in html_content
            assert "POST" in html_content
            assert "application/json" in html_content
            
            # Verifica se há validação de dados
            assert "q1" in html_content
            assert "q2" in html_content
            assert "q3" in html_content
            assert "q4" in html_content
            assert "q5" in html_content
            assert "q6" in html_content
            
            print("✅ HTML5 tem integração com API configurada")
            return True
        except Exception as e:
            print(f"❌ Erro na integração HTML5: {e}")
            return False
    
    def test_html5_questions_content(self):
        """Testa se o HTML5 contém todas as perguntas"""
        print("🔍 Testando conteúdo das perguntas no HTML5...")
        try:
            response = requests.get(f"{self.base_url}/creative/sebrae_carousel_336x280_API.html", timeout=10)
            html_content = response.text
            
            # Verifica se há 6 perguntas
            question_count = html_content.count('data-q="')
            assert question_count >= 6, f"Esperado 6 perguntas, encontrado {question_count}"
            
            # Verifica se há opções de resposta
            radio_count = html_content.count('type="radio"')
            assert radio_count >= 24, f"Esperado pelo menos 24 opções (6 perguntas x 4 opções), encontrado {radio_count}"
            
            # Verifica se há botões de navegação
            assert "COMEÇAR" in html_content or "começar" in html_content
            assert "PRÓXIMA" in html_content or "próxima" in html_content
            
            print("✅ HTML5 contém todas as perguntas e opções")
            return True
        except Exception as e:
            print(f"❌ Erro no conteúdo das perguntas: {e}")
            return False
    
    def test_html5_tracking_parameters(self):
        """Testa se o HTML5 suporta parâmetros de tracking"""
        print("🔍 Testando suporte a parâmetros de tracking...")
        try:
            response = requests.get(f"{self.base_url}/creative/sebrae_carousel_336x280_API.html", timeout=10)
            html_content = response.text
            
            # Verifica se há suporte a parâmetros de tracking
            assert "utm_" in html_content or "campaign" in html_content
            assert "URLSearchParams" in html_content
            assert "querystring" in html_content or "search" in html_content
            
            print("✅ HTML5 suporta parâmetros de tracking")
            return True
        except Exception as e:
            print(f"❌ Erro no suporte a tracking: {e}")
            return False
    
    def test_html5_responsive_design(self):
        """Testa se o HTML5 tem design responsivo"""
        print("🔍 Testando design responsivo...")
        try:
            response = requests.get(f"{self.base_url}/creative/sebrae_carousel_336x280_API.html", timeout=10)
            html_content = response.text
            
            # Verifica se há viewport configurado
            assert "viewport" in html_content
            assert "336" in html_content  # Largura do banner
            assert "280" in html_content  # Altura do banner
            
            # Verifica se há CSS responsivo
            assert "width:" in html_content or "width=" in html_content
            assert "height:" in html_content or "height=" in html_content
            
            print("✅ HTML5 tem design responsivo configurado")
            return True
        except Exception as e:
            print(f"❌ Erro no design responsivo: {e}")
            return False
    
    def test_html5_accessibility(self):
        """Testa se o HTML5 tem recursos de acessibilidade"""
        print("🔍 Testando acessibilidade...")
        try:
            response = requests.get(f"{self.base_url}/creative/sebrae_carousel_336x280_API.html", timeout=10)
            html_content = response.text
            
            # Verifica se há atributos de acessibilidade
            assert "aria-label" in html_content or "role=" in html_content
            assert "alt=" in html_content or "title=" in html_content
            
            # Verifica se há suporte a teclado
            assert "keydown" in html_content or "keyup" in html_content
            
            print("✅ HTML5 tem recursos de acessibilidade")
            return True
        except Exception as e:
            print(f"❌ Erro na acessibilidade: {e}")
            return False
    
    def simulate_user_journey(self):
        """Simula a jornada do usuário"""
        print("🔍 Simulando jornada do usuário...")
        try:
            # Simula dados que seriam enviados pelo HTML5
            user_data = {
                "q1": "sempre",
                "q2": "maioria", 
                "q3": "engajado",
                "q4": "sempre",
                "q5": "muito_agil",
                "q6": "muitas_parcerias",
                "session_id": self.test_session_id,
                "campaign_id": "html5-test",
                "line_item_id": "test-line-item",
                "creative_id": "test-creative",
                "page_url": f"{self.base_url}/creative/sebrae_carousel_336x280_API.html",
                "extra": {
                    "utm_source": "test",
                    "utm_medium": "banner",
                    "utm_campaign": "sebrae-survey"
                }
            }
            
            # Envia dados como se fosse o HTML5
            response = requests.post(
                f"{self.api_url}/collect",
                json=user_data,
                headers={
                    "Content-Type": "application/json",
                    "Origin": self.base_url,
                    "Referer": f"{self.base_url}/creative/sebrae_carousel_336x280_API.html"
                },
                timeout=10
            )
            
            assert response.status_code == 200
            result = response.json()
            assert result["ok"] == True
            assert result["stored"] == "firestore"
            
            print("✅ Jornada do usuário simulada com sucesso")
            print(f"   ID da resposta: {result['id']}")
            return True
        except Exception as e:
            print(f"❌ Erro na simulação: {e}")
            return False
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 Iniciando Testes do HTML5 do Sebrae Survey")
        print("=" * 50)
        
        results = []
        
        # Testes do HTML5
        results.append(("HTML5 Disponibilidade", self.test_html5_availability()))
        results.append(("HTML5 Integração API", self.test_html5_api_integration()))
        results.append(("HTML5 Conteúdo Perguntas", self.test_html5_questions_content()))
        results.append(("HTML5 Tracking", self.test_html5_tracking_parameters()))
        results.append(("HTML5 Design Responsivo", self.test_html5_responsive_design()))
        results.append(("HTML5 Acessibilidade", self.test_html5_accessibility()))
        results.append(("Simulação Jornada Usuário", self.simulate_user_journey()))
        
        # Relatório final
        print("\n" + "=" * 50)
        print("📊 RELATÓRIO FINAL")
        print("=" * 50)
        
        passed = 0
        total = len(results)
        
        for test_name, result in results:
            status = "✅ PASSOU" if result else "❌ FALHOU"
            print(f"{test_name}: {status}")
            if result:
                passed += 1
        
        print(f"\nResultado: {passed}/{total} testes passaram")
        
        if passed == total:
            print("🎉 Todos os testes passaram! HTML5 funcionando perfeitamente.")
            return True
        else:
            print("⚠️  Alguns testes falharam. Verifique os logs acima.")
            return False

if __name__ == "__main__":
    test = SebraeSurveyHTML5Test()
    success = test.run_all_tests()
    exit(0 if success else 1)
