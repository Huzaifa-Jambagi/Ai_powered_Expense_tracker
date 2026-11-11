import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getTransactionChart, getTransactions } from "./transaction.controller.js";

const router = Router();

router.get("/get", auth, getTransactions);
router.get("/chart",auth, getTransactionChart);

export default router;