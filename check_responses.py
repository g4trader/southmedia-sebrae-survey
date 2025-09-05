#!/usr/bin/env python3
"""
Script para verificar as respostas coletadas no Firestore
"""

import requests
import json
from datetime import datetime

def get_firestore_responses():
    """Busca respostas do Firestore via API REST"""
    
    # Configurações
    project_id = "automatizar-452311"
    collection_id = "responses"
    
    # URL da API REST do Firestore
    url = f"https://firestore.googleapis.com/v1/projects/{project_id}/databases/(default)/documents/{collection_id}"
    
    # Headers com autenticação
    headers = {
        "Authorization": "Bearer ya29.a0AS3H6NziYj5Hk8ioj-7kTB158XZfKFDcwUTcg_rSCQW_Yc2TlD14qnFW9BY_3qOmlCHqpkRmJvP3x6tpQlWQa3HXoOsWFN2cIi8p3M2wUszRBP0pISe5ySKWWba0Zd0flnGfalxramD3JOSyueZbt4y_oX-PzG-Llul01ynLWAqgfobAl8fY6Jdy6L3AGLREA4_iuzfXQjswaCgYKATISARQSFQHGX2MirFCQCoNYA0PHKrJVcHIFaQ0213",
        "Content-Type": "application/json"
    }
    
    try:
        print("🔍 Buscando respostas no Firestore...")
        
        # Faz a requisição
        response = requests.get(url, headers=headers, timeout=30)
        
        if response.status_code == 200:
            data = response.json()
            documents = data.get('documents', [])
            
            print(f"📊 Encontradas {len(documents)} respostas:")
            print("=" * 80)
            
            # Processa cada documento
            for i, doc in enumerate(documents, 1):
                doc_id = doc['name'].split('/')[-1]
                fields = doc.get('fields', {})
                
                # Extrai os dados
                timestamp = fields.get('ts', {}).get('stringValue', 'N/A')
                session_id = fields.get('session_id', {}).get('stringValue', 'N/A')
                campaign_id = fields.get('campaign_id', {}).get('stringValue', 'N/A')
                
                # Extrai as respostas
                answers = {}
                for q in range(1, 7):
                    q_key = f'q{q}'
                    if q_key in fields:
                        answers[q_key] = fields[q_key].get('stringValue', 'N/A')
                
                # Extrai metadados
                user_agent = fields.get('ua', {}).get('stringValue', '')
                referer = fields.get('referer', {}).get('stringValue', '')
                origin = fields.get('origin', {}).get('stringValue', '')
                page_url = fields.get('page_url', {}).get('stringValue', '')
                
                print(f"\n📋 Resposta {i}:")
                print(f"   ID: {doc_id}")
                print(f"   Timestamp: {timestamp}")
                print(f"   Session: {session_id}")
                print(f"   Campaign: {campaign_id}")
                print(f"   Respostas:")
                for q, answer in answers.items():
                    print(f"     {q}: {answer}")
                
                if user_agent:
                    print(f"   User Agent: {user_agent[:50]}...")
                if referer:
                    print(f"   Referer: {referer}")
                if origin:
                    print(f"   Origin: {origin}")
                if page_url:
                    print(f"   Page URL: {page_url}")
                
                print("   " + "-" * 60)
            
            return True
            
        else:
            print(f"❌ Erro na API: {response.status_code}")
            print(f"Resposta: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao buscar respostas: {e}")
        return False

def test_api_directly():
    """Testa a API diretamente para verificar se está funcionando"""
    print("🔍 Testando API diretamente...")
    
    api_url = "https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app"
    
    try:
        # Testa health check
        response = requests.get(f"{api_url}/", timeout=10)
        if response.status_code == 200:
            print("✅ API está funcionando")
            
            # Testa endpoint de coleta
            test_data = {
                "q1": "sempre",
                "q2": "maioria", 
                "q3": "engajado",
                "q4": "sempre",
                "q5": "muito_agil",
                "q6": "muitas_parcerias",
                "session_id": "test-check-responses",
                "campaign_id": "test-check"
            }
            
            response = requests.post(
                f"{api_url}/collect",
                json=test_data,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                result = response.json()
                print(f"✅ Teste de coleta funcionando - ID: {result['id']}")
                return True
            else:
                print(f"❌ Erro no teste de coleta: {response.status_code}")
                return False
        else:
            print(f"❌ API não está funcionando: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Erro ao testar API: {e}")
        return False

if __name__ == "__main__":
    print("🚀 Verificando Respostas Coletadas")
    print("=" * 50)
    
    # Testa a API primeiro
    api_ok = test_api_directly()
    
    if api_ok:
        # Tenta buscar as respostas
        get_firestore_responses()
    else:
        print("❌ API não está funcionando, não é possível verificar as respostas")
