# User Management Dashboard

A server-rendered admin panel for managing user records, built with TypeScript, Express 5,
MongoDB and EJS. Full create, read, update and delete over a user collection, with
validation, flash messaging and search.

Built as part of the Cat Reloaded backend track.

> **History.** This project started as an authentication exercise (the repository was
> originally called `Auth-V1`) and was later reworked into a user-management dashboard.
> There is no login or password handling in the current code - see
> [Limitations](#limitations).

## Stack

| | |
|---|---|
| Language | TypeScript |
| Framework | Express 5 |
| Database | MongoDB via Mongoose |
| Views | EJS with shared partials |
| Validation | Zod 4 |
| Other | `method-override`, `express-flash`, `express-session`, Morgan |

## What it does

**MVC layering.** Routes, controllers, models, validation middleware and views are each
separated, so a request travels `route -> validation middleware -> controller -> model`
and the view only ever receives prepared data.

**Real HTTP verbs from HTML forms.** Browsers can only send `GET` and `POST`, so `PUT` and
`DELETE` routes are reached with `method-override` and a `?_method=` query parameter:

```html
<form action="/users/<%= user._id %>?_method=PUT" method="POST">
```

This keeps the route table honest - an update is a `PUT` and a delete is a `DELETE`, even
though the form itself posts.

**Validation before the controller.** Zod schemas in `src/middleware/validate.middleware.ts`
run as middleware. On failure the errors are flattened into a single readable message,
flashed, and the user is redirected back to the form they came from rather than being shown
a raw error page. On success `req.body` is replaced with the parsed data.

The update schema makes every field optional but refuses an empty submission:

```ts
.refine(data => Object.keys(data).length > 0, {
  message: "At least one field must be provided to update",
})
```

It also strips fields that were submitted blank, so leaving an input empty means "leave
this alone" rather than "set it to an empty string".

**Duplicate email protection at two levels.** The Mongoose schema marks `email` unique, and
the controllers check for a conflict before writing - on update the check excludes the
record being edited (`_id: { $ne: id }`), so saving a user without changing their email
does not report a false conflict.

**Search.** The user list accepts `?search=` and matches case-insensitively across first
name, second name and email using a regular expression `$or` query, sorted newest first.

## Routes

| Method | Path | Description |
|---|---|---|
| `GET` | `/` | User list. Supports `?search=`. |
| `GET` | `/user/add` | Form to create a user. |
| `GET` | `/user/edit/:id` | Form to edit a user. |
| `GET` | `/user/view/:id` | Read-only detail page. |
| `POST` | `/users` | Creates a user. Rejects duplicate emails. |
| `PUT` | `/users/:id` | Updates a user. Requires at least one field. |
| `DELETE` | `/users/:id` | Deletes a user. |

Unmatched routes render a 404 page; unhandled errors reach a centralized error handler
rather than crashing the process.

Every route that takes an `:id` validates it is a well-formed ObjectId first and flashes a
message instead of throwing when it is not.

### Data model

```
User
  firstName    String   required, trimmed
  secondName   String   required, trimmed
  email        String   required, unique, lowercased, format-checked
  phoneNumber  String   required, 6 to 15 digits
  createdAt    Date     automatic
  updatedAt    Date     automatic
```

## Running locally

Requires Node.js 18+ and a MongoDB instance.

```bash
git clone https://github.com/devYahia/user-management-dashboard.git
cd user-management-dashboard
npm install

cp .env.example .env    # then fill in the values
npm run dev
```

Open `http://localhost:3000`.

### Environment variables

| Variable | Required | Default | Purpose |
|---|---|---|---|
| `MONGO_URI` | yes | - | MongoDB connection string. The app exits if it is missing. |
| `secretSession` | yes | - | Secret used to sign the session cookie. The app throws on startup if it is missing. |
| `PORT` | no | `3000` | Port the HTTP server listens on |

### Scripts

| Command | Description |
|---|---|
| `npm run dev` | Development server with reload on change |
| `npm run build` | Compiles TypeScript to `dist/` |
| `npm start` | Runs the compiled build |

## Project structure

```
app.ts                              entry point, middleware, server start
src/
  config/db.ts                      MongoDB connection
  routes/user.route.ts              route definitions
  controllers/user.controller.ts    request handlers
  models/user.model.ts              Mongoose schema
  middleware/validate.middleware.ts Zod schemas and validation middleware
  middleware/errorHandler.ts        centralized error handler
  types/user.types.ts               shared TypeScript interfaces
views/
  index.ejs, 404.ejs                list and not-found pages
  user/                             add, edit and view pages
  partials/                         head, navbar and flash message partials
```

## Limitations

Being explicit about what this project does not do, since it is a learning exercise rather
than a production service:

- **No authentication of any kind.** The dashboard is completely open -
  anyone who can reach it can read, edit and delete every user. Sessions are configured,
  but only so that flash messages work; nothing signs in and no route is guarded. The
  `User` model has no password field.
- **No automated tests.** Adding a Vitest and Supertest suite is the next planned step.
- **No CI pipeline.**
- **No pagination.** The list page loads every user in the collection.
- **Search uses an unescaped regular expression,** so characters a user types are treated
  as regex syntax.
- **The error handler always returns JSON,** including for requests made by a browser
  expecting HTML.
- **The database connection is not awaited before the server starts listening,** so early
  requests can arrive before MongoDB is ready.
