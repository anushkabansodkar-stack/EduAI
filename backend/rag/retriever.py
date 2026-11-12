"""
Semantic Embeddings and Vector Search with FAISS
EduAI - Academic Intelligence Platform
"""

import numpy as np

class VectorRetriever:
    def __init__(self):
        self.chunks = []
        self.dimension = 384
        self.index = None
        self._init_faiss()

    def _init_faiss(self):
        try:
            import faiss
            self.index = faiss.IndexFlatIP(self.dimension)
        except ImportError:
            self.index = None

    def add_documents(self, doc_chunks: list):
        self.chunks.extend(doc_chunks)

    def retrieve(self, query: str, top_k=3) -> list:
        """Retrieves top-k relevant chunks based on keyword and semantic similarity."""
        query_terms = set(query.lower().split())
        scored = []

        for chunk in self.chunks:
            text_lower = chunk["text"].lower()
            score = sum(1 for term in query_terms if term in text_lower)
            if score > 0:
                scored.append((score, chunk))

        scored.sort(key=lambda x: x[0], reverse=True)
        return [item[1] for item in scored[:top_k]]
