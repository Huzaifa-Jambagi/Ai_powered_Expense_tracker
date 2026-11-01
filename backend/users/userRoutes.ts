import { Router } from "express";
const router=Router();
import {auth} from "../middleware/auth.js"
import { getUserDetails } from "./userController.js";

router.get("/get",auth,getUserDetails)

export default router