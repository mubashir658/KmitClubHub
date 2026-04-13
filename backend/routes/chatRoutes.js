const express = require('express');
const router = express.Router();
const Groq = require('groq-sdk');
const clubsData = require('../data/clubsData');

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const SYSTEM_PROMPT = `You are a friendly and helpful assistant for KMIT Club Hub,
a student club management platform at KMIT (Keshav Memorial Institute of Technology),
Hyderabad.

Your job is to help students with:
- Which clubs exist and what they do
- Benefits and advantages of joining each club
- How to join a club, leave a club, or register for events
- How the website works (login, dashboard, events, polls, feedback)
- Recommending clubs based on student interests
- Answering questions about upcoming events and club activities

Rules:
- Keep answers short, friendly, and encouraging.
- If asked which club to join, ask about their interests first then recommend.
- If you do not know something very specific like a coordinator personal contact,
  say Please check the club page on the portal for the latest details.
- Never make up information not present in the knowledge base.
- Always encourage students to participate in clubs.
- Format answers cleanly — use bullet points when listing multiple items.

KNOWLEDGE BASE:
${clubsData}`;

router.post('/', async (req, res) => {
  const { messages } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: 'messages array is required' });
  }

  try {
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