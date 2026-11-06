import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getBudget, setBudget } from "./budget.controller.js";

const router = Router();

router.get("/get-budget/:date", auth, getBudget);
router.post("/set-budget", auth, setBudget);

export default router;