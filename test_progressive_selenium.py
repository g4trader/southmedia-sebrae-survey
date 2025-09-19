#!/usr/bin/env python3
"""
Teste Selenium para verificar se o criativo progressivo está funcionando
e se os dados estão sendo salvos corretamente no dashboard-v2
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
    chrome_options.add_argument("--headless")  # Executar sem interface gráfica
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

def test_progressive_creative():
    """Testa o criativo progressivo"""
    driver = setup_driver()
    
    try:
        print("🚀 Iniciando teste do criativo progressivo...")
        
        # Contar respostas antes do teste
        responses_before = get_responses_count()
        print(f"📊 Respostas antes do teste: {responses_before}")
        
        # Abrir o criativo progressivo
        creative_path = "file:///Users/lucianoterres/Documents/GitHub/southmedia-sebrae-survey/creative-v2/sebrae_carousel_336x280_PEQUENOS_NEGOCIOS_PROGRESSIVE.html"
        print(f"🌐 Abrindo criativo: {creative_path}")
        driver.get(creative_path)
        
        # Aguardar o carregamento
        time.sleep(3)
        
        # Respostas para as perguntas
        answers = [
            "sempre",      # Q1
            "maioria",     # Q2
            "alguma",      # Q3
            "sempre",      # Q4
            "muito_agil",  # Q5
            "muitas_parcerias"  # Q6
        ]
        
        print("📝 Respondendo perguntas...")
        
        # Responder cada pergunta
        for i, answer in enumerate(answers, 1):
            print(f"   Pergunta {i}: {answer}")
            
            # Aguardar a pergunta aparecer
            try:
                question_element = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.CSS_SELECTOR, f'input[name="q{i}"]'))
                )
            except TimeoutException:
                print(f"   ❌ Pergunta {i} não encontrada")
                continue
            
            # Selecionar a resposta
            try:
                answer_element = driver.find_element(By.CSS_SELECTOR, f'input[name="q{i}"][value="{answer}"]')
                driver.execute_script("arguments[0].click();", answer_element)
                print(f"   ✅ Pergunta {i} respondida")
                
                # Aguardar um pouco para a resposta ser processada
                time.sleep(2)
                
                # Se for a última pergunta, verificar se foi salva
                if i == 6:
                    print("   🎯 Última pergunta respondida - verificando se foi salva...")
                    time.sleep(3)  # Aguardar mais tempo para processamento
                    
            except NoSuchElementException:
                print(f"   ❌ Resposta '{answer}' não encontrada para pergunta {i}")
                continue
        
        print("⏳ Aguardando processamento final...")
        time.sleep(5)
        
        # Contar respostas depois do teste
        responses_after = get_responses_count()
        print(f"📊 Respostas depois do teste: {responses_after}")
        
        # Verificar se houve incremento
        if responses_after > responses_before:
            print(f"✅ SUCESSO! Respostas incrementaram de {responses_before} para {responses_after}")
            return True
        else:
            print(f"❌ FALHA! Respostas não incrementaram ({responses_before} -> {responses_after})")
            return False
            
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        return False
        
    finally:
        driver.quit()

def test_dashboard_v2():
    """Testa se o dashboard-v2 está funcionando"""
    driver = setup_driver()
    
    try:
        print("🌐 Testando dashboard-v2...")
        driver.get("https://southmedia-sebrae-survey-te5d.vercel.app/dashboard-v2")
        
        # Aguardar carregamento
        time.sleep(10)
        
        # Verificar se o dashboard carregou
        try:
            WebDriverWait(driver, 15).until(
                EC.presence_of_element_located((By.CSS_SELECTOR, "[class*='text-4xl']"))
            )
            print("✅ Dashboard-v2 carregou com sucesso")
            
            # Capturar screenshot
            driver.save_screenshot("dashboard_v2_test.png")
            print("📸 Screenshot salvo como 'dashboard_v2_test.png'")
            
            return True
            
        except TimeoutException:
            print("❌ Dashboard-v2 não carregou dentro do tempo limite")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao testar dashboard-v2: {e}")
        return False
        
    finally:
        driver.quit()

def main():
    """Função principal"""
    print("🧪 INICIANDO TESTES AUTOMATIZADOS")
    print("=" * 50)
    
    # Teste 1: Dashboard-v2
    print("\n1️⃣ Testando Dashboard-v2...")
    dashboard_ok = test_dashboard_v2()
    
    # Teste 2: Criativo Progressivo
    print("\n2️⃣ Testando Criativo Progressivo...")
    creative_ok = test_progressive_creative()
    
    # Resultado final
    print("\n" + "=" * 50)
    print("📋 RESULTADO DOS TESTES:")
    print(f"   Dashboard-v2: {'✅ OK' if dashboard_ok else '❌ FALHA'}")
    print(f"   Criativo Progressivo: {'✅ OK' if creative_ok else '❌ FALHA'}")
    
    if dashboard_ok and creative_ok:
        print("\n🎉 TODOS OS TESTES PASSARAM!")
    else:
        print("\n⚠️ ALGUNS TESTES FALHARAM!")

if __name__ == "__main__":
    main()
