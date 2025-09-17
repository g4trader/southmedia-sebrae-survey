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
FS_COLLECTION = os.environ.get("FS_COLLECTION", "responses_v2")
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
    return "OK V2", 200

@app.route("/collect", methods=["POST", "OPTIONS"])
def collect():
    if request.method == "OPTIONS":
        return _corsify(make_response(("", 204)))

    data = request.get_json(silent=True) or {}
    required = [f"q{i}" for i in range(1, 7)]
    missing = [k for k in required if not data.get(k)]
    if missing:
        return _corsify(make_response((
            jsonify({"ok": False, "error": "missing_answers", "missing": missing}), 400
        )))

    # Validar audience_type
    audience_type = data.get("audience_type")
    if not audience_type or audience_type not in ["small_business", "general_public"]:
        return _corsify(make_response((
            jsonify({"ok": False, "error": "invalid_audience_type"}), 400
        )))

    # Preparar dados para salvar
    response_id = str(uuid.uuid4())
    session_id = data.get("session_id", str(uuid.uuid4()))
    campaign_id = data.get("campaign_id", "sebrae_survey_v2")
    
    doc_data = {
        "id": response_id,
        "timestamp": dt.datetime.utcnow(),
        "session_id": session_id,
        "campaign_id": campaign_id,
        "audience_type": audience_type,
        "answers": {k: data[k] for k in required},
        "metadata": {
            "user_agent": request.headers.get("User-Agent", ""),
            "referer": request.headers.get("Referer", ""),
            "origin": request.headers.get("Origin", ""),
            "page_url": data.get("page_url", ""),
        }
    }

    if FS_AVAILABLE and PROJECT_ID:
        try:
            db = firestore.Client(project=PROJECT_ID)
            db.collection(FS_COLLECTION).document(response_id).set(doc_data)
        except Exception as e:
            return _corsify(make_response((
                jsonify({"ok": False, "error": "database_error", "details": str(e)}), 500
            )))

    return _corsify(make_response((
        jsonify({"ok": True, "id": response_id, "audience_type": audience_type}), 200
    )))

@app.route("/responses", methods=["GET"])
def list_responses():
    if not FS_AVAILABLE or not PROJECT_ID:
        return _corsify(make_response((
            jsonify({"ok": False, "error": "database_not_available"}), 500
        )))

    try:
        db = firestore.Client(project=PROJECT_ID)
        docs = db.collection(FS_COLLECTION).stream()
        
        responses = []
        for doc in docs:
            data = doc.to_dict()
            data["timestamp"] = data["timestamp"].isoformat() if data.get("timestamp") else None
            responses.append(data)
        
        return _corsify(make_response((
            jsonify({"ok": True, "responses": responses, "count": len(responses)}), 200
        )))
    except Exception as e:
        return _corsify(make_response((
            jsonify({"ok": False, "error": "database_error", "details": str(e)}), 500
        )))

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 8080)), debug=True)
