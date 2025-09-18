#!/usr/bin/env python3
"""
Debug da navegação - investigar por que a navegação está falhando
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def debug_navigation():
    """Debug detalhado da navegação"""
    chrome_options = Options()
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=400,300")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        file_path = "creative-v2/sebrae_carousel_300x250_PEQUENOS_NEGOCIOS.html"
        file_url = f"file://{os.path.abspath(file_path)}"
        driver.get(file_url)
        time.sleep(3)
        
        print("🔍 DEBUG DA NAVEGAÇÃO")
        print("=" * 50)
        
        # Estado inicial
        print("📊 ESTADO INICIAL:")
        slides = driver.find_elements(By.CSS_SELECTOR, ".slide")
        print(f"   Total de slides: {len(slides)}")
        
        # Verifica slide atual
        track = driver.find_element(By.CSS_SELECTOR, "#track")
        transform = track.get_attribute("style")
        print(f"   Transform inicial: {transform}")
        
        # Clica no botão inicial
        print("\n🔄 CLICANDO NO BOTÃO INICIAL:")
        start_button = driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
        print(f"   Botão encontrado: {start_button.text}")
        start_button.click()
        time.sleep(2)
        
        # Verifica estado após clique
        transform_after = track.get_attribute("style")
        print(f"   Transform após clique: {transform_after}")
        
        # Verifica header da pergunta
        try:
            header = driver.find_element(By.CSS_SELECTOR, ".header .step")
            print(f"   Header da pergunta: '{header.text}'")
        except:
            print("   ❌ Header não encontrado!")
            
        # Verifica se há opções de rádio
        radios = driver.find_elements(By.CSS_SELECTOR, "input[type='radio']")
        print(f"   Opções de rádio encontradas: {len(radios)}")
        
        # Seleciona uma opção
        if radios:
            print("\n🔄 SELECIONANDO OPÇÃO DE RÁDIO:")
            first_radio = radios[0]
            first_radio.click()
            time.sleep(1)
            print(f"   Rádio selecionado: {first_radio.is_selected()}")
            
            # Tenta navegar para próxima
            print("\n🔄 TENTANDO NAVEGAR PARA PRÓXIMA:")
            try:
                next_button = driver.find_element(By.CSS_SELECTOR, "#next")
                print(f"   Botão 'Próxima' encontrado: {next_button.text}")
                next_button.click()
                time.sleep(2)
                
                # Verifica estado após navegação
                transform_final = track.get_attribute("style")
                print(f"   Transform após navegação: {transform_final}")
                
                # Verifica header da próxima pergunta
                try:
                    header_next = driver.find_element(By.CSS_SELECTOR, ".header .step")
                    print(f"   Header da próxima pergunta: '{header_next.text}'")
                except:
                    print("   ❌ Header da próxima pergunta não encontrado!")
                    
            except Exception as e:
                print(f"   ❌ Erro ao navegar: {str(e)}")
        
        # Verifica JavaScript no console
        print("\n📋 LOGS DO JAVASCRIPT:")
        logs = driver.get_log('browser')
        for log in logs[-5:]:  # Últimos 5 logs
            print(f"   {log['level']}: {log['message']}")
            
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    debug_navigation()
