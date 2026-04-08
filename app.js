import express from "express";
import cors from "cors";
import helmet from "helmet";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { errorHandler, notFoundHandler } from "./src/middlewares/error-handler.js";
import apiRouter from "./src/routes/index.js";

const app = express();
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const publicDirectory = path.join(currentDirectory, "src", "public");

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        connectSrc: ["'self'"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        imgSrc: ["'self'", "data:"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "https://fonts.googleapis.com"]
      }
    }
  })
);
app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: false }));

app.use("/api", apiRouter);
app.use(express.static(publicDirectory));

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
