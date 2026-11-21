import { getAuth } from "@clerk/express";
import type { Request, Response, NextFunction } from "express";
import {
    getTransactions as getTransactionsService,
    getTransactionChart as getTransactionChartService,
    getExpenseBreakdown as getExpenseBreakdownService,
    addTransaction as addTransactionService,
    deleteTransaction as deleteTransactionService,
} from "./transaction.service.js";

import {
    getTransactionsSchema,
    getTransactionChartSchema,
    addTransactionSchema,
    deleteTransactionSchema,
} from "./transactions.validation.js";
import { getExpenseBreakdownSchema } from "./transactions.validation.js";

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

export const getExpenseBreakdown = async (req: Request, res: Response, next: NextFunction) => {
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

        const validation = getExpenseBreakdownSchema.safeParse(req.query);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid query parameters",
                errors: validation.error.flatten(),
            });
        }

        const result = await getExpenseBreakdownService({
            ...validation.data,
            userId,
            timezone,
        });

        return res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
};

export const addTransactions = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const validation = addTransactionSchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction data",
                errors: validation.error.flatten(),
            });
        }

        await addTransactionService({ ...validation.data, userId });

        return res.status(201).json({
            success: true,
            message: "Transaction added successfully",
        });

    } catch (error) {
        next(error);
    }
};

export const deleteTransaction = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Unauthorized",
            });
        }

        const validation = deleteTransactionSchema.safeParse(req.params);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid transaction ID",
                errors: validation.error.flatten(),
            });
        }

        const deleted = await deleteTransactionService({
            id: validation.data.id,
            userId,
        });

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Transaction not found",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Transaction deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};