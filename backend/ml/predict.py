"""
Inference Module for Question Difficulty Prediction
EduAI - Academic Intelligence Platform
Subject: Science 2
"""

import os
import sys
import pickle
import pandas as pd

# Path bootstrapping
CURRENT_DIR = os.path.dirname(os.path.abspath(__file__))
BACKEND_DIR = os.path.abspath(os.path.join(CURRENT_DIR, ".."))
ROOT_DIR = os.path.abspath(os.path.join(CURRENT_DIR, "../.."))
for p in [CURRENT_DIR, BACKEND_DIR, ROOT_DIR]:
    if p not in sys.path:
        sys.path.insert(0, p)

try:
    from backend.ml.train_model import extract_linguistic_features
except ImportError:
    from train_model import extract_linguistic_features

class DifficultyPredictor:
    def __init__(self, model_dir=None):
        if not model_dir:
            model_dir = os.path.join(CURRENT_DIR, "saved_models")
        self.model_dir = model_dir
        self.rf_model = None
        self.vectorizer = None
        self.load_artifacts()

    def load_artifacts(self):
        rf_path = os.path.join(self.model_dir, "rf_model.pkl")
        vec_path = os.path.join(self.model_dir, "vectorizer.pkl")
        if os.path.exists(rf_path) and os.path.exists(vec_path):
            with open(rf_path, "rb") as f:
                self.rf_model = pickle.load(f)
            with open(vec_path, "rb") as f:
                self.vectorizer = pickle.load(f)

    def predict(self, text: str):
        feats = extract_linguistic_features(text)
        if self.rf_model and self.vectorizer:
            ling_df = pd.DataFrame([feats])
            tfidf_mat = self.vectorizer.transform([text]).toarray()
            tfidf_df = pd.DataFrame(tfidf_mat, columns=[f"tfidf_{w}" for w in self.vectorizer.get_feature_names_out()])
            X = pd.concat([ling_df, tfidf_df], axis=1)
            pred = self.rf_model.predict(X)[0]
            probs = self.rf_model.predict_proba(X)[0]
            confidence = float(max(probs))
            return {
                "difficulty": pred,
                "confidence": round(confidence, 2),
                "features": feats
            }
        
        # Science 2 cognitive linguistic heuristics
        lower = text.lower()
        if feats["hard_verb_count"] > 0 or feats["word_count"] > 35 or 'draw a diagram' in lower or 'describe' in lower:
            diff = "Hard"
            conf = 0.88
        elif feats["easy_verb_count"] > 0 or feats["word_count"] < 15 or 'fill in the blank' in lower or 'find the odd' in lower:
            diff = "Easy"
            conf = 0.85
        else:
            diff = "Medium"
            conf = 0.82

        return {
            "difficulty": diff,
            "confidence": conf,
            "features": feats
        }
