import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import {
    getTransactions as getTransactionsService,
    getTransactionChart as getTransactionChartService,
} from "./transaction.service.js";
import {
    getTransactionsSchema,
    getTransactionChartSchema,
} from "./transactions.validation.js";

export const getTransactions = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const timezone = req.headers["x-timezone"];

        if (typeof timezone !== "string" || !timezone) {
            return res.status(400).json({ success: false, message: "Timezone is required" });
        }

        try {
            new Intl.DateTimeFormat("en-US", { timeZone: timezone });
        } catch {
            return res.status(400).json({ success: false, message: "Invalid timezone" });
        }

        const validation = getTransactionsSchema.safeParse(req.query);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                errors: validation.error.flatten(),
            });
        }

        const result = await getTransactionsService({
            ...validation.data,
            userId,
            timezone,
        });

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};


export const getTransactionChart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const timezone = req.headers["x-timezone"];

        if (typeof timezone !== "string" || !timezone) {
            return res.status(400).json({ success: false, message: "Timezone is required" });
        }

        try {
            new Intl.DateTimeFormat("en-US", { timeZone: timezone });
        } catch {
            return res.status(400).json({ success: false, message: "Invalid timezone" });
        }

        const validation = getTransactionChartSchema.safeParse(req.query);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                errors: validation.error.flatten(),
            });
        }

        const result = await getTransactionChartService({
            ...validation.data,
            userId,
            timezone,
        });

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};
