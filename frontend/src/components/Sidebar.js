import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import styled, { keyframes } from 'styled-components';

const pulse = keyframes`
  0%, 100% { opacity: 0.6; }
  50% { opacity: 1; }
`;
const spin = keyframes`to { transform: rotate(360deg); }`;

const Side = styled.aside`
  width: 320px;
  min-width: 320px;
  background: var(--bg2);
  border-right: 1px solid var(--border);
  display: flex;
  flex-direction: column;
  padding: 28px 20px;
  gap: 24px;
  position: relative;
  z-index: 2;
  overflow-y: auto;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  
  .icon {
    width: 40px; height: 40px;
    background: linear-gradient(135deg, var(--accent), var(--neon));
    border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    font-size: 20px;
    box-shadow: 0 0 20px rgba(99,102,241,0.4);
  }
  
  .text {
    h1 { font-size: 18px; font-weight: 800; letter-spacing: -0.5px; }
    p { font-size: 11px; color: var(--text3); font-family: var(--font-mono); margin-top: 1px; }
  }
`;

const SectionLabel = styled.div`
  font-size: 10px;
  font-family: var(--font-mono);
  color: var(--text3);
  text-transform: uppercase;
  letter-spacing: 2px;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: var(--border);
  }
`;

const DropZone = styled.div`
  border: 1.5px dashed ${p => p.$active ? 'var(--accent)' : 'var(--border2)'};
  border-radius: 16px;
  padding: 32px 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${p => p.$active ? 'rgba(99,102,241,0.08)' : 'transparent'};
  
  &:hover {
    border-color: var(--accent);
    background: rgba(99,102,241,0.05);
  }
  
  .icon { font-size: 36px; margin-bottom: 12px; }
  
  h3 {
    font-size: 14px;
    font-weight: 700;
    margin-bottom: 6px;
    color: ${p => p.$active ? 'var(--accent3)' : 'var(--text)'};
  }
  
  p {
    font-size: 12px;
    color: var(--text3);
    font-family: var(--font-mono);
    line-height: 1.5;
  }
`;

const UploadingBar = styled.div`
  height: 3px;
  background: var(--border);
  border-radius: 2px;
  overflow: hidden;
  
  &::after {
    content: '';
    display: block;
    height: 100%;
    width: 40%;
    background: linear-gradient(90deg, var(--accent), var(--neon));
    border-radius: 2px;
    animation: slide 1s ease-in-out infinite;
  }
  
  @keyframes slide {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(350%); }
  }
`;

const DocList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DocItem = styled.div`
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  animation: fadeSlideUp 0.3s ease;
  
  .doc-icon {
    font-size: 20px;
    margin-top: 1px;
  }
  
  .doc-info {
    flex: 1;
    min-width: 0;
    
    .name {
      font-size: 13px;
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      color: var(--text);
    }
    .meta {
      font-size: 11px;
      color: var(--text3);
      font-family: var(--font-mono);
      margin-top: 3px;
    }
  }
  
  .badge {
    background: rgba(16,185,129,0.15);
    color: var(--success);
    font-size: 10px;
    font-family: var(--font-mono);
    padding: 2px 8px;
    border-radius: 20px;
    border: 1px solid rgba(16,185,129,0.3);
    white-space: nowrap;
    margin-top: 2px;
  }
`;

const EmptyDocs = styled.div`
  text-align: center;
  padding: 20px;
  color: var(--text3);
  font-size: 12px;
  font-family: var(--font-mono);
  
  .emoji { font-size: 24px; display: block; margin-bottom: 8px; }
`;

const ClearBtn = styled.button`
  width: 100%;
  padding: 10px;
  background: transparent;
  border: 1px solid rgba(239,68,68,0.3);
  color: rgba(239,68,68,0.7);
  border-radius: 8px;
  font-family: var(--font-mono);
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: rgba(239,68,68,0.08);
    border-color: rgba(239,68,68,0.6);
    color: var(--danger);
  }
`;

const StatusDot = styled.div`
  width: 8px; height: 8px;
  border-radius: 50%;
  background: var(--success);
  box-shadow: 0 0 8px var(--success);
  animation: ${pulse} 2s ease-in-out infinite;
  margin-top: 16px;
  margin-left: auto;
  margin-right: auto;
`;

const getDocIcon = (name) => {
  if (name.endsWith('.pdf')) return '📄';
  if (name.endsWith('.md')) return '📝';
  return '📃';
};

const formatSize = (bytes) => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export default function Sidebar({ documents, onUpload, onClear, uploading }) {
  const onDrop = useCallback(files => onUpload(files), [onUpload]);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'], 'text/plain': ['.txt'], 'text/markdown': ['.md'] },
    disabled: uploading,
  });

  return (
    <Side>
      <Logo>
        <div className="icon">🤖</div>
        <div className="text">
          <h1>RAG Agent</h1>
          <p>v1.0 · AI Support System</p>
        </div>
      </Logo>

      <div>
        <SectionLabel>Upload Documents</SectionLabel>
        <div style={{ marginTop: 12 }}>
          <DropZone {...getRootProps()} $active={isDragActive}>
            <input {...getInputProps()} />
            <div className="icon">{uploading ? '⚙️' : isDragActive ? '📥' : '📂'}</div>
            <h3>{isDragActive ? 'Drop to upload' : uploading ? 'Processing...' : 'Drag & drop files'}</h3>
            <p>PDF, TXT, MD supported<br />Max 10MB per file</p>
          </DropZone>
          {uploading && <UploadingBar style={{ marginTop: 8 }} />}
        </div>
      </div>

      <div>
        <SectionLabel>Knowledge Base ({documents.length})</SectionLabel>
        <div style={{ marginTop: 12 }}>
          {documents.length === 0 ? (
            <EmptyDocs>
              <span className="emoji">🗂️</span>
              No documents yet.<br />Upload files to get started.
            </EmptyDocs>
          ) : (
            <DocList>
              {documents.map((doc, i) => (
                <DocItem key={i}>
                  <span className="doc-icon">{getDocIcon(doc.name)}</span>
                  <div className="doc-info">
                    <div className="name">{doc.name}</div>
                    <div className="meta">{formatSize(doc.size)} · {doc.chunks} chunks</div>
                  </div>
                  <span className="badge">indexed</span>
                </DocItem>
              ))}
            </DocList>
          )}
        </div>
      </div>

      {documents.length > 0 && (
        <ClearBtn onClick={onClear}>🗑️ Clear All Documents</ClearBtn>
      )}

      <div style={{ marginTop: 'auto', textAlign: 'center' }}>
        <StatusDot />
        <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'var(--font-mono)', marginTop: 6 }}>
          SYSTEM ONLINE
        </div>
      </div>
    </Side>
  );
}
