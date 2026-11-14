import { Router } from "express";
const router=Router();
import {auth} from "../middleware/auth.js"
import { getUserDetails,completeOnboarding } from "./userController.js";


router.get("/get",auth,getUserDetails);

router.patch("/onboarding",(req,res,next)=>{console.log("onboarding api hit"); next();},auth,completeOnboarding);


export default router