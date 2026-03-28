# Tech Stack

## Runtime & Framework
- **Node.js** with **Express 5** (CommonJS modules — `require`/`module.exports`)
- **EJS** templating engine for server-rendered views
- **MongoDB** via **Mongoose 9** for data persistence

## Authentication
- **Passport.js** with `passport-local` strategy (email + bcrypt password)
- Sessions stored in MongoDB via **connect-mongo**
- `express-session` for session management

## AI
- **Google Gemini** (`@google/genai`) — all AI features route through `services/ai/aiClient.js`
- Model in use: `gemini-3-flash-preview`

## File Handling
- **Multer** for file uploads (resumes stored in `uploads/`)
- **pdf-parse** and **mammoth** for extracting text from PDFs and DOCX files
- **PDFKit** and **Puppeteer** for generating PDF output

## Other Libraries
- **axios** — external API calls (coding platform integrations)
- **bcrypt** — password hashing
- **method-override** — supports PUT/DELETE from HTML forms
- **cors** — enabled for `http://localhost:4000` (LiveKit interview app)
- **dotenv** — environment config

## Environment Variables
Required in `.env`:
- `MONGO_URI` — MongoDB connection string
- `SESSION_SECRET` — express-session secret
- `GEMINI_API_KEY` — Google Gemini API key

## Common Commands
```bash
# Start the server
node app.js

# Install dependencies
npm install
```

No build step, bundler, or test framework is currently configured.
