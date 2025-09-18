#!/usr/bin/env python3
"""
Debug do fluxo simples - testar passo a passo
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def debug_simple_flow():
    """Debug do fluxo simples"""
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
        
        print("🔍 DEBUG DO FLUXO SIMPLES")
        print("=" * 60)
        
        # Passo 1: Clicar no botão inicial
        print("📝 PASSO 1: Clicar no botão inicial")
        start_button = driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
        start_button.click()
        time.sleep(2)
        
        # Verificar se mudou para primeira pergunta
        track = driver.find_element(By.CSS_SELECTOR, "#track")
        transform = track.get_attribute("style")
        print(f"   Transform: {transform}")
        
        # Passo 2: Selecionar primeira opção
        print("\n📝 PASSO 2: Selecionar primeira opção")
        first_label = driver.find_element(By.CSS_SELECTOR, "label.opt")
        first_label.click()
        time.sleep(1)
        
        # Verificar se foi selecionado
        first_radio = driver.find_element(By.CSS_SELECTOR, "input[name='q1']")
        print(f"   Rádio selecionado: {first_radio.is_selected()}")
        
        # Passo 3: Clicar em "Próxima"
        print("\n📝 PASSO 3: Clicar em 'Próxima'")
        next_button = driver.find_element(By.CSS_SELECTOR, "#next")
        print(f"   Botão encontrado: {next_button.text}")
        print(f"   Botão habilitado: {next_button.is_enabled()}")
        print(f"   Botão visível: {next_button.is_displayed()}")
        
        # Verificar se o botão está realmente clicável
        try:
            next_button.click()
            print("   ✅ Clique bem-sucedido")
            time.sleep(2)
        except Exception as e:
            print(f"   ❌ Erro no clique: {str(e)}")
            
            # Tentar clicar com JavaScript
            try:
                driver.execute_script("arguments[0].click();", next_button)
                print("   ✅ Clique com JavaScript bem-sucedido")
                time.sleep(2)
            except Exception as e2:
                print(f"   ❌ Erro no clique com JavaScript: {str(e2)}")
        
        # Verificar estado após clique
        transform_after = track.get_attribute("style")
        print(f"   Transform após clique: {transform_after}")
        
        # Verificar se mudou para segunda pergunta
        print("\n📝 PASSO 4: Verificar segunda pergunta")
        try:
            # Usar seletor mais específico para o slide atual
            current_slide = driver.find_element(By.CSS_SELECTOR, ".slide:nth-child(3)")
            header = current_slide.find_element(By.CSS_SELECTOR, ".header .step")
            print(f"   Header da segunda pergunta: '{header.text}'")
            
            # Verificar se tem opções de rádio
            radios = current_slide.find_elements(By.CSS_SELECTOR, "input[type='radio']")
            print(f"   Opções de rádio na segunda pergunta: {len(radios)}")
            
        except Exception as e:
            print(f"   ❌ Erro ao verificar segunda pergunta: {str(e)}")
        
        # Passo 5: Tentar continuar o fluxo
        print("\n📝 PASSO 5: Continuar o fluxo")
        try:
            # Selecionar primeira opção da segunda pergunta
            second_label = driver.find_element(By.CSS_SELECTOR, ".slide:nth-child(3) label.opt")
            second_label.click()
            time.sleep(1)
            
            # Clicar em próxima novamente
            next_button2 = driver.find_element(By.CSS_SELECTOR, "#next")
            next_button2.click()
            time.sleep(2)
            
            print("   ✅ Fluxo continuou com sucesso")
            
        except Exception as e:
            print(f"   ❌ Erro ao continuar fluxo: {str(e)}")
        
        # Verificar logs do JavaScript
        print("\n📋 LOGS DO JAVASCRIPT:")
        logs = driver.get_log('browser')
        for log in logs[-5:]:
            print(f"   {log['level']}: {log['message']}")
            
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    debug_simple_flow()
