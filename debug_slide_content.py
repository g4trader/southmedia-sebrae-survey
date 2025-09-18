#!/usr/bin/env python3
"""
Debug do conteúdo dos slides - investigar por que o header fica vazio
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def debug_slide_content():
    """Debug do conteúdo específico de cada slide"""
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
        
        print("🔍 DEBUG DO CONTEÚDO DOS SLIDES")
        print("=" * 60)
        
        # Navegar para primeira pergunta
        start_button = driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
        start_button.click()
        time.sleep(2)
        
        # Verificar slide 1 (primeira pergunta)
        print("📊 SLIDE 1 (Primeira pergunta):")
        slide1 = driver.find_elements(By.CSS_SELECTOR, ".slide")[1]
        slide1_html = slide1.get_attribute("outerHTML")
        
        # Procurar por elementos específicos
        if "Pergunta 1 de 6" in slide1_html:
            print("   ✅ Contém 'Pergunta 1 de 6'")
        else:
            print("   ❌ NÃO contém 'Pergunta 1 de 6'")
            
        if "q1" in slide1_html:
            print("   ✅ Contém 'q1'")
        else:
            print("   ❌ NÃO contém 'q1'")
        
        # Selecionar opção e navegar
        first_label = driver.find_element(By.CSS_SELECTOR, "label.opt")
        first_label.click()
        time.sleep(1)
        
        next_button = driver.find_element(By.CSS_SELECTOR, "#next")
        next_button.click()
        time.sleep(2)
        
        # Verificar slide 2 (segunda pergunta)
        print("\n📊 SLIDE 2 (Segunda pergunta):")
        slide2 = driver.find_elements(By.CSS_SELECTOR, ".slide")[2]
        slide2_html = slide2.get_attribute("outerHTML")
        
        # Procurar por elementos específicos
        if "Pergunta 2 de 6" in slide2_html:
            print("   ✅ Contém 'Pergunta 2 de 6'")
        else:
            print("   ❌ NÃO contém 'Pergunta 2 de 6'")
            
        if "q2" in slide2_html:
            print("   ✅ Contém 'q2'")
        else:
            print("   ❌ NÃO contém 'q2'")
        
        # Verificar se o slide 2 tem a estrutura correta
        print("\n🔍 ESTRUTURA DO SLIDE 2:")
        try:
            header = slide2.find_element(By.CSS_SELECTOR, ".header .step")
            print(f"   Header encontrado: '{header.text}'")
        except:
            print("   ❌ Header não encontrado no slide 2")
            
        try:
            question = slide2.find_element(By.CSS_SELECTOR, ".q")
            print(f"   Pergunta encontrada: '{question.text[:50]}...'")
        except:
            print("   ❌ Pergunta não encontrada no slide 2")
            
        try:
            radios = slide2.find_elements(By.CSS_SELECTOR, "input[type='radio']")
            print(f"   Opções de rádio encontradas: {len(radios)}")
        except:
            print("   ❌ Opções de rádio não encontradas no slide 2")
        
        # Verificar se o problema é com o seletor
        print("\n🔍 TESTANDO SELETORES ALTERNATIVOS:")
        try:
            # Tentar seletores mais específicos
            header_alt = driver.find_element(By.CSS_SELECTOR, ".slide:nth-child(3) .header .step")
            print(f"   Header com seletor alternativo: '{header_alt.text}'")
        except:
            print("   ❌ Header com seletor alternativo não encontrado")
            
        try:
            # Verificar todos os headers visíveis
            all_headers = driver.find_elements(By.CSS_SELECTOR, ".header .step")
            print(f"   Total de headers encontrados: {len(all_headers)}")
            for i, h in enumerate(all_headers):
                print(f"   Header {i+1}: '{h.text}'")
        except:
            print("   ❌ Nenhum header encontrado")
        
        # Verificar o estado do carrossel
        print("\n🔍 ESTADO DO CARROSSEL:")
        track = driver.find_element(By.CSS_SELECTOR, "#track")
        transform = track.get_attribute("style")
        print(f"   Transform atual: {transform}")
        
        # Verificar qual slide está visível
        slides = driver.find_elements(By.CSS_SELECTOR, ".slide")
        for i, slide in enumerate(slides):
            is_visible = slide.is_displayed()
            print(f"   Slide {i}: visível = {is_visible}")
            
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    debug_slide_content()
