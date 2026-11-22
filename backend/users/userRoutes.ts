import { Router } from "express";
const router=Router();
import {auth} from "../middleware/auth.js"
import { getUserDetails, completeOnboarding, updateCurrency } from "./userController.js";

router.get("/get",auth,getUserDetails);

router.patch("/onboarding",(req,res,next)=>{console.log("onboarding api hit"); next();},auth,completeOnboarding);

router.patch("/currency", auth, updateCurrency);

export default router