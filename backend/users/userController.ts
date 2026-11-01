import { Request, Response } from "express";
import * as userService from "./userService.js"
import { getAuth } from '@clerk/express'


export const getUserDetails = async (req: Request, res: Response) => {
    try {
        const { userId } = getAuth(req);

        if (!userId) {
            return res.status(401).json({
                success: false,
                message: "Invalid/No clerk id"
            })
        }

        const response =await userService.getUserDetails(userId)

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