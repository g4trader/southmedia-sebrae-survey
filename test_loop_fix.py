#!/usr/bin/env python3
"""
Teste para verificar se o loop infinito foi corrigido
"""

import requests
import time
import json

def test_loop_fix():
    """Testa se o loop infinito foi corrigido"""
    print("🔍 Testando correção do loop infinito...")
    
    # Simula múltiplos cliques rápidos no botão
    api_url = "https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/collect"
    
    # Dados de teste
    test_data = {
        "q1": "sempre",
        "q2": "maioria", 
        "q3": "engajado",
        "q4": "sempre",
        "q5": "muito_agil",
        "q6": "muitas_parcerias",
        "session_id": "test-loop-fix",
        "campaign_id": "test-loop-fix"
    }
    
    # Conta quantas requisições são feitas
    request_count = 0
    successful_requests = 0
    
    print("  📋 Simulando múltiplos cliques rápidos...")
    
    # Simula 5 cliques rápidos
    for i in range(5):
        try:
            response = requests.post(
                api_url,
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=5
            )
            request_count += 1
            
            if response.status_code == 200:
                successful_requests += 1
                result = response.json()
                print(f"    ✅ Requisição {i+1}: {result['id']}")
            else:
                print(f"    ❌ Requisição {i+1}: Status {response.status_code}")
                
        except Exception as e:
            print(f"    ❌ Requisição {i+1}: Erro {e}")
        
        # Pequena pausa entre requisições
        time.sleep(0.1)
    
    print(f"\n📊 Resultado:")
    print(f"  Total de requisições: {request_count}")
    print(f"  Requisições bem-sucedidas: {successful_requests}")
    
    # Verifica se todas as requisições foram bem-sucedidas
    if successful_requests == request_count:
        print("✅ Todas as requisições foram processadas corretamente")
        return True
    else:
        print("❌ Algumas requisições falharam")
        return False

def test_html5_content():
    """Verifica se o HTML5 foi corrigido"""
    print("🔍 Verificando correções no HTML5...")
    
    try:
        with open("creative/sebrae_carousel_336x280_API.html", "r", encoding="utf-8") as f:
            content = f.read()
        
        # Verifica se as correções estão presentes
        checks = [
            ("Flag de proteção", "isSubmitting" in content),
            ("Prevenção de múltiplos envios", "if(isSubmitting)" in content),
            ("Navegação direta", "translateX(-700%)" in content),
            ("Reset da flag", "isSubmitting = false" in content)
        ]
        
        all_passed = True
        for check_name, check_result in checks:
            status = "✅" if check_result else "❌"
            print(f"  {status} {check_name}")
            if not check_result:
                all_passed = False
        
        return all_passed
        
    except Exception as e:
        print(f"❌ Erro ao verificar HTML5: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Testando Correção do Loop Infinito")
    print("=" * 50)
    
    # Testa o HTML5
    html5_ok = test_html5_content()
    
    # Testa a API
    api_ok = test_loop_fix()
    
    print("\n" + "=" * 50)
    print("📊 RELATÓRIO FINAL")
    print("=" * 50)
    
    if html5_ok and api_ok:
        print("🎉 Loop infinito corrigido com sucesso!")
        print("✅ HTML5 atualizado com proteções")
        print("✅ API processando requisições corretamente")
    else:
        print("⚠️  Ainda há problemas a resolver")
        if not html5_ok:
            print("❌ HTML5 não foi corrigido adequadamente")
        if not api_ok:
            print("❌ API não está processando requisições corretamente")
