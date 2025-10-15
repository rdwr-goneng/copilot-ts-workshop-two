# GitHub Copilot Workshop for Commit AI Customers

**Legal Disclaimer:**

This repository contains proprietary workshop code and materials. The contents are the intellectual property of Commit AI and are provided solely for the purposes of the associated workshop by paying customers. 

**You may not use, copy, distribute, or share any part of this code or its contents without explicit written consent from Commit AI.**

## Superheroes App Backend API (Enhancement)

An additional comparison endpoint has been added to move comparison logic from the frontend to the backend.

### Compare Two Superheroes

Endpoint:
```
GET /api/superheroes/compare?id1=<id>&id2=<id>
```

Response shape:
```json
{
	"id1": 1,
	"id2": 2,
	"categories": [
		{ "name": "intelligence", "winner": 2, "id1_value": 38, "id2_value": 100 },
		{ "name": "strength", "winner": 1, "id1_value": 100, "id2_value": 18 },
		{ "name": "speed", "winner": 2, "id1_value": 17, "id2_value": 23 },
		{ "name": "durability", "winner": 1, "id1_value": 80, "id2_value": 28 },
		{ "name": "power", "winner": 2, "id1_value": 24, "id2_value": 32 },
		{ "name": "combat", "winner": 1, "id1_value": 64, "id2_value": 32 }
	],
	"overall_winner": 1
}
```

`winner` per category is either the winning hero's numeric ID or the string `"tie"`. The `overall_winner` is `id1`, `id2`, or `"tie"` when each wins an equal number of categories.

### Frontend Changes

The React app now:
1. Selects two heroes client-side (unchanged interaction).
2. Calls the compare endpoint instead of computing results locally.
3. Displays a loading state while fetching and an error state on failure.
4. Renders category-level winners highlighting higher values and shows overall winner or tie.

If the compare request fails, a fallback error message is displayed instead of the previous locally computed result.

### Local Development

Run backend then frontend (from their respective folders):
```
npm run dev   # backend
npm start     # frontend (will proxy to backend)
```

Jest tests cover the compare endpoint; Playwright tests continue to exercise UI flows.
