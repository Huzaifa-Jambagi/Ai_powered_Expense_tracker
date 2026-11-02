import { Router } from "express";
const router=Router();
import {auth} from "../middleware/auth.js"
import { getUserDetails,completeOnboarding } from "./userController.js";

console.log("USER ROUTES FILE LOADED");

router.get("/get",auth,getUserDetails);

router.patch("/onboarding",auth,completeOnboarding);

export default router