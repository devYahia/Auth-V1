import dotenv from "dotenv";
dotenv.config();

import mongoose from "mongoose";
import express from "express";
import session from "express-session";
import cookieParser from "cookie-parser";
import routes from "./src/routes/auth.route.js";
import { errorHandler } from "./src/middleware/errorHandler.js";

const app = express();
const PORT = process.env.PORT ?? 3000;
const MONGO_URI: string | undefined = process.env.MONGO_URI;

app.set("view engine", "ejs");

app.get("/", (req, res) => {
  res.render("index");
});

const SECRET = process.env.secretSession;
if (!SECRET) {
  throw new Error("Missing secretSession environment variable");
}

if (!MONGO_URI) {
  throw new Error("Missin MONGO_URI");
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

mongoose
  .connect(MONGO_URI)
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
