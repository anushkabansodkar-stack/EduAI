# EduAI
AI-powered educational platform that analyzes question difficulty levels, identifies Bloom's Taxonomy levels, and helps teachers generate and evaluate exam questions.
# EduAI – AI-Powered Educational Analysis and Learning Platform (Science 2 Edition)

> **“Smarter Question Papers. Personalized Learning.”**

EduAI is a modern, responsive, full-stack educational assessment and personalized learning platform configured exclusively for **Science 2** (Secondary Board Curriculum: Heredity & Evolution, Life Processes, Disaster Management, Environmental Management, Green Energy, and Social Health).

---

## 1. How to Run in VS Code After Export

When you open this project in **Visual Studio Code**, follow these steps:

### Option A: Run the Full-Stack Node/TypeScript App (Recommended)
This runs both the React Vite frontend and the Express backend API on **port 3000** in one command:

1. **Open Terminal in VS Code**:
   Press `` Ctrl + ` `` (Windows/Linux) or `` Cmd + ` `` (Mac).
2. **Install Node.js dependencies**:
   ```bash
   npm install
   ```
3. **Start the development server**:
   ```bash
   npm run dev
   ```
   *(Or alternatively: `npm start`)*
4. **Open in Browser**:
   Navigate to `http://localhost:3000`.

### Option B: Run with the Python ML / Flask Backend (Optional)
If you want to train the scikit-learn models on the dataset or run the standalone Python Flask API:

1. **Create and activate a Python virtual environment**:
   ```bash
   # On macOS/Linux:
   python3 -m venv venv
   source venv/bin/activate

   # On Windows (Command Prompt / PowerShell):
   python -m venv venv
   venv\Scripts\activate
   ```
2. **Install Python packages**:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. **Train the ML models on the Science 2 CSV dataset**:
   ```bash
   python backend/ml/train_model.py
   ```
   *(Trains both Random Forest and SVM classifiers directly on `public/assets/aistudio/question_difficulty_marks_datas_a3837953.csv` and outputs model evaluation metrics)*
4. **Start the Flask server**:
   ```bash
   python backend/app.py
   ```
   The Flask API runs at `http://localhost:5000`.

---

## 2. Summary of 2 Fixed Runtime Errors

1. **Error 1: Start Script Crash (`Cannot find module .../server.js`)**
   - **Cause**: In `package.json`, `"start": "node server.js"` was attempting to run `server.js`, but the backend server is written in TypeScript (`server.ts`).
   - **Resolution**: Updated `package.json` to `"start": "tsx server.ts"`, which executes the TypeScript server with full ESM/TypeScript support matching `"dev": "tsx server.ts"`.

2. **Error 2: Python `ModuleNotFoundError: No module named 'backend'`**
   - **Cause**: When running `python backend/ml/train_model.py` or `python backend/app.py` from different working directories in VS Code, Python could not resolve internal module imports like `from backend.ml.predict import ...`.
   - **Resolution**: Added dynamic `sys.path` bootstrapping (`CURRENT_DIR`, `BACKEND_DIR`, `ROOT_DIR`) and relative fallback imports in `backend/ml/train_model.py`, `backend/ml/predict.py`, and `backend/app.py`. Scripts can now be executed cleanly from either the workspace root or the `backend/` folder without import failures.

---

## 3. Dedicated Subject: Science 2 Curriculum & Topics

All analysis, paper generation, ML difficulty scoring, RAG chatbot, and practice quizzes are scoped exclusively to **Science 2**.

### 6 Core Chapters & 22 Topics (From CSV Dataset)
- **Chapter 1: Heredity and Evolution**
  - `heredity`
  - `dna, genes and chromosomes`
  - `protein synthesis`
  - `mutation`
  - `theories of evolution`
  - `evidences of evolution`
  - `human evolution`
  - `heredity and evolution`
- **Chapter 3: Life Processes in Living Organisms Part – 2**
  - `human reproductive system`
  - `reproductive health and hormones`
- **Chapter 4: Environmental Management**
  - `biodiversity and its conservation`
- **Chapter 5: Towards Green Energy**
  - `solar energy`
- **Chapter 9: Social Health**
  - `addiction and substance abuse`
  - `social media and technology`
  - `stress management`
  - `interpersonal relationships and social health`
  - `superstitions and social evils`
- **Chapter 10: Disaster Management**
  - `types of disasters`
  - `disaster management`
  - `disaster management cycle and mitigation`
  - `first aid`
  - `disaster signs and symbols`

---

## 4. Features & Modules

1. **AI Question Paper Analyzer**:
   - Analyzes Science 2 question papers for cognitive balance (Bloom's Taxonomy), ML-predicted difficulty, marks breakdown, and syllabus unit coverage.
   - Built-in detection for all 22 Science 2 topics.
2. **Machine Learning Difficulty Classifier**:
   - Random Forest & SVM models trained on labeled questions with marks (1, 2, 3, 4, 5).
   - Combines TF-IDF n-grams with biological and linguistic cognitive features (word count, question keywords, complex structures).
3. **AI Question Paper Generator**:
   - Generates structured Science 2 question papers adhering to Board marks distribution (e.g. 20, 40, or 80 marks).
   - Customizable section breakdown (MCQs, Short Answer, Long Answer, Diagrams, Case Studies) with full answer keys and model answers.
4. **Adaptive Practice Quizzes**:
   - Topic-specific quizzes covering all 22 Science 2 topics.
   - Instant scoring, explanations, and weak-area diagnostics.
5. **Academic RAG Chatbot**:
   - Conversational AI tutor grounded directly in indexed Science 2 textbook documents, syllabus files, and previous question papers with page citations.
6. **Syllabus Coverage Audit**:
   - Real-time audit tool comparing question distributions against Science 2 board chapters to pinpoint neglected or over-indexed topics.

---

## 5. Sample API Endpoints & Payloads

### Predict Question Difficulty
- **POST** `/api/predict-difficulty`
```json
{
  "questionText": "Explain the process of protein synthesis with reference to transcription, translation, and translocation."
}
```
**Response:**
```json
{
  "difficulty": "Hard",
  "confidence": 0.91,
  "features": {
    "wordCount": 16,
    "cognitiveScore": 4.8,
    "hasComplexFormula": false,
    "punctuationDensity": 0.04
  }
}
```

### Classify Bloom's Taxonomy
- **POST** `/api/classify-bloom`
```json
{
  "questionText": "Define vestigial organs and write any two examples found in the human body."
}
```
**Response:**
```json
{
  "bloomLevel": "Remember",
  "reason": "Involves retrieving, recalling, or recognizing relevant factual knowledge. Identified cue: define.",
  "confidence": 0.94
}
```

---

## 6. Environment Variables

Create a `.env` file based on `.env.example`:
```env
GEMINI_API_KEY="your-gemini-api-key"
PORT=3000
```
- If `GEMINI_API_KEY` is not provided, the application runs on its built-in rule engine and local ML classifiers seamlessly.
