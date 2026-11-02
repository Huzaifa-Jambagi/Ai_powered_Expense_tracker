import { Request, Response } from "express";
import "dotenv/config";
import { verifyWebhook } from "@clerk/express/webhooks";

import * as userService from "./webhookService.js";

export const clerk_webhook = async (req: Request, res: Response) => {
  // Verify webhook signature
  let evt;

  try {
    evt = await verifyWebhook(req);
  } catch (error) {
    console.error("Webhook verification failed:", error);

    return res.status(400).json({
      success: false,
      message: "Invalid webhook signature",
    });
  }

  // Process verified event
  try {
console.log("Event type:", evt.type);
console.log("Event data:", JSON.stringify(evt.data, null, 2));
    switch (evt.type) {
      case "user.created":
        await userService.createUser(evt.data);
        break;

      case "user.updated":
        await userService.updateUser(evt.data);
        break;

      case "user.deleted":
        await userService.deleteUser(evt.data);
        break;

      default:
        console.log("Unhandled webhook event:", evt.type,evt.data);
    }

    return res.status(200).json({
      success: true,
      message: "Webhook processed",
    });
  } catch (error) {
    console.error("Webhook processing failed:", error);

    return res.status(500).json({
      success: false,
      message: "Webhook processing failed",
    });
  }
};