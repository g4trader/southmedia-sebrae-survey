#!/usr/bin/env python3
"""
Debug detalhado - investigar cada problema específico
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def debug_detailed():
    """Debug detalhado de cada problema"""
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
        
        print("🔍 DEBUG DETALHADO - INVESTIGAÇÃO COMPLETA")
        print("=" * 60)
        
        # 1. Verificar estado inicial
        print("📊 1. ESTADO INICIAL:")
        slides = driver.find_elements(By.CSS_SELECTOR, ".slide")
        print(f"   Total de slides: {len(slides)}")
        
        for i, slide in enumerate(slides):
            slide_kind = slide.get_attribute("data-kind") or "normal"
            print(f"   Slide {i}: tipo '{slide_kind}'")
        
        # 2. Navegar para primeira pergunta
        print("\n🔄 2. NAVEGANDO PARA PRIMEIRA PERGUNTA:")
        start_button = driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
        start_button.click()
        time.sleep(2)
        
        # Verificar estado após navegação
        track = driver.find_element(By.CSS_SELECTOR, "#track")
        transform = track.get_attribute("style")
        print(f"   Transform: {transform}")
        
        # Verificar slide atual
        current_slide = driver.find_element(By.CSS_SELECTOR, ".slide")
        slide_content = current_slide.get_attribute("outerHTML")[:200] + "..."
        print(f"   Conteúdo do slide atual: {slide_content}")
        
        # 3. Verificar elementos da primeira pergunta
        print("\n🔍 3. ELEMENTOS DA PRIMEIRA PERGUNTA:")
        try:
            header = driver.find_element(By.CSS_SELECTOR, ".header .step")
            print(f"   Header: '{header.text}'")
        except:
            print("   ❌ Header não encontrado!")
            
        try:
            question = driver.find_element(By.CSS_SELECTOR, ".q")
            print(f"   Pergunta: '{question.text[:50]}...'")
        except:
            print("   ❌ Pergunta não encontrada!")
            
        try:
            radios = driver.find_elements(By.CSS_SELECTOR, "input[type='radio']")
            print(f"   Opções de rádio: {len(radios)}")
        except:
            print("   ❌ Opções de rádio não encontradas!")
        
        # 4. Selecionar opção e tentar navegar
        print("\n🔄 4. SELECIONANDO OPÇÃO E NAVEGANDO:")
        try:
            # Clica no primeiro label
            first_label = driver.find_element(By.CSS_SELECTOR, "label.opt")
            first_label.click()
            time.sleep(1)
            
            # Verifica se foi selecionado
            first_radio = driver.find_element(By.CSS_SELECTOR, "input[name='q1']")
            print(f"   Rádio selecionado: {first_radio.is_selected()}")
            
            # Tenta navegar para próxima
            next_button = driver.find_element(By.CSS_SELECTOR, "#next")
            print(f"   Botão 'Próxima' encontrado: {next_button.text}")
            print(f"   Botão habilitado: {not next_button.get_attribute('disabled')}")
            
            next_button.click()
            time.sleep(2)
            
            # Verifica estado após navegação
            transform_after = track.get_attribute("style")
            print(f"   Transform após navegação: {transform_after}")
            
            # Verifica slide atual
            current_slide_after = driver.find_element(By.CSS_SELECTOR, ".slide")
            slide_content_after = current_slide_after.get_attribute("outerHTML")[:200] + "..."
            print(f"   Conteúdo do slide após navegação: {slide_content_after}")
            
            # Verifica header da próxima pergunta
            try:
                header_after = driver.find_element(By.CSS_SELECTOR, ".header .step")
                print(f"   Header após navegação: '{header_after.text}'")
            except:
                print("   ❌ Header após navegação não encontrado!")
                
        except Exception as e:
            print(f"   ❌ Erro na navegação: {str(e)}")
        
        # 5. Verificar JavaScript
        print("\n📋 5. LOGS DO JAVASCRIPT:")
        logs = driver.get_log('browser')
        for log in logs[-10:]:  # Últimos 10 logs
            print(f"   {log['level']}: {log['message']}")
        
        # 6. Verificar botão final
        print("\n🔍 6. VERIFICANDO BOTÃO FINAL:")
        try:
            # Navegar para o slide final
            # Primeiro, vamos tentar chegar no slide final manualmente
            for i in range(10):  # Máximo 10 tentativas
                try:
                    next_btn = driver.find_element(By.CSS_SELECTOR, "#next")
                    if next_btn.is_enabled():
                        next_btn.click()
                        time.sleep(1)
                    else:
                        break
                except:
                    break
            
            # Verificar se chegou no slide final
            final_buttons = driver.find_elements(By.CSS_SELECTOR, "a.button")
            print(f"   Botões com tag <a> encontrados: {len(final_buttons)}")
            
            for i, btn in enumerate(final_buttons):
                href = btn.get_attribute("href")
                text = btn.text.strip()
                print(f"   Botão {i+1}: href='{href}', text='{text}'")
                
        except Exception as e:
            print(f"   ❌ Erro ao verificar botão final: {str(e)}")
            
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    debug_detailed()
