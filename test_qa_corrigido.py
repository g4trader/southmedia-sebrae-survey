#!/usr/bin/env python3
"""
TESTE QA CORRIGIDO - Versão corrigida com cliques nos elementos corretos
"""

import time
import os
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from selenium.common.exceptions import TimeoutException, NoSuchElementException

class QACorrigido:
    def __init__(self):
        self.driver = None
        self.setup_driver()
        self.test_results = []
        
    def setup_driver(self):
        """Configura o driver"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=400,300")
        
        self.driver = webdriver.Chrome(options=chrome_options)
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
        print(f"🧪 TESTE QA CORRIGIDO: {creative_name}")
        print(f"📁 Arquivo: {file_path}")
        print(f"{'='*80}")
        
        try:
            # Carrega o arquivo
            file_url = f"file://{os.path.abspath(file_path)}"
            self.driver.get(file_url)
            time.sleep(3)
            
            # TESTE 1: Verificar se a página carregou corretamente
            self.test_page_load()
            
            # TESTE 2: Verificar estrutura inicial (slide 0)
            self.test_initial_slide()
            
            # TESTE 3: Testar navegação para primeira pergunta
            self.test_navigation_to_questions()
            
            # TESTE 4: Testar seleção de opções de rádio (CORRIGIDO)
            self.test_radio_selection_corrected()
            
            # TESTE 5: Testar navegação entre perguntas (CORRIGIDO)
            self.test_question_navigation_corrected()
            
            # TESTE 6: Testar fluxo completo até o final (CORRIGIDO)
            self.test_complete_survey_flow_corrected()
            
            # TESTE 7: Verificar se clicktag funciona apenas no final
            self.test_final_clicktag()
            
        except Exception as e:
            self.log_test("ERRO GERAL", False, f"Erro inesperado: {str(e)}")
            
    def test_page_load(self):
        """Testa se a página carregou corretamente"""
        try:
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
            start_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
            start_button.click()
            time.sleep(1)
            
            question_header = self.driver.find_element(By.CSS_SELECTOR, ".header .step")
            if "Pergunta 1 de 6" in question_header.text:
                self.log_test("NAVEGAÇÃO INICIAL", True, "Navegou para primeira pergunta corretamente")
            else:
                self.log_test("NAVEGAÇÃO INICIAL", False, f"Header encontrado: {question_header.text}")
                
        except Exception as e:
            self.log_test("NAVEGAÇÃO INICIAL", False, f"Erro: {str(e)}")
            
    def test_radio_selection_corrected(self):
        """Testa seleção de opções de rádio (CORRIGIDO - clica no label)"""
        try:
            # Clica no LABEL em vez do input
            first_radio_label = self.driver.find_element(By.CSS_SELECTOR, "label.opt")
            first_radio_label.click()
            time.sleep(0.5)
            
            # Verifica se o input foi selecionado
            first_radio_input = self.driver.find_element(By.CSS_SELECTOR, "input[name='q1']")
            if first_radio_input.is_selected():
                self.log_test("SELEÇÃO DE RÁDIO", True, "Opção de rádio selecionada corretamente")
            else:
                self.log_test("SELEÇÃO DE RÁDIO", False, "Opção de rádio não foi selecionada")
                
        except Exception as e:
            self.log_test("SELEÇÃO DE RÁDIO", False, f"Erro: {str(e)}")
            
    def test_question_navigation_corrected(self):
        """Testa navegação entre perguntas (CORRIGIDO)"""
        try:
            next_button = self.driver.find_element(By.CSS_SELECTOR, "#next")
            next_button.click()
            time.sleep(1)
            
            question_header = self.driver.find_element(By.CSS_SELECTOR, ".header .step")
            if "Pergunta 2 de 6" in question_header.text:
                self.log_test("NAVEGAÇÃO ENTRE PERGUNTAS", True, "Navegou para segunda pergunta")
            else:
                self.log_test("NAVEGAÇÃO ENTRE PERGUNTAS", False, f"Header encontrado: '{question_header.text}'")
                
        except Exception as e:
            self.log_test("NAVEGAÇÃO ENTRE PERGUNTAS", False, f"Erro: {str(e)}")
            
    def test_complete_survey_flow_corrected(self):
        """Testa o fluxo completo da pesquisa (CORRIGIDO)"""
        try:
            # Responde todas as perguntas restantes (2 a 6)
            for q in range(2, 7):
                # Seleciona primeira opção clicando no label
                radio_label = self.driver.find_element(By.CSS_SELECTOR, f"label.opt")
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
                self.log_test("FLUXO COMPLETO", False, f"Header final: '{thanks_header.text}'")
                
        except Exception as e:
            self.log_test("FLUXO COMPLETO", False, f"Erro: {str(e)}")
            
    def test_final_clicktag(self):
        """Testa se a clicktag funciona apenas no botão final"""
        try:
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
                    
            if clicktag_count == 1:
                self.log_test("CLICKTAG ISOLADA", True, f"Apenas {clicktag_count} botão com clicktag")
            else:
                self.log_test("CLICKTAG ISOLADA", False, f"{clicktag_count} botões com clicktag (deveria ser 1)")
                
        except Exception as e:
            self.log_test("CLICKTAG FINAL", False, f"Erro: {str(e)}")
            
    def run_all_tests(self):
        """Executa todos os testes"""
        print("🚀 INICIANDO TESTES QA CORRIGIDOS")
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
        print("📊 RELATÓRIO FINAL - TESTES QA CORRIGIDOS")
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
    qa = QACorrigido()
    try:
        qa.run_all_tests()
    finally:
        qa.cleanup()
