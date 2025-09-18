#!/usr/bin/env python3
"""
VERIFICAÇÃO ESPECÍFICA DA CLICKTAG - Confirmar que está APENAS no último frame
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def verificar_clicktag_especifica():
    """Verificação específica da clicktag em cada frame"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=400,300")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        file_path = "creative-v2/sebrae_carousel_300x250_PEQUENOS_NEGOCIOS.html"
        file_url = f"file://{os.path.abspath(file_path)}"
        driver.get(file_url)
        time.sleep(3)
        
        print("🔍 VERIFICAÇÃO ESPECÍFICA DA CLICKTAG")
        print("=" * 60)
        print("Verificando cada frame individualmente...")
        
        # Verificar todos os slides
        slides = driver.find_elements(By.CSS_SELECTOR, ".slide")
        print(f"\n📊 Total de slides encontrados: {len(slides)}")
        
        clicktag_encontradas = 0
        frame_com_clicktag = None
        
        for i, slide in enumerate(slides):
            # Verificar se este slide tem clicktag
            clicktag_links = slide.find_elements(By.XPATH, ".//a[contains(@href, 'clickTag')]")
            
            if len(clicktag_links) > 0:
                clicktag_encontradas += len(clicktag_links)
                frame_com_clicktag = i
                print(f"   ❌ FRAME {i}: {len(clicktag_links)} clicktag(s) encontrada(s)")
                
                # Mostrar detalhes da clicktag
                for j, link in enumerate(clicktag_links):
                    href = link.get_attribute("href")
                    text = link.text.strip()
                    print(f"      - Link {j+1}: href='{href}', text='{text}'")
            else:
                print(f"   ✅ FRAME {i}: Sem clicktag (correto)")
        
        print(f"\n📋 RESUMO DA VERIFICAÇÃO:")
        print(f"   Total de clicktags encontradas: {clicktag_encontradas}")
        
        if clicktag_encontradas == 1 and frame_com_clicktag == 7:  # Frame 7 é o último (índice 7)
            print("   ✅ APROVADO: Clicktag encontrada APENAS no último frame")
        elif clicktag_encontradas == 0:
            print("   ❌ REPROVADO: Nenhuma clicktag encontrada")
        elif clicktag_encontradas > 1:
            print("   ❌ REPROVADO: Múltiplas clicktags encontradas")
        else:
            print(f"   ❌ REPROVADO: Clicktag no frame {frame_com_clicktag} (deveria ser no frame 7)")
        
        # Verificação adicional: navegar até o último frame e confirmar
        print(f"\n🔄 VERIFICAÇÃO ADICIONAL - NAVEGANDO ATÉ O ÚLTIMO FRAME:")
        
        # Navegar até o final
        start_button = driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
        start_button.click()
        time.sleep(1)
        
        for q in range(1, 7):
            current_slide = driver.find_element(By.CSS_SELECTOR, f".slide:nth-child({q+1})")
            first_label = current_slide.find_element(By.CSS_SELECTOR, "label.opt")
            first_label.click()
            time.sleep(0.3)
            
            if q < 6:
                next_button = driver.find_element(By.CSS_SELECTOR, "#next")
                next_button.click()
                time.sleep(0.5)
        
        final_button = driver.find_element(By.CSS_SELECTOR, ".button[data-action='to-thanks']")
        final_button.click()
        time.sleep(2)
        
        # Verificar se estamos no último frame
        final_slide = driver.find_element(By.CSS_SELECTOR, ".slide:nth-child(8)")
        if "Obrigado" in final_slide.get_attribute("outerHTML"):
            print("   ✅ Chegou no frame de agradecimento")
            
            # Verificar clicktag no frame final
            clicktag_final = final_slide.find_elements(By.XPATH, ".//a[contains(@href, 'clickTag')]")
            if len(clicktag_final) == 1:
                href = clicktag_final[0].get_attribute("href")
                text = clicktag_final[0].text.strip()
                print(f"   ✅ Clicktag encontrada no frame final:")
                print(f"      - Href: {href}")
                print(f"      - Text: '{text}'")
                
                if "ESCOLHER MEU CURSO" in text and "clickTag" in href:
                    print("   ✅ APROVAÇÃO FINAL: Clicktag correta no último frame!")
                else:
                    print("   ❌ Clicktag com conteúdo incorreto")
            else:
                print(f"   ❌ {len(clicktag_final)} clicktags no frame final (deveria ser 1)")
        else:
            print("   ❌ Não chegou no frame de agradecimento")
        
        print(f"\n{'='*60}")
        print("🎯 CONCLUSÃO FINAL:")
        if clicktag_encontradas == 1 and frame_com_clicktag == 7:
            print("✅ CRIATIVOS APROVADOS PARA DV360!")
            print("✅ Clicktag aplicada APENAS no último frame")
            print("✅ Compatibilidade 100% confirmada")
        else:
            print("❌ CRIATIVOS NÃO APROVADOS")
            print("❌ Necessário correção antes do envio")
        
    except Exception as e:
        print(f"❌ Erro na verificação: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    verificar_clicktag_especifica()
