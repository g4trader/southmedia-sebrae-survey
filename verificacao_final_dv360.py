#!/usr/bin/env python3
"""
VERIFICAÇÃO FINAL DV360 - Garantir compatibilidade e clicktag correta
"""

import time
import os
import zipfile
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.options import Options

class VerificacaoFinalDV360:
    def __init__(self):
        self.driver = None
        self.setup_driver()
        self.resultados = []
        
    def setup_driver(self):
        """Configura o driver para simular ambiente DV360"""
        chrome_options = Options()
        chrome_options.add_argument("--headless")
        chrome_options.add_argument("--no-sandbox")
        chrome_options.add_argument("--disable-dev-shm-usage")
        chrome_options.add_argument("--window-size=400,300")
        chrome_options.add_argument("--disable-blink-features=AutomationControlled")
        chrome_options.add_experimental_option("excludeSwitches", ["enable-automation"])
        chrome_options.add_experimental_option('useAutomationExtension', False)
        
        self.driver = webdriver.Chrome(options=chrome_options)
        self.driver.execute_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined})")
        
    def verificar_arquivo_zip(self, zip_path):
        """Verifica se o arquivo .zip está correto"""
        try:
            with zipfile.ZipFile(zip_path, 'r') as zipf:
                files = zipf.namelist()
                if len(files) == 1 and files[0].endswith('.html'):
                    return True, f"✅ ZIP válido: {files[0]}"
                else:
                    return False, f"❌ ZIP inválido: {files}"
        except Exception as e:
            return False, f"❌ Erro ao verificar ZIP: {str(e)}"
    
    def verificar_compatibilidade_dv360(self, html_path):
        """Verifica compatibilidade com DV360"""
        print(f"\n🔍 VERIFICANDO COMPATIBILIDADE DV360: {os.path.basename(html_path)}")
        print("=" * 70)
        
        try:
            # Carrega o arquivo
            file_url = f"file://{os.path.abspath(html_path)}"
            self.driver.get(file_url)
            time.sleep(3)
            
            verificacoes = []
            
            # 1. Verificar se clickTag está definida
            clicktag_defined = self.driver.execute_script("return typeof window.clickTag !== 'undefined';")
            if clicktag_defined:
                clicktag_value = self.driver.execute_script("return window.clickTag;")
                verificacoes.append(("✅", "clickTag definida", f"Valor: {clicktag_value}"))
            else:
                verificacoes.append(("❌", "clickTag NÃO definida", "CRÍTICO"))
            
            # 2. Verificar se há apenas UMA tag <a> com clickTag
            clicktag_links = self.driver.find_elements(By.XPATH, "//a[contains(@href, 'clickTag')]")
            if len(clicktag_links) == 1:
                verificacoes.append(("✅", "Apenas 1 link com clickTag", f"Encontrados: {len(clicktag_links)}"))
            else:
                verificacoes.append(("❌", f"Múltiplos links com clickTag", f"Encontrados: {len(clicktag_links)}"))
            
            # 3. Verificar se a clickTag está APENAS no último frame
            self.verificar_clicktag_apenas_ultimo_frame(verificacoes)
            
            # 4. Verificar se não há clickTag em elementos interativos
            self.verificar_clicktag_elementos_interativos(verificacoes)
            
            # 5. Verificar funcionalidade completa
            self.verificar_funcionalidade_completa(verificacoes)
            
            # 6. Verificar dimensões corretas
            self.verificar_dimensoes(verificacoes, html_path)
            
            return verificacoes
            
        except Exception as e:
            return [("❌", "Erro geral", str(e))]
    
    def verificar_clicktag_apenas_ultimo_frame(self, verificacoes):
        """Verifica se clickTag está APENAS no último frame"""
        try:
            # Navegar até o último frame
            self.navegar_ate_ultimo_frame()
            
            # Verificar se há clickTag no último frame
            final_slide = self.driver.find_element(By.CSS_SELECTOR, ".slide:nth-child(8)")
            clicktag_no_final = final_slide.find_elements(By.XPATH, ".//a[contains(@href, 'clickTag')]")
            
            if len(clicktag_no_final) == 1:
                verificacoes.append(("✅", "clickTag no último frame", "Correto"))
            else:
                verificacoes.append(("❌", "clickTag NÃO no último frame", f"Encontradas: {len(clicktag_no_final)}"))
            
            # Verificar se NÃO há clickTag em outros frames
            outros_slides = self.driver.find_elements(By.CSS_SELECTOR, ".slide:not(:nth-child(8))")
            clicktag_outros = 0
            
            for slide in outros_slides:
                clicktag_outros += len(slide.find_elements(By.XPATH, ".//a[contains(@href, 'clickTag')]"))
            
            if clicktag_outros == 0:
                verificacoes.append(("✅", "Sem clickTag em outros frames", "Correto"))
            else:
                verificacoes.append(("❌", f"clickTag em outros frames", f"Encontradas: {clicktag_outros}"))
                
        except Exception as e:
            verificacoes.append(("❌", "Erro ao verificar frames", str(e)))
    
    def verificar_clicktag_elementos_interativos(self, verificacoes):
        """Verifica se não há clickTag em elementos interativos"""
        try:
            # Verificar botões de navegação
            nav_buttons = self.driver.find_elements(By.CSS_SELECTOR, "#prev, #next")
            nav_com_clicktag = 0
            
            for btn in nav_buttons:
                if btn.find_elements(By.XPATH, ".//ancestor::a[contains(@href, 'clickTag')]"):
                    nav_com_clicktag += 1
            
            if nav_com_clicktag == 0:
                verificacoes.append(("✅", "Botões de navegação sem clickTag", "Correto"))
            else:
                verificacoes.append(("❌", f"Botões de navegação com clickTag", f"Encontrados: {nav_com_clicktag}"))
            
            # Verificar opções de rádio
            radio_options = self.driver.find_elements(By.CSS_SELECTOR, "input[type='radio']")
            radio_com_clicktag = 0
            
            for radio in radio_options:
                if radio.find_elements(By.XPATH, ".//ancestor::a[contains(@href, 'clickTag')]"):
                    radio_com_clicktag += 1
            
            if radio_com_clicktag == 0:
                verificacoes.append(("✅", "Opções de rádio sem clickTag", "Correto"))
            else:
                verificacoes.append(("❌", f"Opções de rádio com clickTag", f"Encontradas: {radio_com_clicktag}"))
                
        except Exception as e:
            verificacoes.append(("❌", "Erro ao verificar elementos interativos", str(e)))
    
    def verificar_funcionalidade_completa(self, verificacoes):
        """Verifica se a funcionalidade completa está funcionando"""
        try:
            # Testar fluxo completo
            self.driver.get(f"file://{os.path.abspath(self.current_html_path)}")
            time.sleep(2)
            
            # Navegar até o final
            self.navegar_ate_ultimo_frame()
            
            # Verificar se chegou no slide final
            final_slide = self.driver.find_element(By.CSS_SELECTOR, ".slide:nth-child(8)")
            if "Obrigado" in final_slide.get_attribute("outerHTML"):
                verificacoes.append(("✅", "Funcionalidade completa", "Fluxo funcionando"))
            else:
                verificacoes.append(("❌", "Funcionalidade incompleta", "Não chegou ao final"))
                
        except Exception as e:
            verificacoes.append(("❌", "Erro na funcionalidade", str(e)))
    
    def verificar_dimensoes(self, verificacoes, html_path):
        """Verifica se as dimensões estão corretas"""
        try:
            # Extrair dimensões do nome do arquivo
            filename = os.path.basename(html_path)
            if "300x250" in filename:
                expected_width, expected_height = 300, 250
            elif "320x250" in filename:
                expected_width, expected_height = 320, 250
            elif "336x280" in filename:
                expected_width, expected_height = 336, 280
            else:
                verificacoes.append(("⚠️", "Dimensões não identificadas", "Verificar manualmente"))
                return
            
            # Verificar dimensões no CSS
            body_width = self.driver.execute_script("return document.body.style.width || getComputedStyle(document.body).width;")
            body_height = self.driver.execute_script("return document.body.style.height || getComputedStyle(document.body).height;")
            
            if f"{expected_width}px" in body_width and f"{expected_height}px" in body_height:
                verificacoes.append(("✅", f"Dimensões corretas", f"{expected_width}x{expected_height}"))
            else:
                verificacoes.append(("❌", "Dimensões incorretas", f"Esperado: {expected_width}x{expected_height}, Encontrado: {body_width}x{body_height}"))
                
        except Exception as e:
            verificacoes.append(("❌", "Erro ao verificar dimensões", str(e)))
    
    def navegar_ate_ultimo_frame(self):
        """Navega até o último frame da pesquisa"""
        try:
            # Clicar no botão inicial
            start_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='start']")
            start_button.click()
            time.sleep(1)
            
            # Responder todas as perguntas
            for q in range(1, 7):
                current_slide = self.driver.find_element(By.CSS_SELECTOR, f".slide:nth-child({q+1})")
                first_label = current_slide.find_element(By.CSS_SELECTOR, "label.opt")
                first_label.click()
                time.sleep(0.3)
                
                if q < 6:
                    next_button = self.driver.find_element(By.CSS_SELECTOR, "#next")
                    next_button.click()
                    time.sleep(0.5)
            
            # Clicar no botão final
            final_button = self.driver.find_element(By.CSS_SELECTOR, ".button[data-action='to-thanks']")
            final_button.click()
            time.sleep(1)
            
        except Exception as e:
            print(f"Erro ao navegar: {str(e)}")
    
    def executar_verificacao_completa(self):
        """Executa verificação completa de todos os criativos"""
        print("🚀 VERIFICAÇÃO FINAL DV360 - COMPATIBILIDADE E CLICKTAG")
        print("=" * 80)
        
        # Lista dos arquivos para verificar
        creative_files = [
            ("creative-v2/sebrae_carousel_300x250_PEQUENOS_NEGOCIOS.html", "creative-v2/sebrae_carousel_300x250_PEQUENOS_NEGOCIOS.zip"),
            ("creative-v2/sebrae_carousel_300x250_SOCIEDADE.html", "creative-v2/sebrae_carousel_300x250_SOCIEDADE.zip"),
            ("creative-v2/sebrae_carousel_320x250_PEQUENOS_NEGOCIOS.html", "creative-v2/sebrae_carousel_320x250_PEQUENOS_NEGOCIOS.zip"),
            ("creative-v2/sebrae_carousel_320x250_SOCIEDADE.html", "creative-v2/sebrae_carousel_320x250_SOCIEDADE.zip"),
            ("creative-v2/sebrae_carousel_336x280_PEQUENOS_NEGOCIOS.html", "creative-v2/sebrae_carousel_336x280_PEQUENOS_NEGOCIOS.zip"),
            ("creative-v2/sebrae_carousel_336x280_SOCIEDADE.html", "creative-v2/sebrae_carousel_336x280_SOCIEDADE.zip"),
        ]
        
        total_verificacoes = 0
        verificacoes_aprovadas = 0
        
        for html_file, zip_file in creative_files:
            if os.path.exists(html_file) and os.path.exists(zip_file):
                self.current_html_path = html_file
                
                # Verificar arquivo ZIP
                zip_ok, zip_msg = self.verificar_arquivo_zip(zip_file)
                print(f"📦 {zip_msg}")
                
                # Verificar compatibilidade DV360
                verificacoes = self.verificar_compatibilidade_dv360(html_file)
                
                # Contar resultados
                for status, descricao, detalhes in verificacoes:
                    total_verificacoes += 1
                    if status == "✅":
                        verificacoes_aprovadas += 1
                    print(f"   {status} {descricao}: {detalhes}")
                
                self.resultados.append({
                    'arquivo': os.path.basename(html_file),
                    'zip_ok': zip_ok,
                    'verificacoes': verificacoes
                })
            else:
                print(f"⚠️  Arquivo não encontrado: {html_file} ou {zip_file}")
        
        # Relatório final
        self.gerar_relatorio_final(total_verificacoes, verificacoes_aprovadas)
    
    def gerar_relatorio_final(self, total, aprovadas):
        """Gera relatório final da verificação"""
        print(f"\n{'='*80}")
        print("📊 RELATÓRIO FINAL - VERIFICAÇÃO DV360")
        print(f"{'='*80}")
        
        taxa_aprovacao = (aprovadas / total * 100) if total > 0 else 0
        
        print(f"📈 Total de verificações: {total}")
        print(f"✅ Verificações aprovadas: {aprovadas}")
        print(f"❌ Verificações falharam: {total - aprovadas}")
        print(f"📊 Taxa de aprovação: {taxa_aprovacao:.1f}%")
        
        if taxa_aprovacao == 100:
            print(f"\n🎉 APROVADO PARA DV360!")
            print("✅ Todos os criativos estão compatíveis")
            print("✅ Clicktag aplicada apenas no último frame")
            print("✅ Funcionalidade 100% operacional")
            print("✅ Arquivos .zip válidos")
        else:
            print(f"\n⚠️  NECESSÁRIO CORREÇÃO!")
            print(f"❌ {total - aprovadas} verificações falharam")
            print("🔧 Revisar criativos antes do envio")
        
        print(f"\n{'='*80}")
        print("📋 RESUMO POR ARQUIVO:")
        for resultado in self.resultados:
            arquivo = resultado['arquivo']
            zip_ok = resultado['zip_ok']
            verificacoes = resultado['verificacoes']
            
            aprovadas_arquivo = sum(1 for v in verificacoes if v[0] == "✅")
            total_arquivo = len(verificacoes)
            
            status = "✅ APROVADO" if aprovadas_arquivo == total_arquivo and zip_ok else "❌ REPROVADO"
            print(f"   {status} {arquivo} ({aprovadas_arquivo}/{total_arquivo})")
        
        print(f"\n{'='*80}")
    
    def cleanup(self):
        """Limpa recursos"""
        if self.driver:
            self.driver.quit()

if __name__ == "__main__":
    verificacao = VerificacaoFinalDV360()
    try:
        verificacao.executar_verificacao_completa()
    finally:
        verificacao.cleanup()
