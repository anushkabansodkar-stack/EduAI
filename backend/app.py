"""
EduAI Flask REST API Backend
Subject: Science 2
"""

import os
import sys

# Path bootstrapping so both 'python app.py' and 'python backend/app.py' work
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
for p in [CURRENT_DIR, ROOT_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

from flask import Flask, request, jsonify
from flask_cors import CORS

try:
    from backend.config import Config
    from backend.ml.predict import DifficultyPredictor
    from backend.rag.document_processor import DocumentProcessor
    from backend.rag.retriever import VectorRetriever
except ImportError:
    from config import Config
    from ml.predict import DifficultyPredictor
    from rag.document_processor import DocumentProcessor
    from rag.retriever import VectorRetriever

app = Flask(__name__)
app.config.from_object(Config)
CORS(app)

predictor = DifficultyPredictor()
retriever = VectorRetriever()

# All 22 official topics for Science 2 from the dataset
SCIENCE2_TOPICS = [
    "heredity and evolution",
    "human evolution",
    "theories of evolution",
    "evidences of evolution",
    "protein synthesis",
    "heredity",
    "dna, genes and chromosomes",
    "mutation",
    "types of disasters",
    "disaster management",
    "disaster management cycle and mitigation",
    "first aid",
    "disaster signs and symbols",
    "human reproductive system",
    "reproductive health and hormones",
    "biodiversity and its conservation",
    "solar energy",
    "addiction and substance abuse",
    "interpersonal relationships and social health",
    "social media and technology",
    "stress management",
    "superstitions and social evils"
]

@app.route("/api/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "platform": "EduAI Academic API",
        "subject": "Science 2",
        "topicsCount": len(SCIENCE2_TOPICS),
        "version": "2.0.0"
    })

@app.route("/api/topics", methods=["GET"])
def get_topics():
    return jsonify({
        "subject": "Science 2",
        "topics": SCIENCE2_TOPICS
    })

@app.route("/api/predict-difficulty", methods=["POST"])
def predict_difficulty():
    data = request.get_json() or {}
    text = data.get("questionText", "")
    if not text:
        return jsonify({"error": "questionText is required"}), 400
    res = predictor.predict(text)
    return jsonify(res)

@app.route("/api/classify-bloom", methods=["POST"])
def classify_bloom():
    data = request.get_json() or {}
    text = data.get("questionText", "")
    if not text:
        return jsonify({"error": "questionText is required"}), 400
    
    lower = text.lower()
    if any(w in lower for w in ['design', 'propose', 'formulate', 'construct', 'synthesize', 'draw a diagram']):
        level = 'Create'
        reason = 'Requires assembling morphological or biological components into a diagram or solution.'
    elif any(w in lower for w in ['evaluate', 'critique', 'justify', 'assess', 'justify in your own words']):
        level = 'Evaluate'
        reason = 'Demands justifying biological observations or disaster scenarios with reasoned arguments.'
    elif any(w in lower for w in ['analyze', 'distinguish', 'compare', 'contrast', 'odd one out', 'complete the diagram']):
        level = 'Analyze'
        reason = 'Requires breaking anatomical or evolutionary evidence into comparative parts.'
    elif any(w in lower for w in ['apply', 'calculate', 'solve', 'illustrate', 'write short notes']):
        level = 'Apply'
        reason = 'Applies evolutionary principles or disaster mitigation steps to concrete scenarios.'
    elif any(w in lower for w in ['explain', 'summarize', 'describe', 'why']):
        level = 'Understand'
        reason = 'Tests conceptual understanding of biological mechanisms and environmental concepts.'
    else:
        level = 'Remember'
        reason = 'Direct factual recall of scientific terms, vestigial organs, definitions, or scientists.'

    return jsonify({
        "bloomLevel": level,
        "reason": reason,
        "confidence": 0.88,
        "keywords": [level.lower()]
    })

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
