import dotenv from "dotenv";
dotenv.config();

import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import routes from "./routes/auth.route.js";
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT ?? 3000;

const SECRET = process.env.secretSession;
if (!SECRET) {
  throw new Error("Missing secretSession environment variable");
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

// Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 60 * 60 * 1000 * 24,
    },
  })
);

app.use("/api", routes);

// Global error handler (must be last)
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
