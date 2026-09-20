'use client';
import { useState, useRef, useEffect } from 'react';
import { Message, SUGGESTED_QUESTIONS } from '@/types/chat';
import { Send, Bot, User, RefreshCw } from 'lucide-react';

interface ChatInterfaceProps {
  documentText: string;
  documentTitle: string;
}

export default function ChatInterface({ documentText, documentTitle }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `I've read **${documentTitle}**. Ask me anything about this document — obligations, risks, clauses, termination conditions, or anything else you'd like to understand.`,
      timestamp: 0,
    },
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (question: string) => {
    if (!question.trim() || isStreaming) return;

    const now = new Date().getTime();
    const userMsg: Message = {
      id: `user-${now}`,
      role: 'user',
      content: question,
      timestamp: now,
    };
    const assistantId = `assistant-${now + 1}`;
    const assistantMsg: Message = {
      id: assistantId,
      role: 'assistant',
      content: '',
      timestamp: now + 1,
      isStreaming: true,
    };

    setMessages((prev) => [...prev, userMsg, assistantMsg]);
    setInput('');
    setIsStreaming(true);

    const history = messages
      .filter((m) => m.role !== 'system')
      .map((m) => ({ role: m.role, content: m.content }));

    try {
      const res = await fetch('/api/qa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, documentText, history }),
      });

      if (!res.ok) throw new Error('Request failed');
      if (!res.body) throw new Error('No response body');

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let currentText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = decoder.decode(value);
        const lines = text.split('\n').filter((l) => l.startsWith('data: '));

        for (const line of lines) {
          const data = line.slice(6);
          if (data === '[DONE]') break;
          try {
            const parsed = JSON.parse(data);
            if (parsed.chunk) {
              currentText += parsed.chunk;
              const nextContent = currentText;
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantId ? { ...m, content: nextContent } : m
                )
              );
            }
            if (parsed.error) throw new Error(parsed.error);
          } catch {
            // Skip malformed chunks
          }
        }
      }
    } catch (err) {
      console.error('[ChatInterface] QA Error:', err);
      setMessages((prev) =>
        prev.map((m) =>
          m.id === assistantId
            ? { ...m, content: 'Sorry, I encountered an error. Please try again.', isStreaming: false }
            : m
        )
      );
    } finally {
      setMessages((prev) =>
        prev.map((m) => (m.id === assistantId ? { ...m, isStreaming: false } : m))
      );
      setIsStreaming(false);
      inputRef.current?.focus();
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('lexai-api-used'));
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: 'welcome-reset',
        role: 'assistant',
        content: `Chat cleared. Still ready to answer questions about **${documentTitle}**.`,
        timestamp: Date.now(),
      },
    ]);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '600px', background: 'var(--bg-surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-xl)', overflow: 'hidden' }}>
      {/* Header */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--accent-dim)', borderRadius: 'var(--radius-md)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent)' }}>
            <Bot size={16} />
          </div>
          <div>
            <p style={{ fontWeight: 600, fontSize: '0.9rem', margin: 0 }}>Document Assistant</p>
            <p style={{ fontSize: '0.72rem', color: 'var(--text-muted)', margin: 0 }}>Grounded in: {documentTitle}</p>
          </div>
        </div>
        <button onClick={clearChat} className="btn btn-ghost btn-sm" aria-label="Clear chat history">
          <RefreshCw size={14} /> Clear
        </button>
      </div>

      {/* Messages */}
      <div
        role="log"
        aria-live="polite"
        aria-label="Chat messages"
        style={{ flex: 1, overflowY: 'auto', padding: 'var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}
      >
        {messages.map((msg) => (
          <div key={msg.id} style={{ display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row' }}>
            <div style={{ width: '28px', height: '28px', borderRadius: 'var(--radius-full)', background: msg.role === 'user' ? 'var(--accent-dim)' : 'var(--bg-surface-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: msg.role === 'user' ? 'var(--accent)' : 'var(--text-muted)' }}>
              {msg.role === 'user' ? <User size={14} /> : <Bot size={14} />}
            </div>
            <div
              className={`chat-bubble chat-bubble--${msg.role}${msg.isStreaming ? ' typewriter' : ''}`}
              aria-label={`${msg.role === 'user' ? 'You' : 'Assistant'}: ${msg.content}`}
            >
              {msg.content || (msg.isStreaming && <span style={{ color: 'var(--text-muted)' }}>Thinking…</span>)}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggested questions */}
      {messages.length <= 2 && (
        <div style={{ padding: '0 var(--space-5)', overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: 'var(--space-2)', paddingBottom: 'var(--space-3)' }}>
            {SUGGESTED_QUESTIONS.slice(0, 4).map((q) => (
              <button key={q} className="question-chip" onClick={() => sendMessage(q)} aria-label={`Ask: ${q}`}>
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--border)', display: 'flex', gap: 'var(--space-3)', alignItems: 'flex-end' }}>
        <textarea
          ref={inputRef}
          id="chat-input"
          className="input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask anything about this document…"
          disabled={isStreaming}
          rows={1}
          style={{ resize: 'none', minHeight: 'auto', lineHeight: 1.5 }}
          aria-label="Chat message input"
          aria-describedby="chat-hint"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isStreaming}
          className="btn btn-primary"
          style={{ flexShrink: 0, padding: 'var(--space-3)' }}
          aria-label="Send message"
        >
          {isStreaming ? <div className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} /> : <Send size={16} />}
        </button>
      </div>
      <p id="chat-hint" style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textAlign: 'center', padding: '0 var(--space-5) var(--space-2)', margin: 0 }}>
        Press Enter to send · Shift+Enter for new line
      </p>
    </div>
  );
}
