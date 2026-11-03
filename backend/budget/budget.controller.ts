import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import { z } from "zod";
import * as budgetService from "./budget.service.js";
import { setBudgetSchema } from "./budget.validation.js";

export const getBudget = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const budget = await budgetService.getBudget(userId!);

        return res.status(200).json({
            success: true,
            data: budget,
            message: "Budget fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching budget:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const setBudget = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);
        const { amount } = setBudgetSchema.parse(req.body);

        const budget = await budgetService.setBudget(userId!, amount);

        return res.status(200).json({
            success: true,
            data: budget,
            message: "Budget saved successfully",
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return res.status(400).json({ success: false, message: "Invalid budget amount", errors: error.issues });
        }

        console.error("Error setting budget:", error);
        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};