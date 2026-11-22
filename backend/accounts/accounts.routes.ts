import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { getAccounts, createAccount, updateAccount, deleteAccount } from "./accounts.controller.js";

const router = Router();

router.get("/get", auth, getAccounts);
router.post("/create", auth, createAccount);
router.patch("/:accountId", auth, updateAccount);
router.delete("/:accountId", auth, deleteAccount);

export default router;