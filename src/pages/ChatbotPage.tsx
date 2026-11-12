import React, { useState, useEffect, useRef } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  BotMessageSquare, 
  Send, 
  FileText, 
  Sparkles, 
  BookOpen, 
  ExternalLink, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  HelpCircle,
  Lightbulb,
  Search
} from 'lucide-react';
import { sendChatMessage, fetchDocuments } from '../services/api';
import { ChatMessage, DocumentItem } from '../types';

export const ChatbotPage: React.FC = () => {
  const location = useLocation();
  const initialPrompt = (location.state as any)?.prompt;
  const preselectedDocId = (location.state as any)?.selectedDocId;

  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocId, setSelectedDocId] = useState<string>(preselectedDocId || '');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg_initial',
      sender: 'assistant',
      text: 'Hello! I am your **EduAI Science 2 Academic Tutor**. Ask me any conceptual question about Heredity & Evolution, Protein Synthesis, Disaster Management, Human Reproduction, or Green Energy. I ground every response strictly in your uploaded Science 2 textbook and notes with exact page references.',
      timestamp: new Date().toISOString(),
      suggestedFollowUps: [
        'Explain the process of protein synthesis via transcription, translation and translocation.',
        'What are vestigial organs and connecting links with examples like Peripatus?',
        'What are the primary precautions to take during an earthquake or fire?',
      ],
      isGrounded: true,
    },
  ]);
  const [inputText, setInputText] = useState(initialPrompt || '');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments().then(docs => {
      setDocuments(docs);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (queryToSend?: string) => {
    const query = queryToSend || inputText;
    if (!query.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: `msg_user_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');
    setLoading(true);

    try {
      const res = await sendChatMessage(query, selectedDocId || undefined);
      setMessages(prev => [...prev, res]);
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          id: `msg_err_${Date.now()}`,
          sender: 'assistant',
          text: `An error occurred while querying course documents: ${err.message}. Please verify the document is indexed.`,
          timestamp: new Date().toISOString(),
          isGrounded: false,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col space-y-4">
      {/* Top Bar: Active Reference Document Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
            <BotMessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-base font-bold text-slate-900 leading-tight">
              AI Academic Tutor (RAG Grounded)
            </h1>
            <p className="text-[11px] text-slate-500">
              Retrieval-Augmented Generation strictly bounded by your uploaded lecture notes and textbooks.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 shrink-0">
            Grounding Scope:
          </label>
          <select
            value={selectedDocId}
            onChange={e => setSelectedDocId(e.target.value)}
            className="text-xs py-1.5 px-3 rounded-xl border border-slate-300 bg-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="">All Uploaded Course Documents</option>
            {documents.map(d => (
              <option key={d.id} value={d.id}>
                {d.name} ({d.pageCount} pgs)
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 bg-white rounded-2xl border border-slate-200 shadow-xs p-6 overflow-y-auto space-y-6">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed space-y-2.5 ${
                msg.sender === 'user'
                  ? 'bg-blue-600 text-white rounded-tr-xs'
                  : 'bg-slate-50 border border-slate-200/90 text-slate-800 rounded-tl-xs'
              }`}
            >
              <div className="whitespace-pre-wrap">{msg.text}</div>

              {/* Citations block */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="pt-2 border-t border-slate-200/80 space-y-1.5">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block">
                    Verified Course Sources & Page Numbers:
                  </span>
                  <div className="space-y-1">
                    {msg.citations.map((c, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-white border border-slate-200 text-[11px] space-y-1"
                      >
                        <div className="flex items-center justify-between font-semibold text-slate-900">
                          <span className="truncate max-w-xs">{c.documentName}</span>
                          <span className="font-mono text-indigo-600">Page {c.pageNumber}</span>
                        </div>
                        <p className="text-slate-600 text-[10px] italic line-clamp-2">
                          "{c.snippet}"
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Suggested follow-up buttons if provided */}
            {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2 max-w-2xl">
                {msg.suggestedFollowUps.map((prompt, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(prompt)}
                    className="text-[11px] px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors text-left flex items-center gap-1.5"
                  >
                    <Lightbulb className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{prompt}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-xs text-slate-500 p-4 bg-slate-50 rounded-2xl border border-slate-200 max-w-sm">
            <Sparkles className="w-4 h-4 text-indigo-600 animate-spin" />
            <span>Retrieving vector embeddings & generating answer...</span>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center gap-2">
        <input
          type="text"
          value={inputText}
          onChange={e => setInputText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question about algorithms, physics, or exam topics..."
          className="flex-1 text-xs px-4 py-2.5 rounded-xl border-none focus:outline-none focus:ring-0 text-slate-800 placeholder-slate-400"
        />
        <button
          onClick={() => handleSend()}
          disabled={loading || !inputText.trim()}
          className="p-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-xs disabled:opacity-50 transition-all flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
