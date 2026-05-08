import dotenv from "dotenv";
dotenv.config();
import express from "express";
import session from "express-session";
import morgan from "morgan";
import methodOverride from "method-override";
import flash from "express-flash";
import routes from "./src/routes/user.route.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import { connectDB } from "./src/config/db.js";

const SESSION_SECRET = process.env.secretSession;
if (!SESSION_SECRET) {
  throw new Error("Missing secretSession environment variable");
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}

const app = express();
const PORT = process.env.PORT ?? 3000;

connectDB();

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));
app.use(methodOverride("_method"));

app.use(
  session({
    secret: SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());

app.use("/", routes);

app.use((_req, res) => {
  res.status(404).render("404");
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
