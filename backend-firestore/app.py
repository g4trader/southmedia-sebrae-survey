import os
import uuid
import datetime as dt
from flask import Flask, request, jsonify, make_response

try:
    from google.cloud import firestore
    FS_AVAILABLE = True
except Exception:
    FS_AVAILABLE = False

app = Flask(__name__)

PROJECT_ID = os.environ.get("PROJECT_ID")
FS_COLLECTION = os.environ.get("FS_COLLECTION", "responses")
FS_PROGRESSIVE_COLLECTION = os.environ.get("FS_PROGRESSIVE_COLLECTION", "progressive_responses")
FS_ORGANIZED_COLLECTION = os.environ.get("FS_ORGANIZED_COLLECTION", "organized_responses")
ALLOWED_ORIGINS = [o.strip() for o in os.environ.get("ALLOWED_ORIGINS", "*").split(",")]

def _corsify(r):
    origin = request.headers.get("Origin", "*")
    allow = "*"
    if "*" in ALLOWED_ORIGINS:
        allow = origin if origin else "*"
    else:
        if origin in ALLOWED_ORIGINS:
            allow = origin
        elif ALLOWED_ORIGINS:
            allow = ALLOWED_ORIGINS[0]
    r.headers["Access-Control-Allow-Origin"] = allow
    r.headers["Vary"] = "Origin"
    r.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    r.headers["Access-Control-Allow-Methods"] = "POST, OPTIONS"
    r.headers["Access-Control-Max-Age"] = "3600"
    return r

@app.route("/", methods=["GET"])
def health():
    return "OK - v2", 200

@app.route("/collect", methods=["POST", "OPTIONS"])
def collect():
    """Endpoint para coleta progressiva e completa de dados"""
    if request.method == "OPTIONS":
        return _corsify(make_response(("", 204)))

    data = request.get_json(silent=True) or {}
    
    # Check if this is progressive data (single question) or complete data
    is_progressive = "question_number" in data
    is_complete = data.get("is_complete", False)
    
    if is_progressive:
        return handle_progressive_data(data)
    else:
        return handle_complete_data(data)

def handle_progressive_data(data):
    """Handle progressive data collection (single question at a time)"""
    try:
        # Validate progressive data
        required_fields = ["session_id", "question_number", "answer"]
        missing = [field for field in required_fields if not data.get(field)]
        if missing:
            return _corsify(make_response((
                jsonify({"ok": False, "error": "missing_fields", "missing": missing}), 400
            )))

        question_number = data.get("question_number")
        if not isinstance(question_number, int) or question_number < 1 or question_number > 6:
            return _corsify(make_response((
                jsonify({"ok": False, "error": "invalid_question_number"}), 400
            )))

        doc_id = str(uuid.uuid4())
        row = {
            "id": doc_id,
            "session_id": data.get("session_id"),
            "question_number": question_number,
            "answer": data.get("answer"),
            "is_complete": data.get("is_complete", False),
            "timestamp": data.get("timestamp", dt.datetime.utcnow().isoformat() + "Z"),
            "completion_timestamp": data.get("completion_timestamp"),
            "campaign_id": data.get("campaign_id"),
            "audience_type": data.get("audience_type"),  # NOVO: Público-alvo (small_business ou general_public)
            "line_item_id": data.get("line_item_id"),
            "creative_id": data.get("creative_id"),
            "page_url": data.get("page_url"),
            "user_agent": data.get("user_agent", request.headers.get("User-Agent", "")),
            "referer": request.headers.get("Referer", ""),
            "origin": request.headers.get("Origin", ""),
            "all_answers": data.get("all_answers"),  # Only present for last question
            # Campos de rastreabilidade para dados sintéticos
            "data_source": data.get("data_source"),  # "synthetic" ou None
            "synthetic_profile": data.get("synthetic_profile"),  # perfil comportamental
            "synthetic_generation_date": data.get("synthetic_generation_date"),  # timestamp de geração
        }

        stored = "log_only"
        if FS_AVAILABLE:
            client = firestore.Client(project=PROJECT_ID) if PROJECT_ID else firestore.Client()
            client.collection(FS_PROGRESSIVE_COLLECTION).document(doc_id).set(row)
            stored = "firestore"

        return _corsify(make_response((
            jsonify({
                "ok": True, 
                "stored": stored, 
                "id": doc_id,
                "type": "progressive",
                "question_number": question_number,
                "is_complete": data.get("is_complete", False)
            }), 200
        )))

    except Exception as e:
        return _corsify(make_response((
            jsonify({"ok": False, "error": str(e)}), 500
        )))

def handle_complete_data(data):
    """Handle complete data collection (all questions at once)"""
    try:
        # Validate complete data
        required = [f"q{i}" for i in range(1, 7)]
        missing = [k for k in required if not data.get(k)]
        if missing:
            return _corsify(make_response((
                jsonify({"ok": False, "error": "missing_answers", "missing": missing}), 400
            )))

        doc_id = str(uuid.uuid4())
        row = {
            "id": doc_id,
            "ts": dt.datetime.utcnow().isoformat(timespec="seconds") + "Z",
            "q1": data.get("q1"), "q2": data.get("q2"), "q3": data.get("q3"),
            "q4": data.get("q4"), "q5": data.get("q5"), "q6": data.get("q6"),
            "session_id": data.get("session_id"),
            "campaign_id": data.get("campaign_id"),
            "line_item_id": data.get("line_item_id"),
            "creative_id": data.get("creative_id"),
            "page_url": data.get("page_url"),
            "ua": request.headers.get("User-Agent", ""),
            "referer": request.headers.get("Referer", ""),
            "origin": request.headers.get("Origin", ""),
            "extra": data.get("extra"),
            "is_complete": data.get("is_complete", True),
            "completion_timestamp": data.get("completion_timestamp", dt.datetime.utcnow().isoformat() + "Z"),
        }

        stored = "log_only"
        if FS_AVAILABLE:
            client = firestore.Client(project=PROJECT_ID) if PROJECT_ID else firestore.Client()
            client.collection(FS_COLLECTION).document(doc_id).set(row)
            stored = "firestore"

        return _corsify(make_response((
            jsonify({"ok": True, "stored": stored, "id": doc_id, "type": "complete"}), 200
        )))

    except Exception as e:
        return _corsify(make_response((
            jsonify({"ok": False, "error": str(e)}), 500
        )))

@app.route("/responses", methods=["GET"])
def list_responses():
    """Endpoint para listar todas as respostas coletadas (completas)"""
    if not FS_AVAILABLE:
        return _corsify(make_response((
            jsonify({"ok": False, "error": "firestore_not_available"}), 500
        )))
    
    try:
        client = firestore.Client(project=PROJECT_ID) if PROJECT_ID else firestore.Client()
        docs = client.collection(FS_COLLECTION).order_by('ts', direction=firestore.Query.DESCENDING).stream()
        
        responses = []
        for doc in docs:
            data = doc.to_dict()
            responses.append({
                "id": doc.id,
                "timestamp": data.get("ts"),
                "session_id": data.get("session_id"),
                "campaign_id": data.get("campaign_id"),
                "answers": {
                    "q1": data.get("q1"),
                    "q2": data.get("q2"),
                    "q3": data.get("q3"),
                    "q4": data.get("q4"),
                    "q5": data.get("q5"),
                    "q6": data.get("q6")
                },
                "metadata": {
                    "user_agent": data.get("ua", "")[:100] if data.get("ua") else None,
                    "referer": data.get("referer"),
                    "origin": data.get("origin"),
                    "page_url": data.get("page_url"),
                    "is_complete": data.get("is_complete", True)
                }
            })
        
        return _corsify(make_response((
            jsonify({"ok": True, "count": len(responses), "responses": responses}), 200
        )))
        
    except Exception as e:
        return _corsify(make_response((
            jsonify({"ok": False, "error": str(e)}), 500
        )))

@app.route("/progressive-responses", methods=["GET"])
def list_progressive_responses():
    """Endpoint para listar todas as respostas progressivas"""
    if not FS_AVAILABLE:
        return _corsify(make_response((
            jsonify({"ok": False, "error": "firestore_not_available"}), 500
        )))
    
    try:
        client = firestore.Client(project=PROJECT_ID) if PROJECT_ID else firestore.Client()
        docs = client.collection(FS_PROGRESSIVE_COLLECTION).order_by('timestamp', direction=firestore.Query.DESCENDING).stream()
        
        responses = []
        for doc in docs:
            data = doc.to_dict()
            responses.append({
                "id": doc.id,
                "session_id": data.get("session_id"),
                "question_number": data.get("question_number"),
                "answer": data.get("answer"),
                "is_complete": data.get("is_complete", False),
                "timestamp": data.get("timestamp"),
                "completion_timestamp": data.get("completion_timestamp"),
                "campaign_id": data.get("campaign_id"),
                "audience_type": data.get("audience_type"),  # Público-alvo
                "all_answers": data.get("all_answers"),
                # Campos de rastreabilidade
                "data_source": data.get("data_source"),
                "synthetic_profile": data.get("synthetic_profile"),
                "synthetic_generation_date": data.get("synthetic_generation_date")
            })
        
        return _corsify(make_response((
            jsonify({"ok": True, "count": len(responses), "responses": responses}), 200
        )))
        
    except Exception as e:
        return _corsify(make_response((
            jsonify({"ok": False, "error": str(e)}), 500
        )))

@app.route("/analytics", methods=["GET"])
def get_analytics():
    """Endpoint para obter analytics das respostas progressivas"""
    if not FS_AVAILABLE:
        return _corsify(make_response((
            jsonify({"ok": False, "error": "firestore_not_available"}), 500
        )))
    
    try:
        client = firestore.Client(project=PROJECT_ID) if PROJECT_ID else firestore.Client()
        
        # Get progressive responses
        progressive_docs = client.collection(FS_PROGRESSIVE_COLLECTION).stream()
        
        # Group by session_id to analyze completion rates
        sessions = {}
        question_stats = {}
        
        for doc in progressive_docs:
            data = doc.to_dict()
            session_id = data.get("session_id")
            question_number = data.get("question_number")
            
            if session_id not in sessions:
                sessions[session_id] = {
                    "questions_answered": set(),
                    "is_complete": False,
                    "completion_timestamp": None
                }
            
            sessions[session_id]["questions_answered"].add(question_number)
            if data.get("is_complete"):
                sessions[session_id]["is_complete"] = True
                sessions[session_id]["completion_timestamp"] = data.get("completion_timestamp")
            
            # Question statistics
            if question_number not in question_stats:
                question_stats[question_number] = {"total": 0, "answers": {}}
            
            question_stats[question_number]["total"] += 1
            answer = data.get("answer")
            if answer not in question_stats[question_number]["answers"]:
                question_stats[question_number]["answers"][answer] = 0
            question_stats[question_number]["answers"][answer] += 1
        
        # Calculate completion rates
        total_sessions = len(sessions)
        completed_sessions = sum(1 for s in sessions.values() if s["is_complete"])
        completion_rate = (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0
        
        # Calculate drop-off rates by question
        drop_off_stats = {}
        for question_num in range(1, 7):
            answered_count = sum(1 for s in sessions.values() if question_num in s["questions_answered"])
            drop_off_stats[question_num] = {
                "answered": answered_count,
                "drop_off_rate": ((total_sessions - answered_count) / total_sessions * 100) if total_sessions > 0 else 0
            }
        
        return _corsify(make_response((
            jsonify({
                "ok": True,
                "analytics": {
                    "total_sessions": total_sessions,
                    "completed_sessions": completed_sessions,
                    "completion_rate": round(completion_rate, 2),
                    "drop_off_by_question": drop_off_stats,
                    "question_statistics": question_stats
                }
            }), 200
        )))
        
    except Exception as e:
        return _corsify(make_response((
            jsonify({"ok": False, "error": str(e)}), 500
        )))

@app.route("/organized-responses", methods=["GET", "POST", "OPTIONS"])
def organized_responses():
    """Endpoint para gerenciar respostas da coleção organizada"""
    if request.method == "OPTIONS":
        return _corsify(make_response(("", 204)))
    
    if request.method == "GET":
        return list_organized_responses()
    elif request.method == "POST":
        return create_organized_response()

def list_organized_responses():
    """Listar respostas da coleção organizada"""
    if not FS_AVAILABLE:
        return _corsify(make_response((
            jsonify({"ok": False, "error": "Firestore não disponível"}), 500
        )))
    
    try:
        db = firestore.Client(project=PROJECT_ID)
        collection_ref = db.collection(FS_ORGANIZED_COLLECTION)
        
        # Buscar todos os documentos
        docs = collection_ref.stream()
        
        responses = []
        for doc in docs:
            data = doc.to_dict()
            responses.append({
                "id": doc.id,
                "session_id": data.get("session_id"),
                "source": data.get("source"),
                "campaign_id": data.get("campaign_id"),
                "audience_type": data.get("audience_type"),
                "timestamp": data.get("timestamp"),
                "completion_timestamp": data.get("completion_timestamp"),
                "answers": data.get("answers", {}),
                "is_complete": data.get("is_complete", False),
                "data_source": data.get("data_source"),
                "synthetic_profile": data.get("synthetic_profile"),
                "synthetic_generation_date": data.get("synthetic_generation_date"),
                "question_count": data.get("question_count", 0),
                "created_at": data.get("created_at")
            })
        
        return _corsify(make_response((
            jsonify({
                "ok": True,
                "responses": responses,
                "total": len(responses)
            }), 200
        )))
        
    except Exception as e:
        return _corsify(make_response((
            jsonify({"ok": False, "error": str(e)}), 500
        )))

def create_organized_response():
    """Criar/atualizar respostas na coleção organizada"""
    if not FS_AVAILABLE:
        return _corsify(make_response((
            jsonify({"ok": False, "error": "Firestore não disponível"}), 500
        )))
    
    try:
        data = request.get_json(silent=True) or {}
        
        if not data.get("session_id"):
            return _corsify(make_response((
                jsonify({"ok": False, "error": "session_id é obrigatório"}), 400
            )))
        
        db = firestore.Client(project=PROJECT_ID)
        collection_ref = db.collection(FS_ORGANIZED_COLLECTION)
        
        # Criar documento organizado
        doc_data = {
            "session_id": data.get("session_id"),
            "source": data.get("source", "unknown"),
            "campaign_id": data.get("campaign_id", ""),
            "audience_type": data.get("audience_type", "unknown"),
            "timestamp": data.get("timestamp", dt.datetime.utcnow().isoformat() + "Z"),
            "completion_timestamp": data.get("completion_timestamp"),
            "answers": data.get("answers", {}),
            "is_complete": data.get("is_complete", False),
            "data_source": data.get("data_source"),
            "synthetic_profile": data.get("synthetic_profile"),
            "synthetic_generation_date": data.get("synthetic_generation_date"),
            "question_count": data.get("question_count", 0),
            "created_at": dt.datetime.utcnow().isoformat() + "Z"
        }
        
        # Usar session_id como ID do documento para evitar duplicações
        doc_ref = collection_ref.document(data.get("session_id"))
        doc_ref.set(doc_data)
        
        return _corsify(make_response((
            jsonify({
                "ok": True,
                "message": "Resposta organizada criada/atualizada com sucesso",
                "session_id": data.get("session_id")
            }), 201
        )))
        
    except Exception as e:
        return _corsify(make_response((
            jsonify({"ok": False, "error": str(e)}), 500
        )))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=int(os.environ.get("PORT", 8080)))
