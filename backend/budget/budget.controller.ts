import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as budgetService from "./budget.service.js";
import { getBudgetSchema, setBudgetSchema } from "./budget.validation.js";

export const getBudget = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        const result = getBudgetSchema.safeParse(req.params);

        if (!result.success || typeof req.params.month !== "string") {
            return res.status(400).json({
                success: false,
                message: result.success ? "Invalid month parameter" : result.error.issues[0].message,
            });
        }

        const timezone = req.headers["x-timezone"];

        if (typeof timezone !== "string") {
            return res.status(400).json({
                success: false,
                message: "Timezone header is required",
            });
        }

        try {
            new Intl.DateTimeFormat("en-US", { timeZone: timezone });
        } catch {
            return res.status(400).json({
                success: false,
                message: "Invalid timezone",
            });
        }

        const { month } = result.data;
        const budget = await budgetService.getBudget(userId!, month, timezone);

        return res.status(200).json({
            success: true,
            data: budget,
            message: "Budget fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching budget:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const setBudget = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        const result = setBudgetSchema.safeParse(req.body);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.error.issues[0].message,
            });
        }

        const { category, amount } = result.data;

        const budget = await budgetService.setBudget(userId!, category, amount);

        return res.status(200).json({
            success: true,
            data: budget,
            message: "Budget saved successfully",
        });
    } catch (error) {
        console.error("Error saving budget:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};