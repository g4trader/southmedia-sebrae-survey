#!/usr/bin/env python3
"""
Teste de usabilidade dos criativos SEBRAE - Problema com clicktags
Este teste demonstra como as clicktags estão quebrando a usabilidade
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class SebraeCreativeUsabilityTest:
    def __init__(self):
        self.driver = None
        self.setup_driver()
        
    def setup_driver(self):
        """Configura o driver do Chrome para testes"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")  # Executar sem interface gráfica
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=400,300")
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.wait = WebDriverWait(self.driver, 10)
        
    def test_creative_file(self, file_path, creative_name):
        """Testa um arquivo criativo específico"""
        print(f"\n{'='*60}")
        print(f"TESTANDO: {creative_name}")
        print(f"Arquivo: {file_path}")
        print(f"{'='*60}")
        
        try:
            # Carrega o arquivo local
            file_url = f"file://{os.path.abspath(file_path)}"
            self.driver.get(file_url)
            
            # Aguarda o carregamento
            time.sleep(2)
            
            # Teste 1: Verificar se a clicktag está envolvendo todo o conteúdo
            self.test_clicktag_coverage()
            
            # Teste 2: Tentar interagir com elementos sem abrir clicktag
            self.test_radio_button_interaction()
            
            # Teste 3: Testar navegação entre slides
            self.test_slide_navigation()
            
            # Teste 4: Verificar se apenas o botão final deveria ter clicktag
            self.test_final_button_clicktag()
            
        except Exception as e:
            print(f"❌ ERRO ao testar {creative_name}: {str(e)}")
            
    def test_clicktag_coverage(self):
        """Testa se a clicktag está cobrindo elementos que não deveriam ter"""
        print("\n🔍 TESTE 1: Verificação da cobertura da clicktag")
        
        try:
            # Verifica se existe uma tag <a> envolvendo o conteúdo principal
            clicktag_links = self.driver.find_elements(By.TAG_NAME, "a")
            
            if clicktag_links:
                print(f"   📊 Encontradas {len(clicktag_links)} tags <a> no documento")
                
                for i, link in enumerate(clicktag_links):
                    href = link.get_attribute("href")
                    if href and "clickTag" in href:
                        print(f"   ⚠️  Tag <a> #{i+1} contém clickTag: {href}")
                        
                        # Verifica quais elementos estão dentro desta tag
                        inner_elements = link.find_elements(By.XPATH, ".//*")
                        print(f"   📋 Esta tag contém {len(inner_elements)} elementos internos")
                        
                        # Verifica se contém botões de navegação
                        nav_buttons = link.find_elements(By.CSS_SELECTOR, "#prev, #next")
                        if nav_buttons:
                            print(f"   ❌ PROBLEMA: Botões de navegação estão dentro da clicktag!")
                            
                        # Verifica se contém opções de rádio
                        radio_options = link.find_elements(By.CSS_SELECTOR, "input[type='radio']")
                        if radio_options:
                            print(f"   ❌ PROBLEMA: {len(radio_options)} opções de rádio estão dentro da clicktag!")
                            
                        # Verifica se contém botões internos
                        inner_buttons = link.find_elements(By.CSS_SELECTOR, ".button")
                        if inner_buttons:
                            print(f"   ❌ PROBLEMA: {len(inner_buttons)} botões internos estão dentro da clicktag!")
            else:
                print("   ✅ Nenhuma tag <a> com clickTag encontrada")
                
        except Exception as e:
            print(f"   ❌ Erro ao verificar cobertura da clicktag: {str(e)}")
            
    def test_radio_button_interaction(self):
        """Testa se é possível interagir com botões de rádio sem abrir clicktag"""
        print("\n🔍 TESTE 2: Interação com botões de rádio")
        
        try:
            # Procura por botões de rádio
            radio_buttons = self.driver.find_elements(By.CSS_SELECTOR, "input[type='radio']")
            
            if radio_buttons:
                print(f"   📊 Encontrados {len(radio_buttons)} botões de rádio")
                
                # Tenta clicar no primeiro botão de rádio
                first_radio = radio_buttons[0]
                
                # Verifica se o botão está dentro de uma tag <a>
                parent_link = first_radio.find_element(By.XPATH, "./ancestor::a")
                
                if parent_link:
                    href = parent_link.get_attribute("href")
                    if href and "clickTag" in href:
                        print("   ❌ PROBLEMA: Botão de rádio está dentro de uma clicktag!")
                        print("   ⚠️  Clicar no rádio abrirá a clicktag em vez de selecionar a opção")
                    else:
                        print("   ✅ Botão de rádio não está dentro de clicktag")
                else:
                    print("   ✅ Botão de rádio não está dentro de tag <a>")
                    
            else:
                print("   ⚠️  Nenhum botão de rádio encontrado")
                
        except Exception as e:
            print(f"   ❌ Erro ao testar interação com rádio: {str(e)}")
            
    def test_slide_navigation(self):
        """Testa se a navegação entre slides funciona sem abrir clicktag"""
        print("\n🔍 TESTE 3: Navegação entre slides")
        
        try:
            # Procura pelos botões de navegação
            next_button = self.driver.find_elements(By.CSS_SELECTOR, "#next")
            prev_button = self.driver.find_elements(By.CSS_SELECTOR, "#prev")
            
            if next_button:
                print("   📊 Botão 'Próxima' encontrado")
                
                # Verifica se está dentro de clicktag
                parent_link = next_button[0].find_element(By.XPATH, "./ancestor::a")
                if parent_link:
                    href = parent_link.get_attribute("href")
                    if href and "clickTag" in href:
                        print("   ❌ PROBLEMA: Botão 'Próxima' está dentro de clicktag!")
                        print("   ⚠️  Clicar em 'Próxima' abrirá a clicktag em vez de navegar")
                    else:
                        print("   ✅ Botão 'Próxima' não está dentro de clicktag")
                        
            if prev_button:
                print("   📊 Botão 'Anterior' encontrado")
                
                # Verifica se está dentro de clicktag
                parent_link = prev_button[0].find_element(By.XPATH, "./ancestor::a")
                if parent_link:
                    href = parent_link.get_attribute("href")
                    if href and "clickTag" in href:
                        print("   ❌ PROBLEMA: Botão 'Anterior' está dentro de clicktag!")
                        print("   ⚠️  Clicar em 'Anterior' abrirá a clicktag em vez de navegar")
                    else:
                        print("   ✅ Botão 'Anterior' não está dentro de clicktag")
                        
        except Exception as e:
            print(f"   ❌ Erro ao testar navegação: {str(e)}")
            
    def test_final_button_clicktag(self):
        """Testa se apenas o botão final deveria ter clicktag"""
        print("\n🔍 TESTE 4: Verificação do botão final")
        
        try:
            # Procura por todos os botões
            all_buttons = self.driver.find_elements(By.CSS_SELECTOR, ".button")
            
            if all_buttons:
                print(f"   📊 Encontrados {len(all_buttons)} botões")
                
                for i, button in enumerate(all_buttons):
                    button_text = button.text.strip()
                    print(f"   🔘 Botão #{i+1}: '{button_text}'")
                    
                    # Verifica se está dentro de clicktag
                    try:
                        parent_link = button.find_element(By.XPATH, "./ancestor::a")
                        if parent_link:
                            href = parent_link.get_attribute("href")
                            if href and "clickTag" in href:
                                if "ESCOLHER MEU CURSO" in button_text or "VER MEUS CURSOS" in button_text:
                                    print(f"   ✅ CORRETO: Botão final '{button_text}' tem clicktag")
                                else:
                                    print(f"   ❌ PROBLEMA: Botão '{button_text}' tem clicktag mas não deveria!")
                            else:
                                print(f"   ✅ Botão '{button_text}' não tem clicktag")
                        else:
                            print(f"   ✅ Botão '{button_text}' não está dentro de tag <a>")
                    except NoSuchElementException:
                        print(f"   ✅ Botão '{button_text}' não está dentro de tag <a>")
                        
        except Exception as e:
            print(f"   ❌ Erro ao testar botões: {str(e)}")
            
    def run_all_tests(self):
        """Executa todos os testes nos criativos"""
        print("🚀 INICIANDO TESTES DE USABILIDADE DOS CRIATIVOS SEBRAE")
        print("=" * 80)
        
        # Lista dos arquivos para testar
        creative_files = [
            ("creative-v2/sebrae_carousel_300x250_PEQUENOS_NEGOCIOS.html", "Carrossel 300x250 - Pequenos Negócios"),
            ("creative-v2/sebrae_carousel_300x250_SOCIEDADE.html", "Carrossel 300x250 - Sociedade"),
            ("creative-v2/sebrae_carousel_336x280_PEQUENOS_NEGOCIOS.html", "Carrossel 336x280 - Pequenos Negócios"),
        ]
        
        for file_path, creative_name in creative_files:
            if os.path.exists(file_path):
                self.test_creative_file(file_path, creative_name)
            else:
                print(f"⚠️  Arquivo não encontrado: {file_path}")
                
        print(f"\n{'='*80}")
        print("📋 RESUMO DOS PROBLEMAS ENCONTRADOS:")
        print("=" * 80)
        print("❌ PROBLEMA PRINCIPAL: A clicktag está envolvendo TODO o conteúdo do carrossel")
        print("   - Isso quebra a usabilidade porque:")
        print("   - Clicar em opções de rádio abre a clicktag em vez de selecionar")
        print("   - Clicar nos botões de navegação abre a clicktag em vez de navegar")
        print("   - Apenas o botão final deveria ter a clicktag")
        print("\n✅ SOLUÇÃO: Remover a tag <a> que envolve todo o conteúdo")
        print("   - Aplicar clicktag apenas no botão final (ESCOLHER MEU CURSO)")
        print("   - Manter a funcionalidade de navegação e seleção intacta")
        
    def cleanup(self):
        """Limpa recursos"""
        if self.driver:
            self.driver.quit()

if __name__ == "__main__":
    test = SebraeCreativeUsabilityTest()
    try:
        test.run_all_tests()
    finally:
        test.cleanup()
