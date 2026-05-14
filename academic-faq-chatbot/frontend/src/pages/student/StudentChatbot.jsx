import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, User, Trash2, Sparkles } from 'lucide-react';

const SUGGESTIONS = [
  "When is the DBMS exam?",
  "What assignments are pending?",
  "What is my attendance?",
  "What is my fee status?",
  "What is my class rank?",
  "Show me upcoming events",
  "What announcements are there?",
];

function formatMessage(text) {
  // Convert markdown-like bold to HTML
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
}

export default function StudentChatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: 'assistant',
      content: "👋 Hi! I'm **AcadBot**, your AI Academic Assistant.\n\nI can help you with:\n• 📅 Exam schedules\n• 📝 Assignment deadlines\n• 📊 Your marks, attendance & CGPA\n• 💳 Fee status\n• 📢 Announcements\n• 🎉 Upcoming events\n\nWhat would you like to know?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef();
  const inputRef = useRef();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const send = async (text) => {
    const msg = (text || input).trim();
    if (!msg || loading) return;
    setInput('');

    const userMsg = {
      id: Date.now(),
      role: 'user',
      content: msg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const history = messages.slice(-10).map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }));
      const res = await axios.post('/chatbot/chat', { message: msg, history });

      const botMsg = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (err) {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        role: 'assistant',
        content: "Sorry, I'm having trouble connecting right now. Please try again in a moment.",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        error: true
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: Date.now(),
      role: 'assistant',
      content: "Chat cleared! How can I help you?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }]);
  };

  return (
    <div className="flex flex-col h-full max-h-[calc(100vh-64px)] md:max-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="font-display font-bold text-slate-900 dark:text-white">AcadBot AI</h1>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-slate-500">Online • AI-powered</span>
            </div>
          </div>
        </div>
        <button onClick={clearChat} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 transition-colors" title="Clear chat">
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4 bg-slate-50 dark:bg-slate-950">
        {messages.map(msg => (
          <div key={msg.id} className={`flex items-end gap-2 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}>
            {/* Avatar */}
            {msg.role === 'assistant' && (
              <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center flex-shrink-0 mb-1">
                <Bot className="w-3.5 h-3.5 text-white" />
              </div>
            )}
            {msg.role === 'user' && (
              <div className="w-7 h-7 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center flex-shrink-0 mb-1">
                <User className="w-3.5 h-3.5 text-slate-500" />
              </div>
            )}

            <div className={`flex flex-col gap-1 max-w-[75%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={msg.role === 'user' ? 'chat-bubble-user' : `chat-bubble ${msg.error ? 'border-red-200 bg-red-50 dark:bg-red-950/30' : ''}`}>
                <p
                  className="leading-relaxed text-sm"
                  dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                />
              </div>
              <span className="text-xs text-slate-400 px-1">{msg.time}</span>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex items-end gap-2 animate-fade-in">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center flex-shrink-0">
              <Bot className="w-3.5 h-3.5 text-white" />
            </div>
            <div className="chat-bubble flex items-center gap-1 py-4 px-5">
              <div className="typing-dot" />
              <div className="typing-dot" />
              <div className="typing-dot" />
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
          <p className="text-xs text-slate-400 mb-2 flex items-center gap-1.5"><Sparkles className="w-3 h-3" /> Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => send(s)}
                className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-primary-50 dark:hover:bg-primary-950/30 hover:text-primary-600 text-slate-600 dark:text-slate-400 rounded-full transition-all duration-150"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="px-4 py-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex-shrink-0">
        <form
          onSubmit={e => { e.preventDefault(); send(); }}
          className="flex items-center gap-2"
        >
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about exams, assignments, your marks..."
            className="input flex-1"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={!input.trim() || loading}
            className="w-10 h-10 rounded-xl bg-primary-600 hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 flex-shrink-0 shadow-sm"
          >
            <Send className="w-4 h-4 text-white" />
          </button>
        </form>
      </div>
    </div>
  );
}
