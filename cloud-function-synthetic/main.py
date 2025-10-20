"""
Cloud Function para geração automática de dados sintéticos
Executa a cada hora para gerar 2-3 sessões sintéticas
"""

import functions_framework
import json
import os
import random
import requests
from datetime import datetime, timezone, timedelta
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurações
API_URL = "https://sebrae-survey-api-fs-609095880025.southamerica-east1.run.app/organized-responses"

def generate_synthetic_session(audience_type: str) -> dict:
    """Gerar uma sessão sintética"""
    
    # Perfis comportamentais por audience
    if audience_type == 'small_business':
        # Perfil para pequenos negócios (mais conservador)
        profiles = [
            {'q1': '3', 'q2': '4', 'q3': '3', 'q4': '4', 'q5': '3', 'q6': '4'},  # Moderado
            {'q1': '4', 'q2': '4', 'q3': '4', 'q4': '4', 'q5': '4', 'q6': '4'},  # Positivo
            {'q1': '2', 'q2': '3', 'q3': '2', 'q4': '3', 'q5': '2', 'q6': '3'},  # Conservador
            {'q1': '4', 'q2': '5', 'q3': '4', 'q4': '5', 'q5': '4', 'q6': '5'}   # Muito positivo
        ]
        campaign_id = "synthetic_data_generation_pequenos_negocios"
    else:
        # Perfil para sociedade geral (mais variado)
        profiles = [
            {'q1': '4', 'q2': '4', 'q3': '4', 'q4': '4', 'q5': '4', 'q6': '4'},  # Positivo
            {'q1': '5', 'q2': '5', 'q3': '5', 'q4': '5', 'q5': '5', 'q6': '5'},  # Muito positivo
            {'q1': '3', 'q2': '4', 'q3': '3', 'q4': '4', 'q5': '3', 'q6': '4'},  # Moderado
            {'q1': '4', 'q2': '3', 'q3': '4', 'q4': '3', 'q5': '4', 'q6': '3'}   # Variado
        ]
        campaign_id = "synthetic_data_generation_sociedade"
    
    # Escolher perfil aleatório
    profile = random.choice(profiles)
    
    # Gerar timestamp com variação de horário
    now = datetime.now(timezone.utc)
    # Variação de até 2 horas para trás
    time_variation = random.randint(0, 120)  # minutos
    timestamp = now - timedelta(minutes=time_variation)
    
    # Dados da sessão
    session_data = {
        "session_id": f"session_{audience_type}_{int(timestamp.timestamp())}_{random.randint(1000, 9999)}_synthetic_{timestamp.strftime('%Y-%m-%d')}",
        "source": "synthetic_automation",
        "campaign_id": campaign_id,
        "audience_type": audience_type,
        "timestamp": timestamp.isoformat(),
        "completion_timestamp": timestamp.isoformat(),
        "answers": profile,
        "is_complete": True,
        "data_source": "synthetic",
        "synthetic_profile": f"profile_{random.randint(1, 4)}",
        "synthetic_generation_date": timestamp.strftime('%Y-%m-%d'),
        "question_count": 6,
        "created_at": timestamp.isoformat()
    }
    
    return session_data

def send_to_api(session_data: dict) -> bool:
    """Enviar dados para a API"""
    try:
        # Preparar payload para a API
        payload = {
            "session_id": session_data["session_id"],
            "source": session_data["source"],
            "campaign_id": session_data["campaign_id"],
            "audience_type": session_data["audience_type"],
            "timestamp": session_data["timestamp"],
            "completion_timestamp": session_data["completion_timestamp"],
            "answers": session_data["answers"],
            "is_complete": session_data["is_complete"],
            "data_source": session_data["data_source"],
            "synthetic_profile": session_data["synthetic_profile"],
            "synthetic_generation_date": session_data["synthetic_generation_date"],
            "question_count": session_data["question_count"]
        }
        
        response = requests.post(API_URL, json=payload, timeout=30)
        
        if response.status_code in [200, 201]:
            logger.info(f"✅ Sessão enviada: {session_data['session_id']}")
            return True
        else:
            logger.error(f"❌ Erro ao enviar sessão: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        logger.error(f"❌ Erro na requisição: {str(e)}")
        return False

def generate_synthetic_batch():
    """Gerar lote de sessões sintéticas"""
    logger.info("🤖 Iniciando geração de dados sintéticos")
    
    # Gerar 2-3 sessões por execução
    count = random.randint(2, 3)
    logger.info(f"🎲 Gerando {count} sessões sintéticas")
    
    # Distribuir entre audiences (49.5% PB / 50.5% Sociedade)
    small_business_count = int(count * 0.495)
    general_public_count = count - small_business_count
    
    results = {
        'total_requested': count,
        'total_generated': 0,
        'small_business': 0,
        'general_public': 0,
        'errors': 0,
        'sessions': []
    }
    
    # Gerar sessões para pequenos negócios
    for i in range(small_business_count):
        try:
            session_data = generate_synthetic_session('small_business')
            success = send_to_api(session_data)
            
            if success:
                results['small_business'] += 1
                results['total_generated'] += 1
                results['sessions'].append({
                    'session_id': session_data['session_id'],
                    'audience_type': 'small_business',
                    'success': True
                })
            else:
                results['errors'] += 1
                results['sessions'].append({
                    'session_id': session_data['session_id'],
                    'audience_type': 'small_business',
                    'success': False
                })
                
        except Exception as e:
            logger.error(f"❌ Erro ao gerar sessão PB: {str(e)}")
            results['errors'] += 1
    
    # Gerar sessões para sociedade
    for i in range(general_public_count):
        try:
            session_data = generate_synthetic_session('general_public')
            success = send_to_api(session_data)
            
            if success:
                results['general_public'] += 1
                results['total_generated'] += 1
                results['sessions'].append({
                    'session_id': session_data['session_id'],
                    'audience_type': 'general_public',
                    'success': True
                })
            else:
                results['errors'] += 1
                results['sessions'].append({
                    'session_id': session_data['session_id'],
                    'audience_type': 'general_public',
                    'success': False
                })
                
        except Exception as e:
            logger.error(f"❌ Erro ao gerar sessão Sociedade: {str(e)}")
            results['errors'] += 1
    
    logger.info(f"🎉 Geração concluída: {results['total_generated']}/{results['total_requested']} sessões")
    logger.info(f"   Pequenos Negócios: {results['small_business']}")
    logger.info(f"   Sociedade: {results['general_public']}")
    logger.info(f"   Erros: {results['errors']}")
    
    return results

@functions_framework.http
def generate_synthetic_data(request):
    """HTTP Cloud Function para geração de dados sintéticos"""
    
    # Configurar CORS
    if request.method == 'OPTIONS':
        headers = {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
            'Access-Control-Max-Age': '3600'
        }
        return ('', 204, headers)
    
    headers = {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': 'application/json'
    }
    
    try:
        result = generate_synthetic_batch()
        
        if result['total_generated'] > 0:
            return (json.dumps(result), 200, headers)
        else:
            return (json.dumps(result), 500, headers)
            
    except Exception as e:
        error_result = {
            'status': 'error',
            'error': str(e)
        }
        return (json.dumps(error_result), 500, headers)

if __name__ == '__main__':
    # Para testes locais
    result = generate_synthetic_batch()
    print(json.dumps(result, indent=2))
