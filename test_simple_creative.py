#!/usr/bin/env python3
"""
Teste simples para verificar se o criativo progressivo está carregando
"""

import time
import requests
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

def test_creative_loading():
    """Testa se o criativo está carregando corretamente"""
    
    # Configurar Chrome
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    
    driver = webdriver.Chrome(options=chrome_options)
    
    try:
        print("🧪 Testando carregamento do criativo...")
        
        # Abrir criativo progressivo
        creative_url = "https://southmedia-sebrae-survey-te5d.vercel.app/creative-v2/sebrae_carousel_336x280_PEQUENOS_NEGOCIOS_PROGRESSIVE.html"
        driver.get(creative_url)
        print(f"🌐 Abrindo: {creative_url}")
        
        # Aguardar carregamento
        time.sleep(5)
        
        # Verificar se a página carregou
        title = driver.title
        print(f"📄 Título da página: {title}")
        
        # Verificar se há elementos de pergunta
        try:
            # Procurar por qualquer input de rádio
            radio_inputs = driver.find_elements(By.CSS_SELECTOR, 'input[type="radio"]')
            print(f"📻 Inputs de rádio encontrados: {len(radio_inputs)}")
            
            if radio_inputs:
                for i, radio in enumerate(radio_inputs[:3]):  # Mostrar apenas os primeiros 3
                    name = radio.get_attribute('name')
                    value = radio.get_attribute('value')
                    print(f"  {i+1}. name='{name}', value='{value}'")
            
            # Procurar por elementos com classe 'opt'
            opt_elements = driver.find_elements(By.CSS_SELECTOR, '.opt')
            print(f"🎯 Elementos .opt encontrados: {len(opt_elements)}")
            
            # Procurar por elementos com classe 'q'
            q_elements = driver.find_elements(By.CSS_SELECTOR, '.q')
            print(f"❓ Elementos .q encontrados: {len(q_elements)}")
            
            if q_elements:
                for i, q in enumerate(q_elements[:2]):  # Mostrar apenas os primeiros 2
                    text = q.text.strip()
                    print(f"  {i+1}. '{text[:50]}...'")
            
        except Exception as e:
            print(f"⚠️ Erro ao verificar elementos: {e}")
        
        # Verificar logs do console
        print("\n🔍 Logs do console:")
        logs = driver.get_log('browser')
        for log in logs:
            if 'error' in log['level'].lower() or 'warning' in log['level'].lower():
                print(f"  {log['level']}: {log['message']}")
        
        return len(radio_inputs) > 0
        
    except Exception as e:
        print(f"❌ Erro durante o teste: {e}")
        return False
        
    finally:
        driver.quit()

if __name__ == "__main__":
    print("🚀 Testando carregamento do criativo progressivo...")
    
    success = test_creative_loading()
    
    if success:
        print("\n✅ Criativo carregou corretamente!")
    else:
        print("\n❌ Problema no carregamento do criativo!")
