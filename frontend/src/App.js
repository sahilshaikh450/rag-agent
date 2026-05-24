import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import Sidebar from './components/Sidebar';
import ChatPanel from './components/ChatPanel';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const AppShell = styled.div`
  display: flex;
  height: 100vh;
  position: relative;
  z-index: 1;
`;

const Orb = styled.div`
  position: fixed;
  border-radius: 50%;
  filter: blur(120px);
  pointer-events: none;
  z-index: 0;
  
  &.orb1 {
    width: 600px; height: 600px;
    background: radial-gradient(circle, rgba(124,111,255,0.1) 0%, transparent 70%);
    top: -200px; left: -200px;
    animation: floatOrb1 20s ease-in-out infinite;
  }
  &.orb2 {
    width: 500px; height: 500px;
    background: radial-gradient(circle, rgba(0,229,255,0.06) 0%, transparent 70%);
    bottom: -100px; right: -100px;
    animation: floatOrb2 25s ease-in-out infinite;
  }

  @keyframes floatOrb1 {
    0%, 100% { transform: translate(0, 0); }
    33% { transform: translate(60px, 40px); }
    66% { transform: translate(-40px, 60px); }
  }
  @keyframes floatOrb2 {
    0%, 100% { transform: translate(0, 0); }
    33% { transform: translate(-50px, -30px); }
    66% { transform: translate(30px, -60px); }
  }
`;

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "**Welcome to RAG Agent** 👋\n\nI'm your AI-powered support assistant. Upload your documents (PDF, TXT, or MD files) and I'll answer questions based on their content — accurately, with zero hallucination.\n\nGet started by uploading a document on the left.",
      timestamp: new Date(),
    }
  ]);

  const fetchDocuments = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/documents`);
      setDocuments(res.data.documents);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    }
  };

  useEffect(() => { fetchDocuments(); }, []);

  const handleUpload = async (files) => {
    setUploading(true);
    const formData = new FormData();
    Array.from(files).forEach(f => formData.append('files', f));

    try {
      const res = await axios.post(`${API_URL}/api/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      await fetchDocuments();
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `✅ **${res.data.documents.length} document(s) uploaded successfully!**\n\n${res.data.documents.map(d => `- **${d.name}** — ${d.chunks} chunks indexed`).join('\n')}\n\nYou can now ask me anything about these documents.`,
        timestamp: new Date(),
      }]);
    } catch (err) {
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: `❌ **Upload failed:** ${err.response?.data?.error || err.message}`,
        timestamp: new Date(),
      }]);
    } finally {
      setUploading(false);
    }
  };

  const handleClear = async () => {
    await axios.delete(`${API_URL}/api/documents`);
    setDocuments([]);
    setMessages([{
      role: 'assistant',
      content: "🗑️ All documents cleared. Upload new documents to get started.",
      timestamp: new Date(),
    }]);
  };

  return (
    <AppShell>
      <Orb className="orb1" />
      <Orb className="orb2" />
      <Sidebar
        documents={documents}
        onUpload={handleUpload}
        onClear={handleClear}
        uploading={uploading}
      />
      <ChatPanel
        messages={messages}
        setMessages={setMessages}
        hasDocuments={documents.length > 0}
        apiUrl={API_URL}
      />
    </AppShell>
  );
}