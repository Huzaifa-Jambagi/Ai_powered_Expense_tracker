import { Request, Response } from "express";
import * as userService from "./userService.js"
import { getAuth } from '@clerk/express'
import { onboardingSchema, updateCurrencySchema } from "./userValidation.js";

export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);


        const response = await userService.getUserDetails(userId!)

        if (response == null) return res.status(404).json({
            success: false,
            message: "No user found"
        })

        return res.status(200).json({
            success: true,
            data: response,
            message: "User fetched successfully"
        })

    } catch (error) {
        console.error("Error fetching user:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
}

export const completeOnboarding = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    const validation = onboardingSchema.safeParse(req.body);

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        message: "Invalid onboarding parameters",
        errors: validation.error.flatten().fieldErrors,
      });
    }

    const { startingBalance, currency } = validation.data;

    const response = await userService.completeOnboarding(userId!, startingBalance, currency);

    return res.status(200).json({
      success: true,
      data: response,
      message: "Onboarding completed successfully",
    });
  } catch (error) {
    console.error("Error completing onboarding:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const updateCurrency = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        const validation = updateCurrencySchema.safeParse(req.body);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: "Invalid currency",
                errors: validation.error.flatten().fieldErrors,
            });
        }

        const user = await userService.updateCurrency(userId!, validation.data.currency);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        return res.status(200).json({
            success: true,
            data: user,
            message: "Currency updated successfully",
        });
    } catch (error) {
        console.error("Error updating currency:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error",
        });
    }
};