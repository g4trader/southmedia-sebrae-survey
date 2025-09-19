#!/usr/bin/env python3
"""
Teste Selenium usando arquivo local para verificar se o dashboard-v2 está somando corretamente
quando um criativo progressivo é completado
"""

import time
import requests
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.chrome.options import Options

def get_dashboard_count():
    """Pega o contador atual do dashboard-v2"""
    try:
        response = requests.get('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/responses')
        if response.status_code == 200:
            data = response.json()
            return data.get('count', 0)
        return 0
    except Exception as e:
        print(f"Erro ao pegar contador: {e}")
        return 0

def test_progressive_creative_local():
    """Testa o criativo progressivo local e verifica se o dashboard soma"""
    
    # Configurar Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-running-insecure-content")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("🧪 Iniciando teste do criativo progressivo local...")
        
        # 1. Pegar contador inicial do dashboard
        initial_count = get_dashboard_count()
        print(f"📊 Contador inicial do dashboard: {initial_count}")
        
        # 2. Abrir criativo progressivo local
        current_dir = os.path.dirname(os.path.abspath(__file__))
        creative_path = os.path.join(current_dir, "creative-v2", "sebrae_carousel_336x280_PEQUENOS_NEGOCIOS_PROGRESSIVE.html")
        creative_url = f"file://{creative_path}"
        
        print(f"🌐 Abrindo criativo local: {creative_url}")
        driver.get(creative_url)
        
        # Aguardar carregamento
        time.sleep(3)
        
        # 3. Verificar se a página carregou
        title = driver.title
        print(f"📄 Título da página: {title}")
        
        # 4. Navegar pelas perguntas e responder
        questions = [
            ("q1", "sempre"),
            ("q2", "maioria"), 
            ("q3", "alguma"),
            ("q4", "sempre"),
            ("q5", "muito_agil"),
            ("q6", "muitas_parcerias")
        ]
        
        for i, (question_name, answer) in enumerate(questions, 1):
            print(f"📝 Respondendo pergunta {i}: {answer}")
            
            # Aguardar pergunta aparecer
            try:
                question_element = WebDriverWait(driver, 10).until(
                    EC.presence_of_element_located((By.NAME, question_name))
                )
            except:
                print(f"⚠️ Pergunta {i} não encontrada, tentando navegar...")
                # Tentar navegar com setas
                driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ARROW_RIGHT)
                time.sleep(1)
                try:
                    question_element = driver.find_element(By.NAME, question_name)
                except:
                    print(f"❌ Pergunta {i} ainda não encontrada após navegação")
                    continue
            
            # Selecionar resposta
            try:
                answer_element = driver.find_element(By.CSS_SELECTOR, f'input[name="{question_name}"][value="{answer}"]')
                answer_element.click()
                print(f"✅ Pergunta {i} respondida: {answer}")
            except Exception as e:
                print(f"❌ Erro ao responder pergunta {i}: {e}")
                continue
            
            # Aguardar um pouco para a resposta ser enviada
            time.sleep(2)
            
            # Se for a última pergunta, aguardar mais tempo
            if i == 6:
                print("🎯 Última pergunta respondida, aguardando processamento...")
                time.sleep(5)
        
        # 5. Aguardar um pouco mais para garantir que tudo foi processado
        print("⏳ Aguardando processamento final...")
        time.sleep(10)
        
        # 6. Verificar contador final do dashboard
        final_count = get_dashboard_count()
        print(f"📊 Contador final do dashboard: {final_count}")
        
        # 7. Verificar se houve incremento
        if final_count > initial_count:
            print(f"✅ SUCESSO! Dashboard incrementou de {initial_count} para {final_count}")
            print(f"📈 Incremento: +{final_count - initial_count}")
        else:
            print(f"❌ FALHA! Dashboard não incrementou")
            print(f"📊 Contador permaneceu em: {final_count}")
        
        # 8. Verificar logs do console
        print("\n🔍 Verificando logs do console...")
        logs = driver.get_log('browser')
        for log in logs:
            if 'DEBUG' in log['message'] or 'is_complete' in log['message'] or 'error' in log['level'].lower():
                print(f"📝 Console: {log['level']} - {log['message']}")
        
        return final_count > initial_count
        
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        return False
        
    finally:
        driver.quit()

def test_dashboard_direct():
    """Testa o dashboard diretamente"""
    print("\n🧪 Testando dashboard diretamente...")
    
    try:
        # Testar endpoint de respostas
        response = requests.get('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/responses')
        print(f"📡 Status da API: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"📊 Total de respostas: {data.get('count', 0)}")
            print(f"📋 Respostas: {len(data.get('responses', []))}")
            
            # Verificar se há respostas recentes
            responses = data.get('responses', [])
            if responses:
                latest = responses[0]
                print(f"🕒 Última resposta: {latest.get('timestamp')}")
                print(f"🆔 Session ID: {latest.get('session_id')}")
                print(f"✅ Completa: {latest.get('metadata', {}).get('is_complete')}")
        
        return True
        
    except Exception as e:
        print(f"❌ Erro ao testar dashboard: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Iniciando testes de verificação do dashboard-v2 com arquivo local...")
    
    # Teste 1: Dashboard direto
    dashboard_ok = test_dashboard_direct()
    
    # Teste 2: Criativo progressivo local
    creative_ok = test_progressive_creative_local()
    
    print(f"\n📋 RESUMO DOS TESTES:")
    print(f"📊 Dashboard direto: {'✅ OK' if dashboard_ok else '❌ FALHA'}")
    print(f"🎯 Criativo progressivo local: {'✅ OK' if creative_ok else '❌ FALHA'}")
    
    if creative_ok:
        print("\n🎉 TESTE PASSOU! Dashboard-v2 está somando corretamente!")
    else:
        print("\n⚠️ TESTE FALHOU! Dashboard-v2 não está somando.")
        print("💡 Verifique se a condição is_complete está funcionando no backend.")
