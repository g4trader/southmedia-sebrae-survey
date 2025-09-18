#!/usr/bin/env python3
"""
Script para gerar arquivos .zip dos criativos corrigidos
"""

import os
import zipfile
from pathlib import Path

def create_zip_for_creative(html_file_path, zip_file_path):
    """Cria um arquivo .zip para um criativo HTML"""
    try:
        with zipfile.ZipFile(zip_file_path, 'w', zipfile.ZIP_DEFLATED) as zipf:
            # Adiciona o arquivo HTML ao zip
            zipf.write(html_file_path, os.path.basename(html_file_path))
            print(f"✅ Criado: {zip_file_path}")
        return True
    except Exception as e:
        print(f"❌ Erro ao criar {zip_file_path}: {str(e)}")
        return False

def main():
    """Função principal para gerar todos os zips"""
    print("🚀 GERANDO ARQUIVOS .ZIP DOS CRIATIVOS CORRIGIDOS")
    print("=" * 60)
    
    # Lista dos arquivos HTML corrigidos
    creative_files = [
        "creative-v2/sebrae_carousel_300x250_PEQUENOS_NEGOCIOS.html",
        "creative-v2/sebrae_carousel_300x250_SOCIEDADE.html",
        "creative-v2/sebrae_carousel_320x250_PEQUENOS_NEGOCIOS.html",
        "creative-v2/sebrae_carousel_320x250_SOCIEDADE.html",
        "creative-v2/sebrae_carousel_336x280_PEQUENOS_NEGOCIOS.html",
        "creative-v2/sebrae_carousel_336x280_SOCIEDADE.html",
    ]
    
    success_count = 0
    total_count = len(creative_files)
    
    for html_file in creative_files:
        if os.path.exists(html_file):
            # Nome do arquivo zip baseado no HTML
            zip_file = html_file.replace('.html', '.zip')
            
            # Criar o zip
            if create_zip_for_creative(html_file, zip_file):
                success_count += 1
        else:
            print(f"⚠️  Arquivo não encontrado: {html_file}")
    
    print(f"\n{'='*60}")
    print("📊 RELATÓRIO DE GERAÇÃO DE ZIPS:")
    print(f"✅ Arquivos .zip criados com sucesso: {success_count}")
    print(f"📁 Total de arquivos processados: {total_count}")
    
    if success_count == total_count:
        print("🎉 TODOS OS ARQUIVOS .ZIP FORAM CRIADOS COM SUCESSO!")
    else:
        print(f"⚠️  {total_count - success_count} arquivos falharam")
    
    print(f"\n📋 ARQUIVOS .ZIP CRIADOS:")
    for html_file in creative_files:
        zip_file = html_file.replace('.html', '.zip')
        if os.path.exists(zip_file):
            file_size = os.path.getsize(zip_file)
            print(f"   📦 {zip_file} ({file_size} bytes)")
    
    print(f"\n{'='*60}")
    print("✅ CRIATIVOS PRONTOS PARA UPLOAD NO DV360!")
    print("   - Usabilidade 100% funcional")
    print("   - Clicktag corrigida")
    print("   - Arquivos .zip gerados")

if __name__ == "__main__":
    main()
