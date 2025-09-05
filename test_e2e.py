#!/usr/bin/env python3
"""
Teste End-to-End para o Sebrae Survey
Testa a integração completa entre o HTML5 e o backend Cloud Run
"""

import time
import json
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from webdriver_manager.chrome import ChromeDriverManager
import uuid

class SebraeSurveyE2ETest:
    def __init__(self):
        self.base_url = "http://localhost:8080"
        self.api_url = "https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app"
        self.driver = None
        self.test_session_id = str(uuid.uuid4())
        
    def setup_driver(self):
        """Configura o driver do Selenium"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Executa sem interface gráfica
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=400,400")
        chrome_options.add_argument("--disable-gpu")
        chrome_options.add_argument("--disable-extensions")
        
        service = Service(ChromeDriverManager().install())
        self.driver = webdriver.Chrome(service=service, options=chrome_options)
        self.driver.implicitly_wait(10)
        
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
    
    def test_api_collect(self):
        """Testa o endpoint de coleta de dados"""
        print("🔍 Testando endpoint de coleta...")
        test_data = {
            "q1": "sempre",
            "q2": "maioria", 
            "q3": "engajado",
            "q4": "sempre",
            "q5": "muito_agil",
            "q6": "muitas_parcerias",
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
            assert response.status_code == 200
            result = response.json()
            assert result["ok"] == True
            assert result["stored"] == "firestore"
            print("✅ Endpoint de coleta funcionando corretamente")
            return True
        except Exception as e:
            print(f"❌ Erro no endpoint de coleta: {e}")
            return False
    
    def test_html5_survey(self):
        """Testa o HTML5 completo"""
        print("🔍 Testando HTML5 Survey...")
        
        try:
            # Navega para o HTML5
            survey_url = f"{self.base_url}/creative/sebrae_carousel_336x280_API.html"
            self.driver.get(survey_url)
            
            # Aguarda o carregamento
            WebDriverWait(self.driver, 10).until(
                EC.presence_of_element_located((By.CLASS_NAME, "stage"))
            )
            print("✅ HTML5 carregado com sucesso")
            
            # Testa o slide inicial
            self.test_initial_slide()
            
            # Testa navegação entre slides
            self.test_slide_navigation()
            
            # Testa preenchimento das perguntas
            self.test_question_answers()
            
            # Testa envio final
            self.test_final_submission()
            
            return True
            
        except Exception as e:
            print(f"❌ Erro no teste HTML5: {e}")
            return False
    
    def test_initial_slide(self):
        """Testa o slide inicial"""
        print("  📋 Testando slide inicial...")
        
        # Verifica se o slide inicial está visível
        initial_slide = self.driver.find_element(By.CSS_SELECTOR, ".slide:first-child")
        assert initial_slide.is_displayed()
        
        # Verifica se o botão "COMEÇAR" está presente
        start_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
        assert start_button.is_displayed()
        
        # Clica no botão para começar
        start_button.click()
        time.sleep(1)
        
        print("  ✅ Slide inicial funcionando")
    
    def test_slide_navigation(self):
        """Testa a navegação entre slides"""
        print("  📋 Testando navegação entre slides...")
        
        # Verifica se está no slide 1 (primeira pergunta)
        slide_1 = self.driver.find_element(By.CSS_SELECTOR, ".qform[data-q='1']")
        assert slide_1.is_displayed()
        
        # Testa botão "Próxima"
        next_button = self.driver.find_element(By.ID, "next")
        assert next_button.is_displayed()
        
        # Navega para o próximo slide
        next_button.click()
        time.sleep(1)
        
        # Verifica se está no slide 2
        slide_2 = self.driver.find_element(By.CSS_SELECTOR, ".qform[data-q='2']")
        assert slide_2.is_displayed()
        
        print("  ✅ Navegação entre slides funcionando")
    
    def test_question_answers(self):
        """Testa o preenchimento das perguntas"""
        print("  📋 Testando preenchimento das perguntas...")
        
        # Volta para o slide 1
        self.driver.get(f"{self.base_url}/creative/sebrae_carousel_336x280_API.html")
        time.sleep(2)
        
        # Clica para começar
        start_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
        start_button.click()
        time.sleep(1)
        
        # Responde todas as perguntas
        answers = ["sempre", "maioria", "engajado", "sempre", "muito_agil", "muitas_parcerias"]
        
        for i, answer in enumerate(answers, 1):
            # Seleciona a resposta
            radio = self.driver.find_element(By.CSS_SELECTOR, f"input[name='q{i}'][value='{answer}']")
            radio.click()
            time.sleep(0.5)
            
            # Vai para o próximo slide (exceto na última pergunta)
            if i < 6:
                next_button = self.driver.find_element(By.ID, "next")
                next_button.click()
                time.sleep(1)
        
        print("  ✅ Preenchimento das perguntas funcionando")
    
    def test_final_submission(self):
        """Testa o envio final das respostas"""
        print("  📋 Testando envio final...")
        
        # Verifica se está no slide 6 (última pergunta)
        slide_6 = self.driver.find_element(By.CSS_SELECTOR, ".qform[data-q='6']")
        assert slide_6.is_displayed()
        
        # Responde a última pergunta
        radio = self.driver.find_element(By.CSS_SELECTOR, "input[name='q6'][value='muitas_parcerias']")
        radio.click()
        time.sleep(0.5)
        
        # Clica no botão final
        final_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='to-thanks']")
        final_button.click()
        time.sleep(2)
        
        # Verifica se chegou no slide de agradecimento
        thanks_slide = self.driver.find_element(By.CSS_SELECTOR, ".slide:last-child")
        assert thanks_slide.is_displayed()
        
        # Verifica se há um link para os cursos
        course_link = self.driver.find_element(By.CSS_SELECTOR, "a[href*='sebraepr.com.br']")
        assert course_link.is_displayed()
        
        print("  ✅ Envio final funcionando")
    
    def test_console_logs(self):
        """Verifica os logs do console para erros"""
        print("  📋 Verificando logs do console...")
        
        logs = self.driver.get_log('browser')
        errors = [log for log in logs if log['level'] == 'SEVERE']
        
        if errors:
            print(f"  ⚠️  {len(errors)} erros encontrados no console:")
            for error in errors:
                print(f"    - {error['message']}")
        else:
            print("  ✅ Nenhum erro no console")
    
    def cleanup(self):
        """Limpa os recursos"""
        if self.driver:
            self.driver.quit()
    
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 Iniciando Testes End-to-End do Sebrae Survey")
        print("=" * 50)
        
        results = []
        
        try:
            # Setup
            self.setup_driver()
            
            # Testes da API
            results.append(("API Health", self.test_api_health()))
            results.append(("API Collect", self.test_api_collect()))
            
            # Testes do HTML5
            results.append(("HTML5 Survey", self.test_html5_survey()))
            
            # Verificação de logs
            self.test_console_logs()
            
        except Exception as e:
            print(f"❌ Erro geral: {e}")
            results.append(("Erro Geral", False))
        
        finally:
            self.cleanup()
        
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
            print("🎉 Todos os testes passaram! Sistema funcionando perfeitamente.")
            return True
        else:
            print("⚠️  Alguns testes falharam. Verifique os logs acima.")
            return False

if __name__ == "__main__":
    test = SebraeSurveyE2ETest()
    success = test.run_all_tests()
    exit(0 if success else 1)
