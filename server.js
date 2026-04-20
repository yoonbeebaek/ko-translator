import 'dotenv/config';
import express from 'express';
import Anthropic from '@anthropic-ai/sdk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

app.use(express.json());
app.use(express.static(join(__dirname, 'public')));

app.post('/translate', async (req, res) => {
  const { text } = req.body;
  if (!text || !text.trim()) {
    return res.json({ translation: '' });
  }

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      system: `You are a real-time meeting interpreter. Translate English speech to natural, fluent Korean.\nRules:\n- Output ONLY the Korean translation, nothing else\n- Keep proper nouns, technical terms, and acronyms as-is if no standard Korean equivalent exists\n- Match the register and tone (formal meeting speech → formal Korean)\n- If the input is already Korean, return it unchanged\n- If the input is unintelligible or empty, return an empty string`,
      messages: [{ role: 'user', content: text.trim() }],
    });

    const translation = message.content[0].type === 'text' ? message.content[0].text : '';
    res.json({ translation });
  } catch (err) {
    console.error('Translation error:', err.message);
    res.status(500).json({ error: 'Translation failed', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`KORO translator running at http://localhost:${PORT}`);
});
