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
    return "OK", 200

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
    }

    stored = "log_only"
    if FS_AVAILABLE:
        # Firestore client is regional and low‑latency; native mode recommended.
        client = firestore.Client(project=PROJECT_ID) if PROJECT_ID else firestore.Client()
        client.collection(FS_COLLECTION).document(doc_id).set(row)
        stored = "firestore"

    resp = jsonify({"ok": True, "stored": stored, "id": doc_id})
    return _corsify(make_response((resp, 200)))

@app.route("/responses", methods=["GET"])
def list_responses():
    """Endpoint temporário para listar respostas"""
    if not FS_AVAILABLE:
        return _corsify(make_response((
            jsonify({"ok": False, "error": "firestore_not_available"}), 500
        )))
    
    try:
        client = firestore.Client(project=PROJECT_ID) if PROJECT_ID else firestore.Client()
        docs = client.collection(FS_COLLECTION).order_by('ts', direction=firestore.Query.DESCENDING).limit(10).stream()
        
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
                    "page_url": data.get("page_url")
                }
            })
        
        return _corsify(make_response((
            jsonify({"ok": True, "count": len(responses), "responses": responses}), 200
        )))
        
    except Exception as e:
        return _corsify(make_response((
            jsonify({"ok": False, "error": str(e)}), 500
        )))
