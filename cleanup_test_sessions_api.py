#!/usr/bin/env python3
"""
Script para remover todas as sessões de teste usando a API do backend
Remove registros que começam com 'test_' tanto da coleção 'responses' quanto 'progressive_responses'
"""

import requests
import json
import sys
from datetime import datetime

# URLs das APIs
API_BASE_URL = "https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app"
RESPONSES_URL = f"{API_BASE_URL}/responses"
PROGRESSIVE_URL = f"{API_BASE_URL}/progressive-responses"

def get_all_responses():
    """Busca todas as respostas da API"""
    try:
        response = requests.get(RESPONSES_URL, timeout=30)
        if response.status_code == 200:
            return response.json().get('responses', [])
        else:
            print(f"❌ Erro ao buscar respostas: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")
        return []

def get_all_progressive_responses():
    """Busca todas as respostas progressivas da API"""
    try:
        response = requests.get(PROGRESSIVE_URL, timeout=30)
        if response.status_code == 200:
            return response.json().get('responses', [])
        else:
            print(f"❌ Erro ao buscar respostas progressivas: {response.status_code}")
            return []
    except Exception as e:
        print(f"❌ Erro na requisição: {str(e)}")
        return []

def preview_test_sessions():
    """Mostra uma prévia das sessões de teste"""
    print("🔍 PREVIEW - Sessões de teste encontradas:")
    print("-" * 50)
    
    # Buscar respostas principais
    print("📋 Buscando respostas principais...")
    responses = get_all_responses()
    
    test_responses = []
    for resp in responses:
        session_id = resp.get('session_id', '')
        if session_id.startswith('test_'):
            test_responses.append(resp)
    
    print(f"📋 Coleção 'responses':")
    for resp in test_responses:
        print(f"  📄 {resp.get('id')} - session_id: {resp.get('session_id')} - timestamp: {resp.get('timestamp')}")
    
    print(f"  Total: {len(test_responses)} registros")
    
    # Buscar respostas progressivas
    print("📋 Buscando respostas progressivas...")
    progressive_responses = get_all_progressive_responses()
    
    test_progressive = []
    for resp in progressive_responses:
        session_id = resp.get('session_id', '')
        if session_id.startswith('test_'):
            test_progressive.append(resp)
    
    print(f"📋 Coleção 'progressive_responses':")
    for resp in test_progressive:
        print(f"  📄 {resp.get('id')} - session_id: {resp.get('session_id')} - pergunta: {resp.get('question_number')}")
    
    print(f"  Total: {len(test_progressive)} registros")
    
    total_preview = len(test_responses) + len(test_progressive)
    print("-" * 50)
    print(f"📊 TOTAL DE REGISTROS DE TESTE: {total_preview}")
    
    return test_responses, test_progressive

def delete_test_sessions(test_responses, test_progressive):
    """Remove as sessões de teste usando o endpoint da API"""
    print("🚀 Removendo sessões de teste via API...")
    print("-" * 50)
    
    try:
        # Chamar o endpoint de limpeza
        cleanup_url = f"{API_BASE_URL}/cleanup-test-sessions"
        response = requests.post(cleanup_url, timeout=60)
        
        if response.status_code == 200:
            result = response.json()
            print("✅ Limpeza concluída com sucesso!")
            print(f"📊 Resultado:")
            print(f"   - Coleção 'responses': {result['deleted']['responses']} registros removidos")
            print(f"   - Coleção 'progressive': {result['deleted']['progressive']} registros removidos")
            print(f"   - Total: {result['deleted']['total']} registros removidos")
            print(f"⏰ Timestamp: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
        else:
            print(f"❌ Erro na limpeza: {response.status_code}")
            print(f"📋 Resposta: {response.text}")
            
    except Exception as e:
        print(f"❌ Erro durante a limpeza: {str(e)}")
        print("\n💡 Alternativas:")
        print("   - Verificar se o endpoint está funcionando")
        print("   - Usar o script cleanup_test_sessions.py com credenciais corretas")
        print("   - Remover manualmente via console do Google Cloud")

def main():
    print("🧹 SCRIPT DE LIMPEZA - SESSÕES DE TESTE (via API)")
    print("=" * 60)
    
    # Verificar argumentos
    if len(sys.argv) > 1 and sys.argv[1] == "--preview":
        # Apenas mostrar preview
        test_responses, test_progressive = preview_test_sessions()
        if test_responses or test_progressive:
            print("\n💡 Para ver instruções de remoção, execute: python cleanup_test_sessions_api.py --delete")
        else:
            print("\n✅ Nenhuma sessão de teste encontrada!")
    elif len(sys.argv) > 1 and sys.argv[1] == "--delete":
        # Mostrar instruções de remoção
        test_responses, test_progressive = preview_test_sessions()
        if test_responses or test_progressive:
            print("\n" + "="*60)
            delete_test_sessions(test_responses, test_progressive)
        else:
            print("\n✅ Nenhuma sessão de teste encontrada para remover!")
    else:
        # Mostrar ajuda
        print("📖 USO:")
        print("  python cleanup_test_sessions_api.py --preview   # Ver sessões de teste")
        print("  python cleanup_test_sessions_api.py --delete    # Ver instruções de remoção")
        print("\n💡 Recomendação: Execute primeiro com --preview para ver o que será removido")

if __name__ == "__main__":
    main()
