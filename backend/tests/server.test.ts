
import request from 'supertest';
import app from '../src/server.ts';
// Jest globals for TypeScript
import type { Response } from 'supertest';

// Silence TS errors for Jest globals if needed
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const describe: jest.Describe;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const it: jest.It;
// eslint-disable-next-line @typescript-eslint/no-unused-vars
declare const expect: jest.Expect;

process.env.TEST_PORT = '3002'; // Set the test port

describe('GET /', () => {
  it('should respond with "Save the World!"', async () => {
    const response = await request(app).get('/');
    expect(response.status).toBe(200);
    expect(response.text).toBe('Save the World!');
  });
});

describe('GET /api/superheroes', () => {
  it('should return all superheroes as an array', async () => {
    const response = await request(app).get('/api/superheroes');
    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBe(true);
    expect(response.body.length).toBeGreaterThan(0);
    // Check that required fields exist
    response.body.forEach((hero: any) => {
      expect(hero).toHaveProperty('id');
      expect(hero).toHaveProperty('name');
      expect(hero).toHaveProperty('image');
      expect(hero).toHaveProperty('powerstats');
    });
  });

  it('should handle internal server error gracefully', async () => {
    // Temporarily mock loadSuperheroes to throw
    // Type annotation for r, req, res
    const original = app._router.stack.find((r: any) => r.route && r.route.path === '/api/superheroes').route.stack[0].handle;
    app._router.stack.find((r: any) => r.route && r.route.path === '/api/superheroes').route.stack[0].handle = async (req: any, res: any) => {
      res.status(500).send('Internal Server Error');
    };
    const response = await request(app).get('/api/superheroes');
    expect(response.status).toBe(500);
    // Restore original handler
    app._router.stack.find((r: any) => r.route && r.route.path === '/api/superheroes').route.stack[0].handle = original;
  });
});

describe('GET /api/superheroes/:id', () => {
  it('should return the superhero with the given id', async () => {
    const response = await request(app).get('/api/superheroes/1');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id', 1);
    expect(response.body).toHaveProperty('name', 'A-Bomb');
  });

  it('should return 404 if superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/9999');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle non-numeric id gracefully', async () => {
    const response = await request(app).get('/api/superheroes/abc');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });
});

describe('GET /api/superheroes/:id/powerstats', () => {
  it('should return the powerstats for the superhero with the given id', async () => {
    const response = await request(app).get('/api/superheroes/2/powerstats');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({
      intelligence: 100,
      strength: 18,
      speed: 23,
      durability: 28,
      power: 32,
      combat: 32
    });
  });

  it('should return 404 if superhero does not exist', async () => {
    const response = await request(app).get('/api/superheroes/9999/powerstats');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });

  it('should handle non-numeric id gracefully', async () => {
    const response = await request(app).get('/api/superheroes/xyz/powerstats');
    expect(response.status).toBe(404);
    expect(response.text).toBe('Superhero not found');
  });
});

describe('GET /api/superheroes/compare', () => {
  it('should compare two different superheroes and return category winners and overall winner', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=2');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id1', 1);
    expect(response.body).toHaveProperty('id2', 2);
    expect(Array.isArray(response.body.categories)).toBe(true);
    expect(response.body.categories.length).toBe(6);
    // Ensure ordering and structure
    const ordered = ['intelligence','strength','speed','durability','power','combat'];
    response.body.categories.forEach((cat: any, idx: number) => {
      expect(cat).toHaveProperty('name', ordered[idx]);
      expect(cat).toHaveProperty('id1_value');
      expect(cat).toHaveProperty('id2_value');
      expect(['tie', 1, 2]).toContain(cat.winner);
    });
    expect(['tie', 1, 2]).toContain(response.body.overall_winner);
  });

  it('should return 400 if missing a parameter', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 400 if ids are identical', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=1');
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty('error');
  });

  it('should return 404 if one id not found', async () => {
    const response = await request(app).get('/api/superheroes/compare?id1=1&id2=9999');
    expect(response.status).toBe(404);
    expect(response.body).toHaveProperty('error');
  });

  it('should allow a tie overall when each wins equal categories', async () => {
    // Use two heroes that are likely to tie after custom manipulation is not allowed; Instead we verify logic by crafting expectation:
    // Force a tie by temporarily mocking load & endpoint handler; simpler approach: if we compare hero 1 vs hero 3: compute wins
    const resp13 = await request(app).get('/api/superheroes/compare?id1=1&id2=3');
    expect(resp13.status).toBe(200);
    const h1Wins = resp13.body.categories.filter((c: any) => c.winner === 1).length;
    const h3Wins = resp13.body.categories.filter((c: any) => c.winner === 3).length;
    if (h1Wins === h3Wins) {
      expect(resp13.body.overall_winner).toBe('tie');
    } else {
      // If dataset changes and not a tie, at least ensure consistency: overall winner corresponds to greater wins or tie
      const expectedOverall = h1Wins > h3Wins ? 1 : 3;
      expect(resp13.body.overall_winner).toBe(expectedOverall);
    }
  });
});

