const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const ragService = require('../utils/ragService');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
    // Extract the latest user query for RAG search
    const latestUserMessage = messages.filter(m => m.role === 'user').pop();
    const userQuery = latestUserMessage ? latestUserMessage.content : '';

    if (!userQuery) {
      return res.status(400).json({ error: 'No user query found' });
    }

    // Perform RAG search with a lower threshold for better recall
    const topK = 5;
    const threshold = 0.2; // Lowered from 0.5 to capture more relevant context
    const searchResults = await ragService.search(userQuery, topK, threshold);

    // Build context string from retrieved chunks
    const retrievedChunks = searchResults.length > 0 
      ? searchResults.map((res, i) => `[Chunk ${i+1}]: ${res.text}`).join('\n\n')
      : "No specific database context found for this query.";

    const SYSTEM_PROMPT = `You are a helpful and friendly chatbot for KMIT Club Hub, a college club platform.

Rules:
- For factual questions about clubs, events, or the website, answer ONLY based on the provided context.
- If the factual information is not in the context, say "I don't have enough information about that."
- Do not make up information or statistics.
- When asked about "upcoming" or "future" events, ONLY list events that are explicitly labeled as "(Upcoming Event)" in the context. Do NOT include events labeled as "(Past Event)".
- You MAY answer basic conversational greetings (like "hi", "hello", "how are you") naturally and politely.
- Format answers cleanly.

Context:
${retrievedChunks}`;

    // Reconstruct messages for Groq: system prompt + user question
    // To keep it simple, we use the conversation history but ensure the system prompt is strictly enforced.
    const groqMessages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...messages.map((m) => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content,
      })),
    ];

    const response = await groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: groqMessages,
      max_tokens: 400,
      temperature: 0.7,
    });

    const reply = response.choices[0].message.content;
    res.json({ reply });
  } catch (err) {
    console.error('Groq API error:', err.message);
    res.status(500).json({ error: 'Failed to get a response. Please try again.' });
  }
});

module.exports = router;