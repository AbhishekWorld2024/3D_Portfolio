// Local Express backend for the portfolio chatbot (used in `npm run dev`).
// RAG retrieval + LLM generation logic live in shared modules (rag.js, llm.js)
// so the exact same logic powers the Vercel serverless function in production.

import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { knowledgeBase } from './knowledgeBase.js';
import { retrieve, buildSystemPrompt, buildMessages } from './rag.js';
import { streamReply, warmUp, PROVIDER, ACTIVE_MODEL } from './llm.js';

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;

app.post('/api/chat', async (req, res) => {
  try {
    const { message, history } = req.body || {};
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'A "message" string is required.' });
    }

    const contextChunks = retrieve(message, 2);
    const messages = buildMessages(message, history);

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('X-Accel-Buffering', 'no');
    res.flushHeaders?.();

    await streamReply({ system: buildSystemPrompt(contextChunks), messages, res });
    res.end();
  } catch (err) {
    console.error('[chat] error:', err);
    if (res.headersSent) {
      res.write(`\n\n[Error: ${err.message || 'generation failed'}]`);
      res.end();
    } else {
      res.status(500).json({ error: err.message || 'Something went wrong. Please try again.' });
    }
  }
});

app.get('/api/health', (_req, res) => res.json({ ok: true, provider: PROVIDER, model: ACTIVE_MODEL }));

app.listen(PORT, () => {
  console.log(`✅ Portfolio chatbot API running on http://localhost:${PORT}`);
  console.log(`   Provider: ${PROVIDER}  |  Model: ${ACTIVE_MODEL}  |  KB chunks: ${knowledgeBase.length}`);
  warmUp();
});
