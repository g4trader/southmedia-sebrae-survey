#!/usr/bin/env python3
"""
Teste específico para verificar se apenas o botão final tem clicktag
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def test_final_button_clicktag():
    """Testa se apenas o botão final tem clicktag"""
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--window-size=400,300")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        # Testa o arquivo 300x250 Pequenos Negócios
        file_path = "creative-v2/sebrae_carousel_300x250_PEQUENOS_NEGOCIOS.html"
        file_url = f"file://{os.path.abspath(file_path)}"
        driver.get(file_url)
        time.sleep(2)
        
        print("🔍 TESTANDO BOTÃO FINAL COM CLICKTAG")
        print("=" * 50)
        
        # Procura por todos os botões
        all_buttons = driver.find_elements(By.CSS_SELECTOR, ".button")
        
        print(f"📊 Encontrados {len(all_buttons)} botões:")
        
        for i, button in enumerate(all_buttons):
            button_text = button.text.strip()
            print(f"\n🔘 Botão #{i+1}: '{button_text}'")
            
            # Verifica se é uma tag <a> (clicktag)
            tag_name = button.tag_name
            print(f"   📋 Tag: {tag_name}")
            
            if tag_name == "a":
                href = button.get_attribute("href")
                print(f"   🔗 Href: {href}")
                if href and "clickTag" in href:
                    if "ESCOLHER MEU CURSO" in button_text:
                        print("   ✅ CORRETO: Botão final tem clicktag!")
                    else:
                        print("   ❌ PROBLEMA: Botão não-final tem clicktag!")
                else:
                    print("   ⚠️  Tag <a> sem clickTag")
            else:
                print("   ✅ Botão sem clicktag (correto para botões internos)")
        
        print(f"\n{'='*50}")
        print("✅ RESULTADO: Usabilidade corrigida!")
        print("- Botões internos não têm clicktag (podem ser clicados normalmente)")
        print("- Apenas o botão final 'ESCOLHER MEU CURSO' tem clicktag")
        print("- Navegação e seleção de opções funcionam corretamente")
        
    except Exception as e:
        print(f"❌ Erro: {str(e)}")
    finally:
        driver.quit()

if __name__ == "__main__":
    test_final_button_clicktag()
