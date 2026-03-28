# Project Structure

## Overview
Standard MVC layout. No build step — files are served directly by Node.js.

```
app.js                  # Entry point: DB connection, middleware, route mounting
config/
  passport.js           # Passport local strategy setup
controllers/            # Route handler logic (one file per feature)
middlewares/
  profileCheck.js       # Auth guard: redirects to /login or /onboarding if not ready
models/                 # Mongoose schemas and models
routes/                 # Express routers (one file per feature)
services/
  ai/                   # All Gemini AI logic; aiClient.js is the shared entry point
  activity/             # Per-platform coding activity fetchers (LeetCode, GitHub, etc.)
  parser/               # Resume text extraction (PDF/DOCX)
utils/                  # Shared helper functions
views/                  # EJS templates, organized by feature
  auth/ assessment/ dashboard/ resume/ resumeBuilder/ activity/ interview/ onboarding/
public/
  css/                  # Client-side stylesheets
  js/                   # Client-side scripts
uploads/                # Multer upload destination for resume files
```

## Conventions

- **Module system**: CommonJS (`require` / `module.exports`) throughout
- **Route mounting**: All routes registered in `app.js` with a feature prefix (e.g. `/resume`, `/activity`)
- **Auth checks**: Use `profileCheck` middleware on protected routes; it handles both unauthenticated and incomplete-onboarding cases
- **Controllers**: Export named functions (`exports.fnName`), one controller per feature domain
- **Models**: One file per Mongoose model, exported as `mongoose.model("Name", schema)`
- **AI services**: Always go through `services/ai/aiClient.js` (`generateText`); never instantiate `GoogleGenAI` elsewhere
- **Error handling**: `try/catch` in async controllers; log with `console.error`, respond with `res.send("Error ...")` or redirect
- **Views**: Rendered with `res.render("folder/template", { data })` — folder matches the feature name
- **Static assets**: Served from `public/`; scoped CSS/JS files exist only for complex client-side pages (e.g. resume editor)
