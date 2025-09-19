#!/usr/bin/env python3
"""
Teste manual que simula o fluxo do usuário no criativo progressivo
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
from selenium.webdriver.common.action_chains import ActionChains

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

def test_manual_progressive():
    """Testa o criativo progressivo simulando o fluxo manual do usuário"""
    
    # Configurar Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-web-security")
    chrome_options.add_argument("--allow-running-insecure-content")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("🧪 Iniciando teste manual do criativo progressivo...")
        
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
        
        # 4. Simular navegação manual - clicar no botão "Próximo" para avançar
        print("🔄 Simulando navegação manual...")
        
        # Tentar encontrar e clicar no botão "Próximo" várias vezes
        for i in range(6):
            print(f"📝 Navegando para pergunta {i+1}...")
            
            # Procurar por botão "Próximo" ou similar
            try:
                # Tentar diferentes seletores para o botão
                next_button = None
                selectors = [
                    'button[data-action="next"]',
                    'button:contains("Próximo")',
                    '.btn:contains("Próximo")',
                    'button[class*="btn"]',
                    '.bbar button',
                    'button'
                ]
                
                for selector in selectors:
                    try:
                        if ':contains(' in selector:
                            # Para seletores com :contains, usar XPath
                            xpath = f"//button[contains(text(), 'Próximo')]"
                            next_button = driver.find_element(By.XPATH, xpath)
                        else:
                            next_button = driver.find_element(By.CSS_SELECTOR, selector)
                        break
                    except:
                        continue
                
                if next_button:
                    print(f"✅ Botão encontrado: {next_button.get_attribute('outerHTML')[:100]}...")
                    next_button.click()
                    time.sleep(1)
                else:
                    print("⚠️ Botão não encontrado, tentando seta direita...")
                    driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ARROW_RIGHT)
                    time.sleep(1)
                
            except Exception as e:
                print(f"⚠️ Erro na navegação: {e}")
                # Tentar seta direita como fallback
                driver.find_element(By.TAG_NAME, "body").send_keys(Keys.ARROW_RIGHT)
                time.sleep(1)
            
            # Tentar responder a pergunta atual
            try:
                # Procurar por inputs de rádio visíveis
                radio_inputs = driver.find_elements(By.CSS_SELECTOR, 'input[type="radio"]:not([style*="display: none"])')
                print(f"📻 Inputs de rádio visíveis: {len(radio_inputs)}")
                
                if radio_inputs:
                    # Clicar no primeiro input disponível
                    first_radio = radio_inputs[0]
                    name = first_radio.get_attribute('name')
                    value = first_radio.get_attribute('value')
                    print(f"✅ Clicando em: {name} = {value}")
                    
                    # Usar JavaScript para clicar se necessário
                    driver.execute_script("arguments[0].click();", first_radio)
                    time.sleep(2)
                else:
                    print("⚠️ Nenhum input de rádio visível encontrado")
                    
            except Exception as e:
                print(f"⚠️ Erro ao responder: {e}")
        
        # 5. Aguardar processamento final
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

if __name__ == "__main__":
    print("🚀 Iniciando teste manual do criativo progressivo...")
    
    success = test_manual_progressive()
    
    if success:
        print("\n🎉 TESTE PASSOU! Dashboard-v2 está somando corretamente!")
    else:
        print("\n⚠️ TESTE FALHOU! Dashboard-v2 não está somando.")
        print("💡 Verifique se a condição is_complete está funcionando no backend.")
