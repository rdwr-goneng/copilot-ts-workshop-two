import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

/**
This is a superheroes API server that supports 3 GET endpoints
The data is stored in a JSON file in the project folder called superheroes.json
1. /superheroes/all - returns a list of all superheroes, as a JSON array
2. /superheroes/:id - returns a specific superhero by id, as a JSON object
3. /superheroes/:id/powerstats - returns a the powers statistics for superhero by id, as a JSON object
*/

// Get proper __dirname equivalent in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.TEST_PORT || process.env.PORT || 3000;

// Root route
/**
 * GET /
 * Root endpoint for health check or welcome message.
 *
 * Response: 200 OK - Returns a welcome string.
 */
app.get('/', (req, res) => {
  res.send('Save the World!');
});

// API route to fetch superheroes data
/**
 * Loads the list of superheroes from a JSON file asynchronously.
 *
 * @returns {Promise<any>} A promise that resolves with the parsed JSON data containing superheroes,
 * or rejects if there is an error reading or parsing the file.
 * @throws Will reject the promise if the file cannot be read or if the JSON is invalid.
 */
function loadSuperheroes(): Promise<any> {
  const dataPath = path.join(__dirname, '../data/superheroes.json');
  return new Promise((resolve, reject) => {
    fs.readFile(dataPath, 'utf8', (err, data) => {
      if (err) {
        reject(err);
        return;
      }
      try {
        resolve(JSON.parse(data));
      } catch (parseErr) {
        reject(parseErr);
      }
    });
  });
}

/**
 * GET /api/superheroes
 * Returns a list of all superheroes.
 *
 * Response: 200 OK - Array of superhero objects
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes', async (req, res) => {
  try {
    const superheroes = await loadSuperheroes();
    res.json(superheroes);
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/superheroes/:id
 * Returns a single superhero by their unique ID.
 *
 * Params: id (string) - The unique identifier of the superhero
 * Response: 200 OK - Superhero object
 *           404 Not Found - If the superhero does not exist
 *           500 Internal Server Error - If data cannot be read
 */
/**
 * GET /api/superheroes/compare?id1=1&id2=2
 * Compares the powerstats of two superheroes and returns category winners and overall winner.
 * Query params: id1, id2 (required) - numeric superhero IDs
 * Response: 200 OK - JSON object with comparison details
 *           400 Bad Request - If params missing or identical
 *           404 Not Found - If one or both heroes not found
 *           500 Internal Server Error - On data load error
 */
app.get('/api/superheroes/compare', async (req, res) => {
  const { id1, id2 } = req.query as { id1?: string; id2?: string };
  if (!id1 || !id2) {
    return res.status(400).json({ error: 'Both id1 and id2 query parameters are required' });
  }
  if (id1 === id2) {
    return res.status(400).json({ error: 'id1 and id2 must be different' });
  }

  try {
    const superheroes = await loadSuperheroes();
    const hero1 = superheroes.find((h: any) => String(h.id) === String(id1));
    const hero2 = superheroes.find((h: any) => String(h.id) === String(id2));
    if (!hero1 || !hero2) {
      return res.status(404).json({ error: 'One or both superheroes not found' });
    }

    const categoriesOrder = ['intelligence', 'strength', 'speed', 'durability', 'power', 'combat'] as const;
    type CategoryName = typeof categoriesOrder[number];

    interface CategoryResult {
      name: CategoryName;
      winner: number | 'tie';
      id1_value: number;
      id2_value: number;
    }

    const categoryResults: CategoryResult[] = categoriesOrder.map((cat) => {
      const v1 = Number(hero1.powerstats[cat]);
      const v2 = Number(hero2.powerstats[cat]);
      let winner: number | 'tie';
      if (v1 > v2) winner = hero1.id;
      else if (v2 > v1) winner = hero2.id;
      else winner = 'tie';
      return { name: cat, winner, id1_value: v1, id2_value: v2 };
    });

    // Count wins (ties contribute nothing)
    let hero1Wins = 0;
    let hero2Wins = 0;
    categoryResults.forEach(r => {
      if (r.winner === hero1.id) hero1Wins++;
      else if (r.winner === hero2.id) hero2Wins++;
    });

    let overall: number | 'tie';
    if (hero1Wins > hero2Wins) overall = hero1.id;
    else if (hero2Wins > hero1Wins) overall = hero2.id;
    else overall = 'tie';

    res.json({
      id1: hero1.id,
      id2: hero2.id,
      categories: categoryResults,
      overall_winner: overall
    });
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

// Keep this dynamic route AFTER more specific routes like /compare to avoid conflicts
app.get('/api/superheroes/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const superheroes = await loadSuperheroes();
    const superhero = superheroes.find((hero: any) => String(hero.id) === String(id));
    if (superhero) {
      res.json(superhero);
    } else {
      res.status(404).send('Superhero not found');
    }
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});

/**
 * GET /api/superheroes/:id/powerstats
 * Returns the powerstats for a superhero by their unique ID.
 *
 * Params: id (string) - The unique identifier of the superhero
 * Response: 200 OK - Powerstats object
 *           404 Not Found - If the superhero does not exist
 *           500 Internal Server Error - If data cannot be read
 */
app.get('/api/superheroes/:id/powerstats', async (req, res) => {
  const { id } = req.params;
  try {
    const superheroes = await loadSuperheroes();
    const superhero = superheroes.find((hero: any) => String(hero.id) === String(id));
    if (superhero) {
      res.json(superhero.powerstats);
    } else {
      res.status(404).send('Superhero not found');
    }
  } catch (err) {
    console.error('Error loading superheroes data:', err);
    res.status(500).send('Internal Server Error');
  }
});


// Start the server only if not in test environment
if (process.env.NODE_ENV !== 'test') {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });

    server.on('error', (err: NodeJS.ErrnoException) => {
      console.error('Failed to start server:', err.message);
      if (err.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use.`);
      } else if (err.code === 'EACCES') {
        console.error(`Insufficient privileges to bind to port ${PORT}.`);
      }
      process.exit(1);
    });

    // Handle uncaught exceptions and unhandled promise rejections
    process.on('uncaughtException', (err) => {
      console.error('Uncaught Exception:', err);
      process.exit(1);
    });

    process.on('unhandledRejection', (reason) => {
      console.error('Unhandled Rejection:', reason);
      process.exit(1);
    });
  } catch (err) {
    console.error('Unexpected error during server startup:', err);
    process.exit(1);
  }
}

export default app;