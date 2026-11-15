import * as Sentry from "@sentry/node";
import type { Request, Response, NextFunction } from "express";

export const errorHandler = (
    error: Error & { statusCode?: number },
    req: Request,
    res: Response,
    next: NextFunction
) => {
    const statusCode = error.statusCode ?? 500;

    if (statusCode >= 500) {
        Sentry.captureException(error);
    }

    if (res.headersSent) {
        return next(error);
    }

    return res.status(statusCode).json({
        success: false,
        message: statusCode >= 500 ? "Internal server error" : error.message,
    });
};