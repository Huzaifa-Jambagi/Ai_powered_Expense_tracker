import { Request, Response } from "express";
import { getAuth } from "@clerk/express";
import * as transactionService from "./transaction.service.js";

export const getTransactions = async (req: Request, res: Response) => {
  try {
    const { userId } = getAuth(req);
    const { type, accountId } = req.query;

    const transactions = await transactionService.getTransactions(
      userId!,
      type as "INCOME" | "EXPENSE" | undefined,
      accountId as string | undefined
    );

    return res.status(200).json({
      success: true,
      data: transactions,
      message: "Transactions fetched successfully",
    });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};