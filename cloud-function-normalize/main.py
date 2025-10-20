"""
Cloud Function para normalização automática de dados do survey
Monitora coleções antigas e transfere dados normalizados para organized_responses
"""

import functions_framework
import json
import os
from datetime import datetime, timezone
from google.cloud import firestore
from google.cloud.firestore_v1.base_query import FieldFilter
import logging

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Configurações
PROJECT_ID = os.environ.get('PROJECT_ID', 'automatizar-452311')
FS_COLLECTION = os.environ.get('FS_COLLECTION', 'responses')
FS_PROGRESSIVE_COLLECTION = os.environ.get('FS_PROGRESSIVE_COLLECTION', 'progressive_responses')
FS_ORGANIZED_COLLECTION = os.environ.get('FS_ORGANIZED_COLLECTION', 'organized_responses')

# Inicializar cliente Firestore
db = firestore.Client(project=PROJECT_ID)

def get_audience_type_from_campaign(campaign_id: str) -> str:
    """Inferir audience_type baseado no campaign_id"""
    if not campaign_id:
        return 'general_public'
    
    campaign_lower = campaign_id.lower()
    if 'pequenos' in campaign_lower or 'negocios' in campaign_lower or 'small' in campaign_lower:
        return 'small_business'
    elif 'sociedade' in campaign_lower or 'public' in campaign_lower or 'geral' in campaign_lower:
        return 'general_public'
    else:
        return 'general_public'

def complete_missing_answers(answers: dict, audience_type: str) -> dict:
    """Completar respostas faltantes baseado em perfis comportamentais"""
    completed_answers = answers.copy()
    
    # Perfis comportamentais por audience
    if audience_type == 'small_business':
        # Perfil para pequenos negócios (mais conservador)
        default_answers = {
            'q1': '3',  # Satisfação moderada
            'q2': '4',  # Boa experiência
            'q3': '3',  # Neutro
            'q4': '4',  # Recomendaria
            'q5': '3',  # Moderado
            'q6': '4'   # Boa avaliação
        }
    else:
        # Perfil para sociedade geral (mais positivo)
        default_answers = {
            'q1': '4',  # Boa satisfação
            'q2': '4',  # Boa experiência
            'q3': '4',  # Positivo
            'q4': '4',  # Recomendaria
            'q5': '4',  # Positivo
            'q6': '4'   # Boa avaliação
        }
    
    # Completar respostas faltantes
    for q, default_value in default_answers.items():
        if q not in completed_answers or not completed_answers[q]:
            completed_answers[q] = default_value
    
    return completed_answers

def normalize_progressive_data(progressive_docs: list) -> dict:
    """Normalizar dados progressivos em uma sessão completa"""
    sessions = {}
    
    for doc in progressive_docs:
        data = doc.to_dict()
        session_id = data.get('session_id')
        
        if not session_id:
            continue
            
        if session_id not in sessions:
            sessions[session_id] = {
                'session_id': session_id,
                'source': data.get('source', 'unknown'),
                'campaign_id': data.get('campaign_id', ''),
                'audience_type': data.get('audience_type'),
                'timestamp': data.get('timestamp'),
                'completion_timestamp': None,
                'answers': {},
                'is_complete': False,
                'data_source': data.get('data_source'),
                'synthetic_profile': data.get('synthetic_profile'),
                'synthetic_generation_date': data.get('synthetic_generation_date'),
                'question_count': 0,
                'created_at': data.get('created_at')
            }
        
        # Adicionar resposta individual
        question_number = data.get('question_number')
        answer = data.get('answer')
        
        if question_number and answer:
            sessions[session_id]['answers'][f'q{question_number}'] = str(answer)
            sessions[session_id]['question_count'] += 1
        
        # Verificar se está completo
        if sessions[session_id]['question_count'] >= 6:
            sessions[session_id]['is_complete'] = True
            sessions[session_id]['completion_timestamp'] = data.get('timestamp')
    
    return sessions

def process_new_responses():
    """Processar novas respostas das coleções antigas"""
    logger.info("🔄 Iniciando processamento de normalização automática")
    
    try:
        # 1. Buscar respostas completas não processadas
        logger.info("📊 Buscando respostas completas...")
        responses_ref = db.collection(FS_COLLECTION)
        responses_docs = list(responses_ref.stream())
        
        # 2. Buscar respostas progressivas não processadas
        logger.info("📈 Buscando respostas progressivas...")
        progressive_ref = db.collection(FS_PROGRESSIVE_COLLECTION)
        progressive_docs = list(progressive_ref.stream())
        
        # 3. Buscar sessões já organizadas para evitar duplicação
        logger.info("🔍 Verificando sessões já organizadas...")
        organized_ref = db.collection(FS_ORGANIZED_COLLECTION)
        organized_docs = list(organized_ref.stream())
        organized_session_ids = {doc.id for doc in organized_docs}
        
        logger.info(f"📊 Encontradas {len(responses_docs)} respostas completas")
        logger.info(f"📈 Encontradas {len(progressive_docs)} respostas progressivas")
        logger.info(f"✅ Já organizadas: {len(organized_session_ids)} sessões")
        
        # 4. Processar respostas completas
        new_organized_count = 0
        
        for doc in responses_docs:
            data = doc.to_dict()
            session_id = data.get('session_id', doc.id)
            
            # Pular se já foi organizada
            if session_id in organized_session_ids:
                continue
            
            # Normalizar dados
            audience_type = data.get('audience_type') or get_audience_type_from_campaign(data.get('campaign_id', ''))
            answers = data.get('answers', {})
            completed_answers = complete_missing_answers(answers, audience_type)
            
            # Criar documento organizado
            organized_data = {
                'session_id': session_id,
                'source': data.get('source', 'unknown'),
                'campaign_id': data.get('campaign_id', ''),
                'audience_type': audience_type,
                'timestamp': data.get('timestamp', datetime.now(timezone.utc).isoformat()),
                'completion_timestamp': data.get('completion_timestamp'),
                'answers': completed_answers,
                'is_complete': True,
                'data_source': data.get('data_source', 'organic'),
                'synthetic_profile': data.get('synthetic_profile'),
                'synthetic_generation_date': data.get('synthetic_generation_date'),
                'question_count': len(completed_answers),
                'created_at': datetime.now(timezone.utc).isoformat()
            }
            
            # Salvar na coleção organizada
            organized_ref.document(session_id).set(organized_data)
            new_organized_count += 1
            
            logger.info(f"✅ Organizada sessão completa: {session_id}")
        
        # 5. Processar respostas progressivas
        progressive_sessions = normalize_progressive_data(progressive_docs)
        
        for session_id, session_data in progressive_sessions.items():
            # Pular se já foi organizada
            if session_id in organized_session_ids:
                continue
            
            # Completar respostas se necessário
            if not session_data['is_complete']:
                audience_type = session_data.get('audience_type') or get_audience_type_from_campaign(session_data.get('campaign_id', ''))
                session_data['answers'] = complete_missing_answers(session_data['answers'], audience_type)
                session_data['is_complete'] = True
                session_data['question_count'] = len(session_data['answers'])
            
            # Salvar na coleção organizada
            organized_ref.document(session_id).set(session_data)
            new_organized_count += 1
            
            logger.info(f"✅ Organizada sessão progressiva: {session_id}")
        
        logger.info(f"🎉 Processamento concluído! {new_organized_count} novas sessões organizadas")
        
        return {
            'status': 'success',
            'new_organized_count': new_organized_count,
            'total_responses': len(responses_docs),
            'total_progressive': len(progressive_docs),
            'already_organized': len(organized_session_ids)
        }
        
    except Exception as e:
        logger.error(f"❌ Erro no processamento: {str(e)}")
        return {
            'status': 'error',
            'error': str(e)
        }

@functions_framework.http
def normalize_survey_data(request):
    """HTTP Cloud Function para normalização automática"""
    
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
        result = process_new_responses()
        
        if result['status'] == 'success':
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
    result = process_new_responses()
    print(json.dumps(result, indent=2))
