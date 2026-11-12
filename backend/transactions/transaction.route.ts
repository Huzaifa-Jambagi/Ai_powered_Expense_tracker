import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getExpenseBreakdown, getTransactionChart, getTransactions } from "./transaction.controller.js";

const router = Router();

router.get("/get", auth, getTransactions);
router.get("/chart",auth, getTransactionChart);
router.get("/expense-breakdown",auth, getExpenseBreakdown);

export default router;