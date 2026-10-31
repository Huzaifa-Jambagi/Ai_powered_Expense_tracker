import "dotenv/config";
import "./instrument.js";
import app from "./app.js";
import { pool } from "./db/db.js";
import * as Sentry from "@sentry/node";

const PORT = Number(process.env.PORT) || 3000;

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const shutdown = async () => {
  console.log("Shutting down server...");

  server.close(async () => {
    await pool.end();
    process.exit(0);
  });
};

process.on("SIGTERM", shutdown);
process.on("SIGINT", shutdown);