# GitHub Copilot Workshop - Development Guide

## Project Architecture

This is a **3-tier superhero comparison application** with strict port conventions:
- **Backend**: Express/TypeScript API server on port 3000 (test: 3002)
- **Frontend**: React SPA on port 3001 with proxy to backend
- **MCP Server**: Model Context Protocol server for superhero data access

## Critical Development Patterns

### ESM Configuration
All components use **ES modules** (`"type": "module"` in package.json). Always use:
```typescript
import { fileURLToPath } from 'url';
const __dirname = path.dirname(fileURLToPath(import.meta.url));
```

### Data Layer Pattern
Superheroes data flows from `backend/data/superheroes.json` → API endpoints → React frontend. Schema:
```typescript
interface Superhero {
  id: number;
  name: string;
  image: string;
  powerstats: { intelligence, strength, speed, durability, power, combat };
}
```

### API Endpoints (Express)
- `GET /` → "Save the World!"
- `GET /api/superheroes` → All heroes array
- `GET /api/superheroes/:id` → Single hero by ID
- `GET /api/superheroes/:id/powerstats` → Hero powerstats only

### Testing Strategy
- **Backend**: Jest with `supertest` for API testing. Uses `TEST_PORT=3002` to avoid conflicts
- **Frontend**: Playwright E2E tests expect server on port 3001, test basic rendering
- **Critical**: Backend server exports app for testing but only starts when `NODE_ENV !== 'test'`

### Development Commands
```bash
# Backend (from backend/)
npm run dev          # nodemon with tsx
npm test            # Jest with ESM support
npm start           # Production server

# Frontend (from frontend/)
npm start           # React dev server on port 3001
npm test            # Playwright tests (requires backend running)

# MCP (from mcp/)
npm run build       # TypeScript compilation
node tests/test-mcp.js  # Verify MCP functionality
```

### React State Management
Frontend uses **comparison workflow**: select up to 2 heroes → compare powerstats → declare winner based on stat totals. State tracks `superheroes`, `selectedHeroes` (max 2), and `currentView` ('table'|'comparison').

### MCP Server Specifics
- Uses `@modelcontextprotocol/sdk` with stdio transport
- Tool: `get_superhero` accepts `name` or `id` parameters (both optional strings)
- Returns formatted Markdown with HTML img tags for hero display
- Server name: "superheroes-mcp" (note: typo in spec as "superheros-mcp")

### Error Handling Patterns
- Backend: Graceful JSON loading with detailed error messages, server startup error handling
- Frontend: Console error logging for fetch failures
- MCP: Must log to `stderr` and exit with code 1 on fatal errors