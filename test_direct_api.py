#!/usr/bin/env python3
"""
Teste direto da API para verificar se o backend está funcionando corretamente
"""

import requests
import json
import time

def test_direct_api():
    """Testa a API diretamente com dados progressivos"""
    
    print("🧪 Testando API diretamente...")
    
    # URL da API
    api_url = "https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/collect"
    
    # Dados de teste - última pergunta com is_complete=true
    test_data = {
        "session_id": f"test_direct_api_{int(time.time())}",
        "question_number": 6,
        "answer": "muitas_parcerias",
        "is_complete": True,
        "timestamp": "2025-01-19T21:30:00Z",
        "campaign_id": "sebrae_survey_v2_pequenos_negocios",
        "audience_type": "small_business",
        "all_answers": {
            "q1": "sempre",
            "q2": "maioria",
            "q3": "alguma",
            "q4": "sempre",
            "q5": "muito_agil",
            "q6": "muitas_parcerias"
        },
        "completion_timestamp": "2025-01-19T21:30:00Z",
        "user_agent": "Mozilla/5.0 Test Browser",
        "referer": "",
        "origin": "",
        "page_url": "file://test"
    }
    
    print(f"📤 Enviando dados: {json.dumps(test_data, indent=2)}")
    
    try:
        # Fazer requisição POST
        response = requests.post(
            api_url,
            headers={"Content-Type": "application/json"},
            json=test_data
        )
        
        print(f"📡 Status da resposta: {response.status_code}")
        print(f"📄 Resposta: {response.text}")
        
        if response.status_code == 200:
            result = response.json()
            print(f"✅ Resposta OK: {result}")
            
            # Verificar se foi salvo em ambas as coleções
            if result.get("stored") == "firestore_both":
                print("🎉 SUCESSO! Dados salvos em ambas as coleções!")
                return True
            else:
                print(f"⚠️ Dados salvos apenas em: {result.get('stored')}")
                return False
        else:
            print(f"❌ Erro na API: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro na requisição: {e}")
        return False

def check_dashboard_count():
    """Verifica o contador do dashboard"""
    try:
        response = requests.get('https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/responses')
        if response.status_code == 200:
            data = response.json()
            count = data.get('count', 0)
            print(f"📊 Contador atual do dashboard: {count}")
            return count
        return 0
    except Exception as e:
        print(f"Erro ao verificar contador: {e}")
        return 0

if __name__ == "__main__":
    print("🚀 Testando API diretamente...")
    
    # Verificar contador inicial
    initial_count = check_dashboard_count()
    
    # Testar API
    api_success = test_direct_api()
    
    # Aguardar um pouco
    print("⏳ Aguardando processamento...")
    time.sleep(5)
    
    # Verificar contador final
    final_count = check_dashboard_count()
    
    print(f"\n📋 RESUMO:")
    print(f"📊 Contador inicial: {initial_count}")
    print(f"📊 Contador final: {final_count}")
    print(f"🎯 API funcionou: {'✅ SIM' if api_success else '❌ NÃO'}")
    
    if final_count > initial_count:
        print("🎉 SUCESSO! Dashboard incrementou!")
    else:
        print("❌ FALHA! Dashboard não incrementou.")
        
        if api_success:
            print("💡 API funcionou, mas dashboard não incrementou. Problema pode estar na lógica de salvamento.")
        else:
            print("💡 API não funcionou. Problema está no backend.")
