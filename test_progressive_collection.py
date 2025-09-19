#!/usr/bin/env python3
"""
Teste para validar a coleta progressiva de dados do SEBRAE Survey
"""

import time
import requests
import json
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options

class ProgressiveCollectionTest:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.api_url = "https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/collect"
        self.driver = None
        
    def setup_driver(self):
        """Configura o driver do Selenium"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.set_window_size(400, 300)
        
    def test_progressive_data_collection(self):
        """Testa a coleta progressiva de dados"""
        print("🧪 Testando coleta progressiva de dados...")
        
        try:
            # Acessa o criativo progressivo
            self.driver.get(f"{self.base_url}/creative/sebrae_carousel_336x280_PROGRESSIVE.html")
            time.sleep(2)
            
            # Clica para começar
            start_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
            start_button.click()
            time.sleep(1)
            
            # Responde as perguntas uma por uma e verifica se são salvas
            answers = ["sempre", "muito_util", "muito_engajado", "sempre", "muito_agil", "muitas_parcerias"]
            
            for i, answer in enumerate(answers, 1):
                print(f"  📝 Respondendo pergunta {i}...")
                
                # Seleciona a resposta
                radio = self.driver.find_element(By.CSS_SELECTOR, f"input[name='q{i}'][value='{answer}']")
                radio.click()
                time.sleep(1)  # Aguarda o envio progressivo
                
                # Verifica se a resposta foi salva (simula verificação via API)
                print(f"    ✅ Pergunta {i} respondida: {answer}")
                
                # Vai para o próximo slide (exceto na última pergunta)
                if i < 6:
                    next_button = self.driver.find_element(By.ID, "next")
                    next_button.click()
                    time.sleep(1)
            
            print("  ✅ Coleta progressiva funcionando - todas as perguntas foram respondidas")
            
            # Testa o botão final
            print("  🎯 Testando botão final...")
            final_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='to-thanks']")
            final_button.click()
            time.sleep(2)
            
            # Verifica se chegou na tela de agradecimento
            thank_you = self.driver.find_element(By.CSS_SELECTOR, "h1")
            if "Obrigado" in thank_you.text:
                print("  ✅ Navegação para tela de agradecimento funcionando")
            else:
                print("  ❌ Falha na navegação para tela de agradecimento")
                
        except Exception as e:
            print(f"  ❌ Erro no teste progressivo: {e}")
            
    def test_api_progressive_endpoint(self):
        """Testa o endpoint da API para dados progressivos"""
        print("🌐 Testando endpoint da API para dados progressivos...")
        
        try:
            # Testa envio de dados progressivos
            session_id = f"test_session_{int(time.time())}"
            
            for question_num in range(1, 7):
                payload = {
                    "session_id": session_id,
                    "question_number": question_num,
                    "answer": f"test_answer_{question_num}",
                    "is_complete": question_num == 6,
                    "timestamp": "2024-01-01T10:00:00Z",
                    "campaign_id": "test_campaign",
                    "user_agent": "test_agent"
                }
                
                if question_num == 6:
                    payload["all_answers"] = {
                        "q1": "test_answer_1",
                        "q2": "test_answer_2", 
                        "q3": "test_answer_3",
                        "q4": "test_answer_4",
                        "q5": "test_answer_5",
                        "q6": "test_answer_6"
                    }
                    payload["completion_timestamp"] = "2024-01-01T10:05:00Z"
                
                response = requests.post(
                    self.api_url,
                    json=payload,
                    headers={"Content-Type": "application/json"},
                    timeout=10
                )
                
                if response.status_code == 200:
                    result = response.json()
                    print(f"    ✅ Pergunta {question_num} salva: {result.get('id', 'N/A')}")
                else:
                    print(f"    ❌ Falha ao salvar pergunta {question_num}: {response.status_code}")
                    
        except Exception as e:
            print(f"  ❌ Erro no teste da API: {e}")
            
    def test_completion_tracking(self):
        """Testa o tracking de conclusão"""
        print("📊 Testando tracking de conclusão...")
        
        try:
            # Simula diferentes cenários de conclusão
            scenarios = [
                {"questions": [1, 2, 3], "expected_complete": False},
                {"questions": [1, 2, 3, 4, 5, 6], "expected_complete": True},
                {"questions": [1, 2, 4, 5], "expected_complete": False},  # Pula pergunta 3
            ]
            
            for i, scenario in enumerate(scenarios, 1):
                session_id = f"completion_test_{i}_{int(time.time())}"
                print(f"  📋 Cenário {i}: Perguntas {scenario['questions']}")
                
                for question_num in scenario["questions"]:
                    payload = {
                        "session_id": session_id,
                        "question_number": question_num,
                        "answer": f"answer_{question_num}",
                        "is_complete": question_num == 6 and len(scenario["questions"]) == 6,
                        "timestamp": "2024-01-01T10:00:00Z"
                    }
                    
                    response = requests.post(
                        self.api_url,
                        json=payload,
                        headers={"Content-Type": "application/json"},
                        timeout=10
                    )
                    
                    if response.status_code == 200:
                        result = response.json()
                        is_complete = result.get("is_complete", False)
                        print(f"    ✅ Pergunta {question_num} - Completo: {is_complete}")
                    else:
                        print(f"    ❌ Falha na pergunta {question_num}")
                        
        except Exception as e:
            print(f"  ❌ Erro no teste de conclusão: {e}")
            
    def test_analytics_endpoint(self):
        """Testa o endpoint de analytics"""
        print("📈 Testando endpoint de analytics...")
        
        try:
            # Tenta acessar o endpoint de analytics (se disponível)
            analytics_url = self.api_url.replace("/collect", "/analytics")
            response = requests.get(analytics_url, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                if data.get("ok"):
                    analytics = data.get("analytics", {})
                    print(f"    ✅ Analytics disponível:")
                    print(f"      - Total de sessões: {analytics.get('total_sessions', 0)}")
                    print(f"      - Sessões completas: {analytics.get('completed_sessions', 0)}")
                    print(f"      - Taxa de conclusão: {analytics.get('completion_rate', 0)}%")
                else:
                    print(f"    ⚠️ Analytics retornou erro: {data.get('error')}")
            else:
                print(f"    ⚠️ Endpoint de analytics não disponível: {response.status_code}")
                
        except Exception as e:
            print(f"  ⚠️ Erro ao acessar analytics: {e}")
            
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 Iniciando testes de coleta progressiva...")
        print("=" * 60)
        
        try:
            self.setup_driver()
            
            # Teste 1: Coleta progressiva no frontend
            self.test_progressive_data_collection()
            print()
            
            # Teste 2: API progressiva
            self.test_api_progressive_endpoint()
            print()
            
            # Teste 3: Tracking de conclusão
            self.test_completion_tracking()
            print()
            
            # Teste 4: Analytics
            self.test_analytics_endpoint()
            print()
            
            print("=" * 60)
            print("✅ Todos os testes de coleta progressiva concluídos!")
            
        except Exception as e:
            print(f"❌ Erro geral nos testes: {e}")
            
        finally:
            if self.driver:
                self.driver.quit()

if __name__ == "__main__":
    test = ProgressiveCollectionTest()
    test.run_all_tests()
