import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';

const typing = keyframes`
  0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
  30% { transform: translateY(-6px); opacity: 1; }
`;

const Panel = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 2;
  overflow: hidden;
`;

const Header = styled.header`
  padding: 18px 32px;
  border-bottom: 1px solid var(--border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: rgba(8,8,16,0.95);
  backdrop-filter: blur(20px);
  
  .left {
    h2 { 
      font-size: 22px; 
      font-weight: 800; 
      letter-spacing: -1px;
      background: linear-gradient(135deg, #fff 40%, var(--accent3));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
    }
    p { font-size: 11px; color: var(--text3); font-family: var(--font-mono); margin-top: 3px; letter-spacing: 0.5px; }
  }
  
  .badge {
    background: var(--surface2);
    border: 1px solid var(--border2);
    padding: 6px 16px;
    border-radius: 20px;
    font-size: 11px;
    font-family: var(--font-mono);
    color: var(--accent3);
    display: flex;
    align-items: center;
    gap: 8px;
    letter-spacing: 0.5px;
    
    &::before {
      content: '';
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--neon);
      animation: pulse 2s ease-in-out infinite;
    }
  }
`;

const Messages = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 32px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  
  &::-webkit-scrollbar { width: 4px; }
  &::-webkit-scrollbar-thumb { background: var(--border2); border-radius: 2px; }
`;

const MessageBubble = styled.div`
  display: flex;
  gap: 14px;
  align-items: flex-start;
  animation: fadeSlideUp 0.3s ease;
  max-width: 820px;
  
  &.user {
    flex-direction: row-reverse;
    margin-left: auto;
  }
`;

const Avatar = styled.div`
  width: 36px; height: 36px;
  border-radius: 10px;
  display: flex; align-items: center; justify-content: center;
  font-size: 16px;
  flex-shrink: 0;
  
  &.assistant {
    background: linear-gradient(135deg, var(--accent), var(--neon2));
    box-shadow: 0 0 15px rgba(99,102,241,0.4);
  }
  &.user {
    background: var(--surface2);
    border: 1px solid var(--border2);
  }
`;

const Bubble = styled.div`
  padding: 14px 18px;
  border-radius: 16px;
  font-size: 14px;
  line-height: 1.7;
  max-width: 680px;
  
  &.assistant {
    background: var(--surface);
    border: 1px solid var(--border);
    border-top-left-radius: 4px;
    color: var(--text);
    
    strong { color: var(--accent3); }
    code {
      background: rgba(99,102,241,0.15);
      color: var(--neon);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: var(--font-mono);
      font-size: 12px;
    }
    pre {
      background: var(--bg);
      border: 1px solid var(--border);
      border-radius: 8px;
      padding: 14px;
      overflow-x: auto;
      margin: 10px 0;
      
      code {
        background: none;
        padding: 0;
        color: var(--text2);
      }
    }
    p { margin-bottom: 8px; }
    p:last-child { margin-bottom: 0; }
    ul, ol { margin: 8px 0 8px 20px; }
    li { margin-bottom: 4px; }
  }
  
  &.user {
    background: linear-gradient(135deg, var(--accent), #4f46e5);
    border-top-right-radius: 4px;
    color: white;
    font-weight: 500;
  }
`;

const Sources = styled.div`
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid var(--border);
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  
  .label {
    font-size: 10px;
    color: var(--text3);
    font-family: var(--font-mono);
    width: 100%;
    margin-bottom: 4px;
  }
`;

const SourceTag = styled.span`
  background: rgba(34,211,238,0.1);
  border: 1px solid rgba(34,211,238,0.25);
  color: var(--neon);
  font-size: 11px;
  font-family: var(--font-mono);
  padding: 3px 10px;
  border-radius: 20px;
`;

const Timestamp = styled.div`
  font-size: 10px;
  color: var(--text3);
  font-family: var(--font-mono);
  margin-top: 6px;
  padding: 0 4px;
`;

const TypingIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 14px;
  animation: fadeSlideUp 0.2s ease;
  
  .dots {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    border-top-left-radius: 4px;
    padding: 14px 20px;
    display: flex;
    gap: 5px;
    align-items: center;
    
    span {
      width: 7px; height: 7px;
      border-radius: 50%;
      background: var(--accent);
      animation: ${typing} 1.2s ease-in-out infinite;
      
      &:nth-child(2) { animation-delay: 0.2s; background: var(--accent2); }
      &:nth-child(3) { animation-delay: 0.4s; background: var(--neon); }
    }
  }
`;

const InputArea = styled.div`
  padding: 20px 32px 28px;
  border-top: 1px solid var(--border);
  background: rgba(10,10,15,0.9);
  backdrop-filter: blur(20px);
`;

const InputRow = styled.div`
  display: flex;
  gap: 12px;
  align-items: flex-end;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 16px;
  padding: 12px 16px;
  transition: border-color 0.2s;
  
  &:focus-within {
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(99,102,241,0.1);
  }
`;

const TextArea = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  outline: none;
  color: var(--text);
  font-family: var(--font-display);
  font-size: 14px;
  resize: none;
  max-height: 120px;
  min-height: 24px;
  line-height: 1.6;
  
  &::placeholder { color: var(--text3); }
`;

const SendBtn = styled.button`
  width: 40px; height: 40px;
  border-radius: 10px;
  background: ${p => p.$active
    ? 'linear-gradient(135deg, var(--accent), var(--neon2))'
    : 'var(--surface2)'};
  border: 1px solid ${p => p.$active ? 'transparent' : 'var(--border2)'};
  color: white;
  cursor: ${p => p.$active ? 'pointer' : 'default'};
  display: flex; align-items: center; justify-content: center;
  font-size: 18px;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover { transform: ${p => p.$active ? 'scale(1.05)' : 'none'}; }
  &:active { transform: scale(0.95); }
`;

const Hint = styled.div`
  text-align: center;
  margin-top: 10px;
  font-size: 11px;
  color: var(--text3);
  font-family: var(--font-mono);
`;

const NoDocsHint = styled.div`
  background: rgba(245,158,11,0.08);
  border: 1px solid rgba(245,158,11,0.2);
  border-radius: 12px;
  padding: 12px 16px;
  font-size: 12px;
  color: var(--warning);
  font-family: var(--font-mono);
  text-align: center;
  margin-bottom: 12px;
`;

const formatTime = (date) =>
  new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

export default function ChatPanel({ messages, setMessages, hasDocuments }) {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async () => {
    const q = input.trim();
    if (!q || loading) return;

    const userMsg = { role: 'user', content: q, timestamp: new Date() };
    const history = messages.filter(m => m.role !== 'system').map(m => ({
      role: m.role, content: m.content
    }));

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await axios.post('/api/chat', { question: q, history });
      const { answer, sources } = res.data;
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: answer,
        sources,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **Error:** ${err.response?.data?.error || err.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-resize textarea
  const handleInput = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <Panel>
      <Header>
        <div className="left">
          <h2>AI Support Chat</h2>
          <p>Retrieval-Augmented Generation · Zero Hallucination</p>
        </div>
        <div className="badge">Groq LLaMA 3</div>
      </Header>

      <Messages>
        {messages.map((msg, i) => (
          <MessageBubble key={i} className={msg.role}>
            <Avatar className={msg.role}>
              {msg.role === 'assistant' ? '🤖' : '👤'}
            </Avatar>
            <div>
              <Bubble className={msg.role}>
                <ReactMarkdown>{msg.content}</ReactMarkdown>
                {msg.sources && msg.sources.length > 0 && (
                  <Sources>
                    <span className="label">📎 Sources</span>
                    {msg.sources.map((s, j) => <SourceTag key={j}>{s}</SourceTag>)}
                  </Sources>
                )}
              </Bubble>
              <Timestamp>{formatTime(msg.timestamp)}</Timestamp>
            </div>
          </MessageBubble>
        ))}

        {loading && (
          <TypingIndicator>
            <Avatar className="assistant">🤖</Avatar>
            <div className="dots">
              <span /><span /><span />
            </div>
          </TypingIndicator>
        )}
        <div ref={messagesEndRef} />
      </Messages>

      <InputArea>
        {!hasDocuments && (
          <NoDocsHint>
            ⚠️ No documents uploaded — answers won't use document context
          </NoDocsHint>
        )}
        <InputRow>
          <TextArea
            ref={textareaRef}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKey}
            placeholder="Ask anything about your documents..."
            rows={1}
          />
          <SendBtn $active={!!input.trim() && !loading} onClick={handleSend}>
            {loading ? '⏳' : '↑'}
          </SendBtn>
        </InputRow>
        <Hint>Enter to send · Shift+Enter for new line</Hint>
      </InputArea>
    </Panel>
  );
}
