import express from "express";
import * as Sentry from "@sentry/node";
import "dotenv/config";
import cors from "cors";
import { clerkMiddleware } from "@clerk/express";
import webhookRoutes from "./webhook/webhookRoutes.js";
import userRoutes from "./users/userRoutes.js"
import accountRoutes from "./accounts/accounts.routes.js"
import transactionRoutes from "./transactions/transaction.route.js"
import budgetRoutes from "./budget/budget.route.js"
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();

// Middlewares
app.use(cors({ origin: "*" }));

app.use("/api/v1/webhooks", webhookRoutes);

// Normal application middleware
app.use(express.json());

app.use(
  clerkMiddleware({
    publishableKey: process.env.CLERK_PUBLISHABLE_KEY!,
    secretKey: process.env.CLERK_SECRET_KEY!,
  })
);

//routes
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/accounts", accountRoutes);
app.use("/api/v1/transactions", transactionRoutes);
app.use("/api/v1/budgets", budgetRoutes);

// Health check
app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use(errorHandler)

app.get("/debug-sentry", function mainHandler(req, res) {
  Sentry.logger.info('User triggered test error', {
    action: 'test_error_endpoint',
  });
  Sentry.metrics.count('test_counter', 1);
  throw new Error("My first Sentry error!");
});

export default app;
