import express  from "express";
import { users } from "./userController.js";
const router=express.Router();

const rawJson=express.raw({ type: 'application/json' ,limit:"1mb"});

router.post("/users",rawJson,users)

export default router;