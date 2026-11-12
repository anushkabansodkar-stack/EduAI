"""
PDF Extraction and Document Chunking Module
EduAI - Academic Intelligence Platform
"""

import fitz  # PyMuPDF
import re

class DocumentProcessor:
    @staticmethod
    def extract_text_from_pdf(file_path: str) -> dict:
        """Extracts text, page numbers, and structural metadata using PyMuPDF."""
        doc = fitz.open(file_path)
        pages_text = []
        total_text = []

        for page_num in range(len(doc)):
            page = doc[page_num]
            text = page.get_text("text")
            pages_text.append({"page": page_num + 1, "text": text.strip()})
            total_text.append(text)

        full_content = "\n".join(total_text)
        return {
            "page_count": len(doc),
            "pages": pages_text,
            "full_text": full_content
        }

    @staticmethod
    def chunk_document(pages_data: list, chunk_size=300, overlap=50) -> list:
        """Splits extracted page content into smaller semantic chunks."""
        chunks = []
        for p in pages_data:
            page_no = p["page"]
            text = p["text"]
            words = text.split()
            if not words:
                continue

            for i in range(0, len(words), chunk_size - overlap):
                chunk_words = words[i:i + chunk_size]
                chunk_str = " ".join(chunk_words)
                if len(chunk_str) > 30:
                    chunks.append({
                        "page_number": page_no,
                        "text": chunk_str,
                        "token_count": len(chunk_words)
                    })
        return chunks
