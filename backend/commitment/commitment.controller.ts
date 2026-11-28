import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import * as commitmentService from "./commitment.service.js";
import {
    commitmentIdSchema,
    createCommitmentSchema,
    updateCommitmentSchema,
    settleCommitmentSchema,
} from "./commitment.validation.js";

export const getCommitments = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    try {
        const data = await commitmentService.getCommitments(userId);

        return res.status(200).json({
            success: true,
            data,
            message: "Commitments fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching commitments:", error);
        return next(error);
    }
};

export const getCommitmentById = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const commitmentId = commitmentIdSchema.safeParse(req.params.commitmentId);

    if (!commitmentId.success) {
        return res.status(400).json({ success: false, message: "Invalid commitment ID" });
    }

    try {
        const commitment = await commitmentService.getCommitmentById(userId, commitmentId.data);

        return res.status(200).json({
            success: true,
            data: commitment,
            message: "Commitment fetched successfully",
        });
    } catch (error) {
        console.error("Error fetching commitment:", error);
        return next(error);
    }
};

export const createCommitment = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const result = createCommitmentSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid commitment details",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        const commitment = await commitmentService.createCommitment(userId, result.data);

        return res.status(201).json({
            success: true,
            data: commitment,
            message: "Commitment created successfully",
        });
    } catch (error) {
        console.error("Error creating commitment:", error);
        return next(error);
    }
};

export const updateCommitment = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const commitmentId = commitmentIdSchema.safeParse(req.params.commitmentId);

    if (!commitmentId.success) {
        return res.status(400).json({ success: false, message: "Invalid commitment ID" });
    }

    const result = updateCommitmentSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid commitment details",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        const commitment = await commitmentService.updateCommitment(userId, commitmentId.data, result.data);

        return res.status(200).json({
            success: true,
            data: commitment,
            message: "Commitment updated successfully",
        });
    } catch (error) {
        console.error("Error updating commitment:", error);
        return next(error);
    }
};

export const settleCommitment = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const commitmentId = commitmentIdSchema.safeParse(req.params.commitmentId);

    if (!commitmentId.success) {
        return res.status(400).json({ success: false, message: "Invalid commitment ID" });
    }

    const result = settleCommitmentSchema.safeParse(req.body);

    if (!result.success) {
        return res.status(400).json({
            success: false,
            message: "Invalid settlement details",
            errors: result.error.flatten().fieldErrors,
        });
    }

    try {
        const settlement = await commitmentService.settleCommitment(userId, commitmentId.data, result.data);

        return res.status(201).json({
            success: true,
            data: settlement,
            message: "Commitment settled successfully",
        });
    } catch (error) {
        console.error("Error settling commitment:", error);
        return next(error);
    }
};

export const deleteCommitment = async (req: Request, res: Response, next: NextFunction) => {
    const { userId } = getAuth(req);

    if (!userId) {
        return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const commitmentId = commitmentIdSchema.safeParse(req.params.commitmentId);

    if (!commitmentId.success) {
        return res.status(400).json({ success: false, message: "Invalid commitment ID" });
    }

    try {
        await commitmentService.deleteCommitment(userId, commitmentId.data);

        return res.status(200).json({
            success: true,
            message: "Commitment deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting commitment:", error);
        return next(error);
    }
};
