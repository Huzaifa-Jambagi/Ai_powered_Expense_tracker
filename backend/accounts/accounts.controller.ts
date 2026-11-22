import type { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as accountService from "./accounts.service.js";
import { createAccountSchema } from "./accounts.validation.js";
import { accountIdSchema, updateAccountSchema } from "./accounts.validation.js";

export const getAccounts = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    try {
        const accounts = await accountService.getAccounts(userId);

        return res.status(200).json({
            success: true,
            data: accounts,
            message: "Accounts fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching accounts:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const createAccount = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({
            success: false,
            message: "Unauthorized",
        });
    }

    const result = createAccountSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid account details",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        const account = await accountService.createAccount(userId, result.data);

        return res.status(201).json({
            success: true,
            data: account,
            message: "Account created successfully",
        });
    } catch (error) {
        console.error("Error creating account:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};

export const updateAccount = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const accountId = accountIdSchema.safeParse(req.params.accountId);

    if (!accountId.success) {
        return res.status(400).json({ success: false, message: "Invalid account ID" });
    }

    const result = updateAccountSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid account details",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        const account = await accountService.updateAccount(userId, accountId.data, result.data);

        if (!account) {
            return res.status(404).json({ success: false, message: "Account not found" });
        }

        return res.status(200).json({
            success: true,
            data: account,
            message: "Account updated successfully",
        });
    } catch (error) {
        console.error("Error updating account:", error);

        return res.status(500).json({ success: false, message: "Internal server error" });
    }
};

export const deleteAccount = async (req: Request, res: Response) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const accountId = accountIdSchema.safeParse(req.params.accountId);

    if (!accountId.success) {
        return res.status(400).json({ success: false, message: "Invalid account ID" });
    }

    try {
        const result = await accountService.deleteAccount(userId, accountId.data);

        if (result.status === "not_found") {
            return res.status(404).json({
                success: false,
                message: "Account not found",
            });
        }

        if (result.status === "last_account") {
            return res.status(409).json({
                success: false,
                message: "You must have at least one account. Add another account before deleting this one.",
            });
        }

        return res.status(200).json({
            success: true,
            data: result.account,
            message: "Account and its associated transactions deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting account:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};