import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { addTransactions, deleteTransaction, getExpenseBreakdown, getTransactionChart, getTransactions } from "./transaction.controller.js";

const router = Router();

router.get("/get", auth, getTransactions);
router.get("/chart",auth, getTransactionChart);
router.get("/expense-breakdown",auth, getExpenseBreakdown);
router.post("/add",auth,addTransactions);
router.delete("/delete/:id",auth,deleteTransaction);

export default router;