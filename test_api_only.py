#!/usr/bin/env python3
"""
Teste da API do Sebrae Survey
Testa apenas a integração com o backend Cloud Run
"""

import requests
import json
import uuid
import time

class SebraeSurveyAPITest:
    def __init__(self):
        self.api_url = "https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app"
        self.test_session_id = str(uuid.uuid4())
        
    def test_api_health(self):
        """Testa se a API está funcionando"""
        print("🔍 Testando saúde da API...")
        try:
            response = requests.get(f"{self.api_url}/", timeout=10)
            assert response.status_code == 200
            assert response.text.strip() == "OK"
            print("✅ API está funcionando corretamente")
            return True
        except Exception as e:
            print(f"❌ Erro na API: {e}")
            return False
    
    def test_api_collect_valid_data(self):
        """Testa o endpoint de coleta com dados válidos"""
        print("🔍 Testando endpoint de coleta com dados válidos...")
        test_data = {
            "q1": "sempre",
            "q2": "maioria", 
            "q3": "engajado",
            "q4": "sempre",
            "q5": "muito_agil",
            "q6": "muitas_parcerias",
            "session_id": self.test_session_id,
            "campaign_id": "test-e2e",
            "line_item_id": "test-line-item",
            "creative_id": "test-creative",
            "page_url": "https://example.com",
            "extra": {
                "utm_source": "test",
                "utm_medium": "banner",
                "utm_campaign": "sebrae-survey"
            }
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/collect",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            assert response.status_code == 200
            result = response.json()
            assert result["ok"] == True
            assert result["stored"] == "firestore"
            assert "id" in result
            print("✅ Endpoint de coleta funcionando com dados válidos")
            print(f"   ID da resposta: {result['id']}")
            return True
        except Exception as e:
            print(f"❌ Erro no endpoint de coleta: {e}")
            return False
    
    def test_api_collect_missing_data(self):
        """Testa o endpoint de coleta com dados faltando"""
        print("🔍 Testando endpoint de coleta com dados faltando...")
        test_data = {
            "q1": "sempre",
            "q2": "maioria", 
            # q3, q4, q5, q6 faltando
            "session_id": self.test_session_id,
            "campaign_id": "test-e2e"
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/collect",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            assert response.status_code == 400
            result = response.json()
            assert result["ok"] == False
            assert "missing" in result
            assert "q3" in result["missing"]
            assert "q4" in result["missing"]
            assert "q5" in result["missing"]
            assert "q6" in result["missing"]
            print("✅ Validação de dados faltando funcionando")
            return True
        except Exception as e:
            print(f"❌ Erro na validação: {e}")
            return False
    
    def test_api_collect_cors(self):
        """Testa CORS"""
        print("🔍 Testando CORS...")
        test_data = {
            "q1": "sempre",
            "q2": "maioria", 
            "q3": "engajado",
            "q4": "sempre",
            "q5": "muito_agil",
            "q6": "muitas_parcerias",
            "session_id": self.test_session_id,
            "campaign_id": "test-cors"
        }
        
        try:
            response = requests.post(
                f"{self.api_url}/collect",
                json=test_data,
                headers={
                    "Content-Type": "application/json",
                    "Origin": "https://example.com"
                },
                timeout=10
            )
            assert response.status_code == 200
            assert "Access-Control-Allow-Origin" in response.headers
            print("✅ CORS configurado corretamente")
            return True
        except Exception as e:
            print(f"❌ Erro no CORS: {e}")
            return False
    
    def test_api_collect_options(self):
        """Testa preflight OPTIONS"""
        print("🔍 Testando preflight OPTIONS...")
        try:
            response = requests.options(
                f"{self.api_url}/collect",
                headers={
                    "Origin": "https://example.com",
                    "Access-Control-Request-Method": "POST",
                    "Access-Control-Request-Headers": "Content-Type"
                },
                timeout=10
            )
            assert response.status_code == 204
            assert "Access-Control-Allow-Origin" in response.headers
            assert "Access-Control-Allow-Methods" in response.headers
            print("✅ Preflight OPTIONS funcionando")
            return True
        except Exception as e:
            print(f"❌ Erro no preflight: {e}")
            return False
    
    def test_api_performance(self):
        """Testa performance da API"""
        print("🔍 Testando performance da API...")
        test_data = {
            "q1": "sempre",
            "q2": "maioria", 
            "q3": "engajado",
            "q4": "sempre",
            "q5": "muito_agil",
            "q6": "muitas_parcerias",
            "session_id": str(uuid.uuid4()),
            "campaign_id": "test-performance"
        }
        
        try:
            start_time = time.time()
            response = requests.post(
                f"{self.api_url}/collect",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            end_time = time.time()
            
            response_time = end_time - start_time
            assert response.status_code == 200
            assert response_time < 5.0  # Deve responder em menos de 5 segundos
            
            print(f"✅ Performance OK - Tempo de resposta: {response_time:.2f}s")
            return True
        except Exception as e:
            print(f"❌ Erro na performance: {e}")
            return False
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 Iniciando Testes da API do Sebrae Survey")
        print("=" * 50)
        
        results = []
        
        # Testes da API
        results.append(("API Health", self.test_api_health()))
        results.append(("API Collect (dados válidos)", self.test_api_collect_valid_data()))
        results.append(("API Collect (dados faltando)", self.test_api_collect_missing_data()))
        results.append(("CORS", self.test_api_collect_cors()))
        results.append(("Preflight OPTIONS", self.test_api_collect_options()))
        results.append(("Performance", self.test_api_performance()))
        
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
            print("🎉 Todos os testes passaram! API funcionando perfeitamente.")
            return True
        else:
            print("⚠️  Alguns testes falharam. Verifique os logs acima.")
            return False

if __name__ == "__main__":
    test = SebraeSurveyAPITest()
    success = test.run_all_tests()
    exit(0 if success else 1)
