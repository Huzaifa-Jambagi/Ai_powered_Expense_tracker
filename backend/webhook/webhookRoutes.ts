import express  from "express";
import { clerk_webhook } from "./webhookController.js";
const router=express.Router();

const rawJson=express.raw({ type: 'application/json' ,limit:"1mb"});

router.post("/users",rawJson,clerk_webhook)

export default router;