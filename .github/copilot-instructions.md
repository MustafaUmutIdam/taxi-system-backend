## Quick orientation

This Node.js Express backend (ES modules) manages taxi stations and related models using Mongoose/MongoDB. Key entry points:

- `server.js` — loads env, connects DB and starts the server.
- `src/app.js` — Express app, middleware, global error handler and route mounting.
- Routes are mounted under `/api/*` (e.g. `/api/stations`).

Project layout (relevant folders):

- `src/routes/` — route declarations and per-route validation (uses `express-validator`).
- `src/controllers/` — controllers handle request/response shapes and call services.
- `src/services/` — business logic, DB access via Mongoose models.
- `src/models/` — Mongoose schemas/models.
- `src/config/database.js` — mongoose connection (reads `process.env.MONGODB_URI`).

## How to run locally

- Install: `npm install`
- Dev: `npm run dev` (uses `nodemon`)
- Start: `npm start`

Environment variables used (look in `server.js` / `database.js`):

- `MONGODB_URI` — MongoDB connection string (required)
- `PORT` — server port (optional, defaults 5000)
- `NODE_ENV` — used to show stack traces in errors when `development`

## API & patterns (examples you can use)

- Stations endpoints: defined in `src/routes/stationRoutes.js` and implemented in `src/controllers/stationController.js`.
  - GET `/api/stations` — optional `?search=` query to filter by name.
  - GET `/api/stations/:id`
  - POST `/api/stations` — request body validated by `express-validator` (see route validation rules for required fields like `name`, `address`, `location.lat`, `location.lng`).
  - GET `/api/stations/nearby?lat=X&lng=Y&distance=Z` — controller expects `lat` and `lng`. Service calculates Haversine distance in `src/services/stationService.js`.

Response conventions:

- Controllers return JSON with a top-level `success` boolean, `message` and either `data` or `errors`. Many endpoints include `count` for lists.

Code structure conventions to follow when adding features:

1. New route: add a file in `src/routes/` (or update existing routes) — include `express-validator` rules inline as done in `stationRoutes.js`.
2. Controller: add methods in `src/controllers/*Controller.js` that call into services and format responses consistently (use `success`, `data`, `message`).
3. Service: implement DB logic in `src/services/*Service.js` and throw Errors with clear messages; controllers convert these to appropriate HTTP responses.
4. Model: define Mongoose schema in `src/models/` and export it so services can import it.

Important implementation notes discovered (avoid surprises):

- Project uses ESM modules (`package.json` contains `type: "module"`) — use `import`/`export` syntax.
- Global error handling is in `src/app.js` — stack traces are only included when `NODE_ENV === 'development'`.
- Routes use `express-validator` and controllers call `validationResult(req)` before performing actions. Follow that pattern for new endpoints.
- The `Station` model includes nested `settings` and `stats` objects and expects `location.lat` and `location.lng` numeric fields; the service uses a JS Haversine calculation rather than MongoDB geospatial queries.

Potential mismatch to be cautious about:

- Some models use named exports (e.g. `export const User = ...`) while many services import models using default imports. When editing or adding models, ensure the export style matches how the model is imported (prefer `export default mongoose.model('Name', schema)` if services use default imports).

Developer workflows and quick tips

- Add new features by editing `src/routes/*`, `src/controllers/*`, `src/services/*`, and `src/models/*` — follow the existing layering.
- Use `npm run dev` to start with auto-reload. Make sure `MONGODB_URI` is available in your environment or in a local `.env` file.
- There are no automated tests in the repo; run lint/build checks manually if you add them.

Files to check for examples when working in a new area

- `src/routes/stationRoutes.js` — validation + routing
- `src/controllers/stationController.js` — response shape and error handling patterns
- `src/services/stationService.js` — data access, error wrapping, helper functions (distance calc)
- `src/models/Station.js` and `src/models/User.js` — schema patterns and hooks (e.g. password hashing in `User`)

When uncertain, preserve existing response shape and error handling.

If you want me to expand this (add TODOs for refactors, fix model export mismatches, or create a CONTRIBUTING file), say which area you'd like prioritized.
