const { pipeline, cos_sim } = require('@xenova/transformers');
const Club = require('../models/Club');
const Event = require('../models/Event');
const FAQ = require('../models/FAQ');
const clubsData = require('../data/clubsData');

const User = require('../models/User');

class RAGService {
  constructor() {
    this.vectorStore = [];
    this.extractor = null;
    this.isInitialized = false;
    // Embeddings index rebuild interval (e.g., every 30 mins)
    this.REBUILD_INTERVAL_MS = 30 * 60 * 1000;
  }

  async init() {
    if (this.isInitialized) return;
    try {
      console.log('Initializing RAG model (this may take a moment on first run to download the model)...');
      // Use feature extraction pipeline for embeddings
      this.extractor = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2', {
        quantized: true, // using quantized model for speed
      });
      console.log('RAG model initialized successfully.');
      
      await this.buildIndex();
      
      // Schedule periodic rebuilding
      setInterval(() => {
        this.buildIndex().catch(err => console.error('Error rebuilding RAG index:', err));
      }, this.REBUILD_INTERVAL_MS);

      this.isInitialized = true;
    } catch (error) {
      console.error('Failed to initialize RAG model:', error);
    }
  }

  // Split text into ~200 word chunks with ~10-20% overlap
  chunkText(text, metadata) {
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const CHUNK_SIZE = 250; // ~250 words is ~300-400 tokens
    const OVERLAP = 40; // ~15% overlap
    
    const chunks = [];
    for (let i = 0; i < words.length; i += (CHUNK_SIZE - OVERLAP)) {
      const chunkWords = words.slice(i, i + CHUNK_SIZE);
      if (chunkWords.length > 0) {
        chunks.push({
          text: chunkWords.join(' '),
          metadata
        });
      }
    }
    return chunks;
  }

  async buildIndex() {
    console.log('Building RAG vector index...');
    try {
      const documents = [];

      // 1. Ingest Clubs
      const clubs = await Club.find().select('name description category upcomingEvents eventsConducted coordinators').populate('coordinators', 'name').lean();
      
      // Create a master summary chunk for aggregate questions (e.g. "how many clubs are there")
      const clubNamesList = clubs.map(c => c.name).join(', ');
      const clubsSummaryText = `There are a total of ${clubs.length} active clubs at KMIT. The clubs are: ${clubNamesList}.`;
      documents.push(...this.chunkText(clubsSummaryText, { type: 'club_summary' }));

      for (const club of clubs) {
        const memberCount = await User.countDocuments({ clubs: club._id });
        const coordinatorNames = club.coordinators && club.coordinators.length > 0 
          ? club.coordinators.map(c => c.name).join(', ') 
          : 'None assigned';

        const text = `Club Name: ${club.name}. Category: ${club.category}. Description: ${club.description}. Coordinators: ${coordinatorNames}. Number of registered students/members: ${memberCount}. Upcoming Events: ${club.upcomingEvents?.join(', ') || 'None'}. Past Events: ${club.eventsConducted?.join(', ') || 'None'}.`;
        documents.push(...this.chunkText(text, { type: 'club', id: club._id, name: club.name }));
      }

      // 2. Ingest Events
      const events = await Event.find({ status: 'approved' }).populate('club', 'name').lean();
      for (const ev of events) {
        const eventDate = ev.date ? new Date(ev.date) : null;
        const dateStr = eventDate ? eventDate.toLocaleDateString() : 'TBA';
        const isPast = eventDate && eventDate < new Date();
        const dateStatus = isPast ? 'Past Event' : 'Upcoming Event';
        
        const clubName = ev.club ? ev.club.name : (ev.isForAllClubs ? 'All Clubs' : 'Unknown');
        const text = `Event: ${ev.title}. Hosted by: ${clubName}. Description: ${ev.description}. Date: ${dateStr} (${dateStatus}). Time: ${ev.time}. Venue: ${ev.venue}. Registration Open: ${ev.registrationOpen ? 'Yes' : 'No'}.`;
        documents.push(...this.chunkText(text, { type: 'event', id: ev._id, name: ev.title }));
      }

      // 3. Ingest FAQs
      const faqs = await FAQ.find().lean();
      for (const faq of faqs) {
        const text = `FAQ Question: ${faq.question}\nAnswer: ${faq.answer}`;
        documents.push(...this.chunkText(text, { type: 'faq', id: faq._id }));
      }

      // 4. Ingest general static knowledge base (clubsData.js)
      // We will split the large clubsData string into chunks
      documents.push(...this.chunkText(clubsData, { type: 'general_knowledge' }));

      // Generate embeddings for all chunks
      const newVectorStore = [];
      for (const doc of documents) {
        // extractor returns a tensor
        const output = await this.extractor(doc.text, { pooling: 'mean', normalize: true });
        const embedding = Array.from(output.data);
        newVectorStore.push({
          text: doc.text,
          metadata: doc.metadata,
          embedding: embedding
        });
      }

      // Atomic update of the vector store
      this.vectorStore = newVectorStore;
      console.log(`RAG vector index built successfully. Indexed ${this.vectorStore.length} chunks.`);
    } catch (error) {
      console.error('Error building RAG index:', error);
    }
  }

  async search(query, topK = 5, threshold = 0.5) {
    if (!this.extractor || this.vectorStore.length === 0) {
      console.warn('RAG search requested but not initialized or empty vector store');
      return [];
    }

    try {
      // Generate embedding for the query
      const output = await this.extractor(query, { pooling: 'mean', normalize: true });
      const queryEmbedding = Array.from(output.data);

      // Calculate cosine similarity with all stored vectors
      const results = this.vectorStore.map(item => {
        const similarity = cos_sim(queryEmbedding, item.embedding);
        return { ...item, similarity };
      });

      // Sort by similarity descending, filter by threshold, take topK
      const topResults = results
        .filter(r => r.similarity >= threshold)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      return topResults;
    } catch (error) {
      console.error('Error during RAG search:', error);
      return [];
    }
  }
}

// Export a singleton instance
const ragService = new RAGService();
module.exports = ragService;
