import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getTransactions } from "./transaction.controller.js";

const router = Router();

router.get("/get", auth, getTransactions);

export default router;