#!/usr/bin/env python3
"""
Debug do slide final - investigar o botão final
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def debug_final_slide():
    """Debug do slide final"""
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
        
        print("🔍 DEBUG DO SLIDE FINAL")
        print("=" * 60)
        
        # Navegar para o slide final passo a passo
        print("🔄 NAVEGANDO PARA O SLIDE FINAL:")
        
        # Passo 1: Clicar no botão inicial
        start_button = driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
        start_button.click()
        time.sleep(1)
        
        # Passo 2: Responder todas as perguntas
        for q in range(1, 7):
            print(f"   Respondendo pergunta {q}...")
            
            # Selecionar primeira opção
            current_slide = driver.find_element(By.CSS_SELECTOR, f".slide:nth-child({q+1})")
            first_label = current_slide.find_element(By.CSS_SELECTOR, "label.opt")
            first_label.click()
            time.sleep(0.5)
            
            # Clicar em próxima (exceto na última)
            if q < 6:
                next_button = driver.find_element(By.CSS_SELECTOR, "#next")
                next_button.click()
                time.sleep(0.5)
        
        # Passo 3: Na pergunta 6, clicar no botão "VER MEUS CURSOS GRATUITOS"
        print("   Clicando em 'VER MEUS CURSOS GRATUITOS'...")
        final_button = driver.find_element(By.CSS_SELECTOR, ".button[data-action='to-thanks']")
        final_button.click()
        time.sleep(2)
        
        # Verificar slide final
        print("\n📊 VERIFICANDO SLIDE FINAL:")
        track = driver.find_element(By.CSS_SELECTOR, "#track")
        transform = track.get_attribute("style")
        print(f"   Transform: {transform}")
        
        # Verificar qual slide está visível
        slides = driver.find_elements(By.CSS_SELECTOR, ".slide")
        for i, slide in enumerate(slides):
            is_visible = slide.is_displayed()
            if is_visible:
                print(f"   Slide {i} está visível")
                
                # Verificar se é o slide de agradecimento
                slide_html = slide.get_attribute("outerHTML")
                if "Obrigado" in slide_html:
                    print("   ✅ É o slide de agradecimento")
                    
                    # Procurar pelo botão final
                    try:
                        final_btn = slide.find_element(By.CSS_SELECTOR, "a.button")
                        href = final_btn.get_attribute("href")
                        text = final_btn.text.strip()
                        inner_html = final_btn.get_attribute("innerHTML")
                        
                        print(f"   Botão final encontrado:")
                        print(f"     Href: {href}")
                        print(f"     Text: '{text}'")
                        print(f"     Inner HTML: '{inner_html}'")
                        print(f"     Tag: {final_btn.tag_name}")
                        
                        # Verificar se o texto está correto
                        if "ESCOLHER MEU CURSO" in text:
                            print("   ✅ Texto do botão está correto")
                        else:
                            print("   ❌ Texto do botão está incorreto ou vazio")
                            
                    except Exception as e:
                        print(f"   ❌ Erro ao encontrar botão final: {str(e)}")
                        
                        # Tentar encontrar todos os botões no slide
                        all_buttons = slide.find_elements(By.CSS_SELECTOR, ".button")
                        print(f"   Botões encontrados no slide: {len(all_buttons)}")
                        for j, btn in enumerate(all_buttons):
                            print(f"     Botão {j+1}: tag={btn.tag_name}, text='{btn.text.strip()}'")
                else:
                    print(f"   ❌ Slide {i} não é o de agradecimento")
        
        # Verificar todos os botões com tag <a> no documento
        print("\n🔍 TODOS OS BOTÕES COM TAG <a> NO DOCUMENTO:")
        all_a_buttons = driver.find_elements(By.CSS_SELECTOR, "a.button")
        print(f"   Total de botões <a> encontrados: {len(all_a_buttons)}")
        
        for i, btn in enumerate(all_a_buttons):
            href = btn.get_attribute("href")
            text = btn.text.strip()
            inner_html = btn.get_attribute("innerHTML")
            is_visible = btn.is_displayed()
            
            print(f"   Botão {i+1}:")
            print(f"     Href: {href}")
            print(f"     Text: '{text}'")
            print(f"     Inner HTML: '{inner_html}'")
            print(f"     Visível: {is_visible}")
            
            # Verificar se é o botão correto
            if "ESCOLHER MEU CURSO" in text and "clickTag" in href:
                print("     ✅ Este é o botão final correto!")
            elif "clickTag" in href:
                print("     ⚠️  Tem clicktag mas texto incorreto")
            else:
                print("     ❌ Não é o botão final")
                
    except Exception as e:
        print(f"❌ Erro geral: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    debug_final_slide()
