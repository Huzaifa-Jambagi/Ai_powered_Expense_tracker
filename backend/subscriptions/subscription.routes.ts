import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
    getSubscriptions,
    getSubscription,
    createSubscription,
    updateSubscription,
    updateSubscriptionStatus,
    deleteSubscription,
    markSubscriptionAsPaid,
} from "./subscription.controller.js";

const router = Router();

router.use(auth);

router.get("/", getSubscriptions);
router.get("/:subscriptionId", getSubscription);

router.post("/", createSubscription);
router.post("/:subscriptionId/pay", markSubscriptionAsPaid);

router.patch("/:subscriptionId/status", updateSubscriptionStatus);
router.patch("/:subscriptionId", updateSubscription);

router.delete("/:subscriptionId", deleteSubscription);

export default router;