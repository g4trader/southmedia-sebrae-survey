# Sebrae Survey API — Firestore (Cloud Run)

Backend de baixa latência e alta robustez usando **Firestore (modo nativo)** como armazenamento primário.

## Por que Firestore?
- Escrita rápida e regional (baixa latência)
- Alta disponibilidade e replicação gerenciada
- Custo previsível e simples para eventos pequenos
- Sem necessidade de schema/DDL

## 1) Pré-requisitos
- Projeto GCP com faturamento
- SDK configurado: `gcloud auth login`
- APIs: Run, Build e Firestore

```bash
gcloud services enable run.googleapis.com cloudbuild.googleapis.com firestore.googleapis.com
```

Crie o banco **Nativo** (não Datastore) na **mesma região** do Cloud Run (ex.: `southamerica-east1`).

## 2) Deploy no Cloud Run
```bash
gcloud run deploy sebrae-survey-api-fs \
  --source . \
  --region southamerica-east1 \
  --allow-unauthenticated \
  --set-env-vars PROJECT_ID=$GOOGLE_CLOUD_PROJECT,FS_COLLECTION=responses,ALLOWED_ORIGINS=*
```

## 3) Integração no HTML5
- Use `?api=<URL>/collect` na ad tag do criativo **ou**
- Edite `DEFAULT_API_URL` dentro do HTML.

## 4) Consulta rápida
```bash
# últimos 20 docs
python - << 'PY'
from google.cloud import firestore
db = firestore.Client()
for d in db.collection('responses').order_by('ts', direction=firestore.Query.DESCENDING).limit(20).stream():
    print(d.id, d.to_dict())
PY
```

## 5) Observações
- CORS controlado por `ALLOWED_ORIGINS`.
- Campos opcionais (utm/cid/li/crid) podem vir pela querystring e são salvos em `extra`.
- Para exportação analítica, crie um job (Cloud Run Jobs) que diariamente exporta para GCS/BigQuery.
