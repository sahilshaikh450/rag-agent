import Groq from "groq-sdk";
import { FaissStore } from "@langchain/community/vectorstores/faiss";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { HuggingFaceInferenceEmbeddings } from "@langchain/community/embeddings/hf";
import fs from "fs";
import path from "path";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

class RAGService {
  constructor() {
    this.vectorStore = null;
    this.documents = [];
    this.embeddings = null;
    this.groq = null;
  }

  _init() {
    if (!this.groq) {
      this.groq = new Groq({
        apiKey: process.env.GROQ_API_KEY,
      });
    }
    if (!this.embeddings) {
      this.embeddings = new HuggingFaceInferenceEmbeddings({
        apiKey: process.env.HUGGINGFACE_API_KEY,
        model: "sentence-transformers/all-MiniLM-L6-v2",
      });
    }
  }

  async _extractText(file) {
    const ext = path.extname(file.originalname).toLowerCase();
    const buffer = fs.readFileSync(file.path);
    if (ext === ".pdf") {
      const data = await pdfParse(buffer);
      return data.text;
    } else {
      return buffer.toString("utf-8");
    }
  }

  async ingestDocument(file) {
    this._init();
    try {
      const text = await this._extractText(file);
      if (!text || text.trim().length === 0) {
        throw new Error("Could not extract text from file");
      }
      const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
      });
      const docs = await splitter.createDocuments([text], [
        { source: file.originalname, uploadedAt: new Date().toISOString() },
      ]);
      if (!this.vectorStore) {
        this.vectorStore = await FaissStore.fromDocuments(docs, this.embeddings);
      } else {
        await this.vectorStore.addDocuments(docs);
      }
      const docInfo = {
        name: file.originalname,
        size: file.size,
        chunks: docs.length,
        uploadedAt: new Date().toISOString(),
      };
      this.documents.push(docInfo);
      fs.unlinkSync(file.path);
      return docInfo;
    } catch (err) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      throw err;
    }
  }

  async query(question, history = []) {
    this._init();

    let context = "";
    let sources = [];

    if (this.vectorStore) {
      const retriever = this.vectorStore.asRetriever({ k: 4 });
      const docs = await retriever.getRelevantDocuments(question);
      context = docs.map(d => d.pageContent).join("\n\n");
      sources = [...new Set(docs.map(d => d.metadata?.source).filter(Boolean))];
    }

    const systemMsg = context
      ? `You are a helpful AI assistant. Use the following document context to answer accurately.\n\nContext:\n${context}`
      : `You are a helpful AI assistant. Answer the user's question clearly and helpfully.`;

    const messages = [
      { role: "system", content: systemMsg },
      ...history.map(m => ({ role: m.role, content: m.content })),
      { role: "user", content: question },
    ];

    const response = await this.groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages,
      max_tokens: 1024,
    });

    return {
      answer: response.choices[0].message.content,
      sources,
      hasContext: !!context,
    };
  }

  getDocuments() {
    return this.documents;
  }

  async clearDocuments() {
    this.vectorStore = null;
    this.documents = [];
  }
}

export const ragService = new RAGService();