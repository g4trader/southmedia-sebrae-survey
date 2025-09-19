#!/usr/bin/env python3
"""
Teste detalhado com captura de logs do console
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
    """Configura o driver do Chrome com logs"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--window-size=1920,1080")
    chrome_options.add_argument("--enable-logging")
    chrome_options.add_argument("--log-level=0")
    
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

def test_progressive_detailed():
    """Teste detalhado do criativo progressivo"""
    driver = setup_driver()
    
    try:
        print("🚀 Iniciando teste detalhado...")
        
        # Contar respostas antes
        responses_before = get_responses_count()
        print(f"📊 Respostas antes: {responses_before}")
        
        # Abrir o criativo
        creative_path = "file:///Users/lucianoterres/Documents/GitHub/southmedia-sebrae-survey/creative-v2/sebrae_carousel_336x280_PEQUENOS_NEGOCIOS_PROGRESSIVE.html"
        driver.get(creative_path)
        time.sleep(3)
        
        # Habilitar logs do console
        driver.execute_script("console.log('🔧 Logs habilitados')")
        
        # Respostas
        answers = ["sempre", "maioria", "alguma", "sempre", "muito_agil", "muitas_parcerias"]
        
        print("📝 Respondendo perguntas com logs...")
        
        for i, answer in enumerate(answers, 1):
            print(f"   Pergunta {i}: {answer}")
            
            # Aguardar e clicar
            try:
                answer_element = WebDriverWait(driver, 10).until(
                    EC.element_to_be_clickable((By.CSS_SELECTOR, f'input[name="q{i}"][value="{answer}"]'))
                )
                driver.execute_script("arguments[0].click();", answer_element)
                print(f"   ✅ Pergunta {i} clicada")
                
                # Aguardar e capturar logs
                time.sleep(2)
                
                # Capturar logs do console
                logs = driver.get_log('browser')
                for log in logs:
                    if 'Pergunta' in log['message'] or 'Última pergunta' in log['message'] or 'salva progressivamente' in log['message']:
                        print(f"   📋 Console: {log['message']}")
                
                # Se for a última pergunta, aguardar mais
                if i == 6:
                    print("   🎯 Última pergunta - aguardando processamento...")
                    time.sleep(5)
                    
                    # Capturar mais logs
                    logs = driver.get_log('browser')
                    for log in logs:
                        if 'Última pergunta' in log['message'] or 'dados completos' in log['message'] or 'salva progressivamente' in log['message']:
                            print(f"   📋 Console Final: {log['message']}")
                            
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
    test_progressive_detailed()
