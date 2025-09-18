#!/usr/bin/env python3
"""
TESTE QA RIGOROSO - Verificação completa da usabilidade dos criativos
Este teste simula o comportamento real do usuário passo a passo
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException
from selenium.webdriver.common.action_chains import ActionChains

class QARigoroso:
    def __init__(self):
        self.driver = None
        self.setup_driver()
        self.test_results = []
        
    def setup_driver(self):
        """Configura o driver com opções mais realistas"""
        chrome_options = Options()
        # Removendo headless para ver o que está acontecendo
        # chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=400,300")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        self.wait = WebDriverWait(self.driver, 10)
        
    def log_test(self, test_name, result, details=""):
        """Registra resultado do teste"""
        status = "✅ PASSOU" if result else "❌ FALHOU"
        self.test_results.append({
            'test': test_name,
            'result': result,
            'details': details
        })
        print(f"{status} {test_name}")
        if details:
            print(f"   📝 {details}")
            
    def test_creative_complete_flow(self, file_path, creative_name):
        """Testa o fluxo completo de um criativo"""
        print(f"\n{'='*80}")
        print(f"🧪 TESTE QA RIGOROSO: {creative_name}")
        print(f"📁 Arquivo: {file_path}")
        print(f"{'='*80}")
        
        try:
            # Carrega o arquivo
            file_url = f"file://{os.path.abspath(file_path)}"
            self.driver.get(file_url)
            time.sleep(3)  # Aguarda carregamento completo
            
            # TESTE 1: Verificar se a página carregou corretamente
            self.test_page_load()
            
            # TESTE 2: Verificar estrutura inicial (slide 0)
            self.test_initial_slide()
            
            # TESTE 3: Testar navegação para primeira pergunta
            self.test_navigation_to_questions()
            
            # TESTE 4: Testar seleção de opções de rádio
            self.test_radio_selection()
            
            # TESTE 5: Testar navegação entre perguntas
            self.test_question_navigation()
            
            # TESTE 6: Testar fluxo completo até o final
            self.test_complete_survey_flow()
            
            # TESTE 7: Verificar se clicktag funciona apenas no final
            self.test_final_clicktag()
            
        except Exception as e:
            self.log_test("ERRO GERAL", False, f"Erro inesperado: {str(e)}")
            
    def test_page_load(self):
        """Testa se a página carregou corretamente"""
        try:
            # Verifica se elementos principais existem
            stage = self.driver.find_element(By.CSS_SELECTOR, ".stage")
            track = self.driver.find_element(By.CSS_SELECTOR, "#track")
            slides = self.driver.find_elements(By.CSS_SELECTOR, ".slide")
            
            if stage and track and len(slides) >= 7:
                self.log_test("CARREGAMENTO DA PÁGINA", True, f"Encontrados {len(slides)} slides")
            else:
                self.log_test("CARREGAMENTO DA PÁGINA", False, "Elementos principais não encontrados")
                
        except Exception as e:
            self.log_test("CARREGAMENTO DA PÁGINA", False, f"Erro: {str(e)}")
            
    def test_initial_slide(self):
        """Testa o slide inicial (slide 0)"""
        try:
            # Verifica se está no slide 0
            current_slide = self.driver.find_element(By.CSS_SELECTOR, ".slide")
            
            # Verifica se o botão inicial existe e não tem clicktag
            start_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
            button_tag = start_button.tag_name
            
            if button_tag == "div":
                self.log_test("SLIDE INICIAL", True, "Botão inicial sem clicktag (correto)")
            else:
                self.log_test("SLIDE INICIAL", False, f"Botão inicial tem tag {button_tag} (deveria ser div)")
                
        except Exception as e:
            self.log_test("SLIDE INICIAL", False, f"Erro: {str(e)}")
            
    def test_navigation_to_questions(self):
        """Testa navegação para as perguntas"""
        try:
            # Clica no botão "QUERO TER ACESSO AOS CURSOS"
            start_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
            start_button.click()
            time.sleep(1)
            
            # Verifica se mudou para a primeira pergunta
            question_header = self.driver.find_element(By.CSS_SELECTOR, ".header .step")
            if "Pergunta 1 de 6" in question_header.text:
                self.log_test("NAVEGAÇÃO INICIAL", True, "Navegou para primeira pergunta corretamente")
            else:
                self.log_test("NAVEGAÇÃO INICIAL", False, f"Header encontrado: {question_header.text}")
                
        except Exception as e:
            self.log_test("NAVEGAÇÃO INICIAL", False, f"Erro: {str(e)}")
            
    def test_radio_selection(self):
        """Testa seleção de opções de rádio"""
        try:
            # Encontra a primeira opção de rádio
            first_radio = self.driver.find_element(By.CSS_SELECTOR, "input[name='q1']")
            first_radio_label = self.driver.find_element(By.CSS_SELECTOR, "label.opt")
            
            # Clica na opção
            first_radio_label.click()
            time.sleep(0.5)
            
            # Verifica se foi selecionada
            if first_radio.is_selected():
                self.log_test("SELEÇÃO DE RÁDIO", True, "Opção de rádio selecionada corretamente")
            else:
                self.log_test("SELEÇÃO DE RÁDIO", False, "Opção de rádio não foi selecionada")
                
        except Exception as e:
            self.log_test("SELEÇÃO DE RÁDIO", False, f"Erro: {str(e)}")
            
    def test_question_navigation(self):
        """Testa navegação entre perguntas"""
        try:
            # Clica no botão "Próxima"
            next_button = self.driver.find_element(By.CSS_SELECTOR, "#next")
            next_button.click()
            time.sleep(1)
            
            # Verifica se mudou para a próxima pergunta
            question_header = self.driver.find_element(By.CSS_SELECTOR, ".header .step")
            if "Pergunta 2 de 6" in question_header.text:
                self.log_test("NAVEGAÇÃO ENTRE PERGUNTAS", True, "Navegou para segunda pergunta")
            else:
                self.log_test("NAVEGAÇÃO ENTRE PERGUNTAS", False, f"Header encontrado: {question_header.text}")
                
        except Exception as e:
            self.log_test("NAVEGAÇÃO ENTRE PERGUNTAS", False, f"Erro: {str(e)}")
            
    def test_complete_survey_flow(self):
        """Testa o fluxo completo da pesquisa"""
        try:
            # Responde todas as perguntas rapidamente
            for q in range(2, 7):  # Perguntas 2 a 6
                # Seleciona primeira opção
                radio = self.driver.find_element(By.CSS_SELECTOR, f"input[name='q{q}']")
                radio_label = self.driver.find_element(By.CSS_SELECTOR, f"label.opt input[name='q{q}']").find_element(By.XPATH, "./..")
                radio_label.click()
                time.sleep(0.3)
                
                # Clica em próxima (exceto na última)
                if q < 6:
                    next_button = self.driver.find_element(By.CSS_SELECTOR, "#next")
                    next_button.click()
                    time.sleep(0.5)
                    
            # Na pergunta 6, clica no botão "VER MEUS CURSOS GRATUITOS"
            final_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='to-thanks']")
            final_button.click()
            time.sleep(1)
            
            # Verifica se chegou na tela de agradecimento
            thanks_header = self.driver.find_element(By.CSS_SELECTOR, ".header h1")
            if "Obrigado" in thanks_header.text:
                self.log_test("FLUXO COMPLETO", True, "Completou toda a pesquisa e chegou na tela final")
            else:
                self.log_test("FLUXO COMPLETO", False, f"Header final: {thanks_header.text}")
                
        except Exception as e:
            self.log_test("FLUXO COMPLETO", False, f"Erro: {str(e)}")
            
    def test_final_clicktag(self):
        """Testa se a clicktag funciona apenas no botão final"""
        try:
            # Verifica se o botão final tem clicktag
            final_button = self.driver.find_element(By.CSS_SELECTOR, "a.button")
            href = final_button.get_attribute("href")
            text = final_button.text.strip()
            
            if href and "clickTag" in href and "ESCOLHER MEU CURSO" in text:
                self.log_test("CLICKTAG FINAL", True, "Botão final tem clicktag corretamente")
            else:
                self.log_test("CLICKTAG FINAL", False, f"Href: {href}, Text: {text}")
                
            # Verifica se outros botões NÃO têm clicktag
            all_buttons = self.driver.find_elements(By.CSS_SELECTOR, ".button")
            clicktag_count = 0
            
            for button in all_buttons:
                if button.tag_name == "a":
                    clicktag_count += 1
                    
            if clicktag_count == 1:  # Apenas o botão final
                self.log_test("CLICKTAG ISOLADA", True, f"Apenas {clicktag_count} botão com clicktag")
            else:
                self.log_test("CLICKTAG ISOLADA", False, f"{clicktag_count} botões com clicktag (deveria ser 1)")
                
        except Exception as e:
            self.log_test("CLICKTAG FINAL", False, f"Erro: {str(e)}")
            
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 INICIANDO TESTES QA RIGOROSOS")
        print("=" * 80)
        
        creative_files = [
            ("creative-v2/sebrae_carousel_300x250_PEQUENOS_NEGOCIOS.html", "Carrossel 300x250 - Pequenos Negócios"),
            ("creative-v2/sebrae_carousel_300x250_SOCIEDADE.html", "Carrossel 300x250 - Sociedade"),
            ("creative-v2/sebrae_carousel_336x280_PEQUENOS_NEGOCIOS.html", "Carrossel 336x280 - Pequenos Negócios"),
        ]
        
        for file_path, creative_name in creative_files:
            if os.path.exists(file_path):
                self.test_creative_complete_flow(file_path, creative_name)
            else:
                print(f"⚠️  Arquivo não encontrado: {file_path}")
                
        # Relatório final
        self.generate_final_report()
        
    def generate_final_report(self):
        """Gera relatório final dos testes"""
        print(f"\n{'='*80}")
        print("📊 RELATÓRIO FINAL - TESTES QA RIGOROSOS")
        print(f"{'='*80}")
        
        total_tests = len(self.test_results)
        passed_tests = sum(1 for result in self.test_results if result['result'])
        failed_tests = total_tests - passed_tests
        
        print(f"📈 Total de testes: {total_tests}")
        print(f"✅ Testes aprovados: {passed_tests}")
        print(f"❌ Testes falharam: {failed_tests}")
        print(f"📊 Taxa de sucesso: {(passed_tests/total_tests)*100:.1f}%")
        
        if failed_tests > 0:
            print(f"\n❌ TESTES QUE FALHARAM:")
            for result in self.test_results:
                if not result['result']:
                    print(f"   - {result['test']}: {result['details']}")
                    
        print(f"\n{'='*80}")
        if failed_tests == 0:
            print("🎉 TODOS OS TESTES PASSARAM! USABILIDADE 100% FUNCIONAL!")
        else:
            print(f"⚠️  {failed_tests} TESTES FALHARAM - NECESSÁRIO REVISAR")
        print(f"{'='*80}")
        
    def cleanup(self):
        """Limpa recursos"""
        if self.driver:
            self.driver.quit()

if __name__ == "__main__":
    qa = QARigoroso()
    try:
        qa.run_all_tests()
    finally:
        qa.cleanup()
