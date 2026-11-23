import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";

import * as subscriptionService from "./subscription.service.js";
import {
    createSubscriptionSchema,
    updateSubscriptionSchema,
    updateSubscriptionStatusSchema,
    subscriptionIdParamsSchema,
    markSubscriptionPaidSchema,
} from "./subscription.validation.js";

import { markSubscriptionAsPaid as markSubscriptionAsPaidService } from "./subscription.service.js";

const sendResponse = (res: Response, status: number, success: boolean, message: string, data: unknown = null) => {
    return res.status(status).json({ success, message, data });
};

export const getSubscriptions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuth(req).userId;
        if (!userId) return sendResponse(res, 401, false, "Unauthorized");

        const subscriptions = await subscriptionService.getSubscriptions(userId);

        return sendResponse(res, 200, true, "Subscriptions fetched successfully", subscriptions);
    } catch (error) {
        next(error);
    }
};

export const getSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuth(req).userId;
        if (!userId) return sendResponse(res, 401, false, "Unauthorized");

        const params = subscriptionIdParamsSchema.safeParse(req.params);
        if (!params.success) return sendResponse(res, 400, false, params.error.issues[0].message, params.error.issues);

        const subscription = await subscriptionService.getSubscriptionById(userId, params.data.subscriptionId);

        if (!subscription) return sendResponse(res, 404, false, "Subscription not found");

        return sendResponse(res, 200, true, "Subscription fetched successfully", subscription);
    } catch (error) {
        next(error);
    }
};

export const createSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuth(req).userId;
        if (!userId) return sendResponse(res, 401, false, "Unauthorized");

        const validated = createSubscriptionSchema.safeParse(req.body);
        if (!validated.success) return sendResponse(res, 400, false, validated.error.issues[0].message, validated.error.issues);

        const subscription = await subscriptionService.createSubscription(userId, validated.data);

        return sendResponse(res, 201, true, "Subscription created successfully", subscription);
    } catch (error) {
        next(error);
    }
};

export const updateSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuth(req).userId;
        if (!userId) return sendResponse(res, 401, false, "Unauthorized");

        const params = subscriptionIdParamsSchema.safeParse(req.params);
        if (!params.success) return sendResponse(res, 400, false, params.error.issues[0].message, params.error.issues);

        const validated = updateSubscriptionSchema.safeParse(req.body);
        if (!validated.success) return sendResponse(res, 400, false, validated.error.issues[0].message, validated.error.issues);

        const subscription = await subscriptionService.updateSubscription(userId, params.data.subscriptionId, validated.data);

        if (!subscription) return sendResponse(res, 404, false, "Subscription not found");

        return sendResponse(res, 200, true, "Subscription updated successfully", subscription);
    } catch (error) {
        next(error);
    }
};

export const updateSubscriptionStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuth(req).userId;
        if (!userId) return sendResponse(res, 401, false, "Unauthorized");

        const params = subscriptionIdParamsSchema.safeParse(req.params);
        if (!params.success) return sendResponse(res, 400, false, params.error.issues[0].message, params.error.issues);

        const validated = updateSubscriptionStatusSchema.safeParse(req.body);
        if (!validated.success) return sendResponse(res, 400, false, validated.error.issues[0].message, validated.error.issues);

        const subscription = await subscriptionService.updateSubscriptionStatus(
            userId,
            params.data.subscriptionId,
            validated.data.status
        );

        if (!subscription) return sendResponse(res, 404, false, "Subscription not found");

        return sendResponse(res, 200, true, "Subscription status updated successfully", subscription);
    } catch (error) {
        next(error);
    }
};

export const deleteSubscription = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = getAuth(req).userId;
        if (!userId) return sendResponse(res, 401, false, "Unauthorized");

        const params = subscriptionIdParamsSchema.safeParse(req.params);
        if (!params.success) return sendResponse(res, 400, false, params.error.issues[0].message, params.error.issues);

        const deleted = await subscriptionService.deleteSubscription(userId, params.data.subscriptionId);

        if (!deleted) return sendResponse(res, 404, false, "Subscription not found");

        return sendResponse(res, 200, true, "Subscription deleted successfully");
    } catch (error) {
        next(error);
    }
};

export const markSubscriptionAsPaid = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) return sendResponse(res, 401, false, "Unauthorized");

    const params = subscriptionIdParamsSchema.safeParse(req.params);

    if (!params.success) return sendResponse(res, 400, false, "Invalid subscription ID", params.error.issues);

    const body = markSubscriptionPaidSchema.safeParse(req.body);

    if (!body.success) return sendResponse(res, 400, false, "Invalid request body", body.error.issues);

    try {
        const subscription = await markSubscriptionAsPaidService(userId, params.data.subscriptionId, body.data);

        if (!subscription) return sendResponse(res, 404, false, "Subscription not found");

        return sendResponse(res, 200, true, "Subscription marked as paid", subscription);
    } catch {
        return sendResponse(res, 500, false, "Failed to mark subscription as paid");
    }
};