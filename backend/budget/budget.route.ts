import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getBudget, setBudget ,deleteBudget} from "./budget.controller.js";

const router = Router();

router.get("/get-budget/:month", auth, getBudget);
router.post("/set-budget", auth, setBudget);
router.delete("/delete-budget/:id", auth, deleteBudget);

export default router;