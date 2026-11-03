import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as accountService from "./accounts.service.js";

export const getAccounts = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);

    const accounts = await accountService.getAccounts(userId!);

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