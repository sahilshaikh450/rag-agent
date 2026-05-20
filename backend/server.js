import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { ragService } from "./ragService.js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Multer for file uploads
const upload = multer({
  dest: "uploads/",
  fileFilter: (req, file, cb) => {
    const allowed = [".pdf", ".txt", ".md"];
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowed.includes(ext)) cb(null, true);
    else cb(new Error("Only PDF, TXT, and MD files allowed"));
  },
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
});

// Ensure uploads dir exists
if (!fs.existsSync("uploads")) fs.mkdirSync("uploads");

// ─── Routes ───────────────────────────────────────────────────────────────────

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "RAG Agent is running 🚀" });
});

// Upload & ingest documents
app.post("/api/upload", upload.array("files", 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: "No files uploaded" });
    }

    const results = [];
    for (const file of req.files) {
      const result = await ragService.ingestDocument(file);
      results.push(result);
    }

    res.json({
      success: true,
      message: `${results.length} document(s) processed successfully`,
      documents: results,
    });
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Ask a question
app.post("/api/chat", async (req, res) => {
  try {
    const { question, history = [] } = req.body;
    if (!question) return res.status(400).json({ error: "Question is required" });

    const answer = await ragService.query(question, history);
    res.json(answer);
  } catch (err) {
    console.error("Chat error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Get ingested documents list
app.get("/api/documents", (req, res) => {
  const docs = ragService.getDocuments();
  res.json({ documents: docs });
});

// Clear all documents
app.delete("/api/documents", async (req, res) => {
  await ragService.clearDocuments();
  res.json({ success: true, message: "All documents cleared" });
});

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 RAG Agent Backend running on http://localhost:${PORT}`);
  console.log(`📁 Upload docs at POST /api/upload`);
  console.log(`💬 Chat at POST /api/chat\n`);
});
