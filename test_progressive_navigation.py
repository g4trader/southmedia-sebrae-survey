#!/usr/bin/env python3
"""
Teste com navegação correta entre slides
"""

import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

def setup_driver():
    """Configura o driver do Chrome"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    
    driver = webdriver.Chrome(options=chrome_options)
    return driver

def get_responses_count():
    """Busca o número atual de respostas na API"""
    try:
        response = requests.get("https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/responses")
        if response.status_code == 200:
            data = response.json()
            return data.get("count", 0)
        return 0
    except Exception as e:
        print(f"Erro ao buscar contagem de respostas: {e}")
        return 0

def test_progressive_with_navigation():
    """Teste com navegação correta"""
    driver = setup_driver()
    
    try:
        print("🚀 Iniciando teste com navegação...")
        
        # Contar respostas antes
        responses_before = get_responses_count()
        print(f"📊 Respostas antes: {responses_before}")
        
        # Abrir o criativo
        creative_path = "file:///Users/lucianoterres/Documents/GitHub/southmedia-sebrae-survey/creative-v2/sebrae_carousel_336x280_PEQUENOS_NEGOCIOS_PROGRESSIVE.html"
        driver.get(creative_path)
        time.sleep(3)
        
        # Respostas para cada pergunta
        answers = [
            ("q1", "sempre"),      # Q1
            ("q2", "maioria"),     # Q2
            ("q3", "alguma"),      # Q3
            ("q4", "sempre"),      # Q4
            ("q5", "muito_agil"),  # Q5
            ("q6", "muitas_parcerias")  # Q6
        ]
        
        print("📝 Respondendo perguntas com navegação...")
        
        for i, (question_name, answer) in enumerate(answers, 1):
            print(f"   Pergunta {i}: {answer}")
            
            # Aguardar a pergunta aparecer
            try:
                # Aguardar o slide da pergunta estar visível
                WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, f'input[name="{question_name}"]'))
                )
                print(f"   ✅ Slide da pergunta {i} encontrado")
                
                # Selecionar a resposta
                answer_element = driver.find_element(By.CSS_SELECTOR, f'input[name="{question_name}"][value="{answer}"]')
                driver.execute_script("arguments[0].click();", answer_element)
                print(f"   ✅ Pergunta {i} respondida: {answer}")
                
                # Aguardar processamento
                time.sleep(2)
                
                # Se não for a última pergunta, navegar para a próxima
                if i < 6:
                    # Procurar botão "Próximo" ou usar teclado
                    try:
                        next_button = driver.find_element(By.CSS_SELECTOR, '.next')
                        driver.execute_script("arguments[0].click();", next_button)
                        print(f"   ➡️ Navegando para pergunta {i+1}")
                    except NoSuchElementException:
                        # Se não encontrar botão, usar tecla direita
                        from selenium.webdriver.common.keys import Keys
                        driver.find_element(By.TAG_NAME, 'body').send_keys(Keys.ARROW_RIGHT)
                        print(f"   ➡️ Navegando com teclado para pergunta {i+1}")
                    
                    time.sleep(2)
                
                # Se for a última pergunta, aguardar mais tempo
                if i == 6:
                    print("   🎯 Última pergunta respondida - aguardando processamento...")
                    time.sleep(5)
                    
            except Exception as e:
                print(f"   ❌ Erro na pergunta {i}: {e}")
                continue
        
        # Aguardar processamento final
        print("⏳ Aguardando processamento final...")
        time.sleep(5)
        
        # Contar respostas depois
        responses_after = get_responses_count()
        print(f"📊 Respostas depois: {responses_after}")
        
        # Resultado
        if responses_after > responses_before:
            print(f"✅ SUCESSO! Incremento: {responses_after - responses_before}")
            return True
        else:
            print(f"❌ FALHA! Sem incremento")
            return False
            
    except Exception as e:
        print(f"❌ Erro: {e}")
        return False
        
    finally:
        driver.quit()

if __name__ == "__main__":
    test_progressive_with_navigation()
