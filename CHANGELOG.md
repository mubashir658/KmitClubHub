# CHANGELOG

## [Latest] - 2026-04-13

### Added
- **Chatbot Integration**: Integrated Groq API for AI-powered club assistant
- **ChatWidget Component**: Fixed-position chat widget with message history
- **Theme Styling**: White background with navbar-matching purple gradient (#667eea → #764ba2)

### Changed
- **ChatWidget File**: Renamed `ChatWidget.js` → `ChatWidget.jsx` (Vite requirement for JSX)
- **Dependencies Updated**:
  - `react`: upgraded to 19.0.0
  - `recharts`: downgraded to 3.2.1 (fixes ESM build issues)
  - `groq-sdk`: added 0.7.0

### Fixed
- **Express Routing**: Removed invalid `app.options('*', cors())` that caused PathError
- **Frontend Build**: Fixed Vite ESM resolution for recharts (3.8.1 → 3.2.1)
- **React Peer Dependencies**: Resolved React 18 vs 19 conflicts
- **ChatWidget Styling**: Fixed duplicate style attribute warning in send button

### Known Issues
- ❌ **MongoDB Connection**: Requires IP whitelist in MongoDB Atlas
  - Solution: Add your IP to Network Access → IP Whitelist
  - No code changes needed, external configuration only

### Setup for Others
1. Clone repo
2. `cd backend && npm install` + create `.env` with MONGODB_URI
3. `cd ../frontend && npm install`
4. Start: `cd backend && node server.js` & `cd frontend && npm run dev`

### Next Steps
- Once MongoDB is configured, test `/api/chat` endpoint
- ChatWidget will be fully functional once backend connects to database
