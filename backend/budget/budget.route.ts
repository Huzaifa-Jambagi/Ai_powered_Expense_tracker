import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getBudget, setBudget } from "./budget.controller.js";

const router = Router();

router.get("/get", auth, getBudget);
router.put("/set", auth, setBudget);

export default router;