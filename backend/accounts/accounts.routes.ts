import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {getAccounts} from "./accounts.controller.js"
const router=Router();

router.get("/get",auth,getAccounts)

export default router