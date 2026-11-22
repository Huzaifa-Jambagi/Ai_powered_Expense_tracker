import { and,eq } from "drizzle-orm";
import { db } from "../db/db.js";
import { accounts } from "../db/schema/accounts.js";
import { users } from "../db/schema/users.js";
import type { CreateAccountInput } from "./accounts.validation.js";
import type { UpdateAccountInput } from "./accounts.validation.js";

export const getAccounts = async (clerkId: string) => {
    return db.
    select().
    from(accounts).
    where(eq(accounts.user_id, clerkId));
};

export const createAccount = async (clerkId: string, input: CreateAccountInput) => {
    const [account] = await db.insert(accounts).values({
        user_id: clerkId,
        name: input.name,
        type: input.type,
        balance: input.opening_balance,
    }).returning();

    return account;
};

export const updateAccount = async (clerkId: string, accountId: string, input: UpdateAccountInput) => {
    const [account] = await db.update(accounts)
        .set(input)
        .where(and(eq(accounts.id, accountId), eq(accounts.user_id, clerkId)))
        .returning();

    return account;
};

export const deleteAccount = async (clerkId: string, accountId: string) => {
    return db.transaction(async tx => {
        const [user] = await tx
            .select({ id: users.id })
            .from(users)
            .where(eq(users.clerk_id, clerkId))
            .for("update");

        if (!user) return { status: "not_found" as const };

        const userAccounts = await tx
            .select({ id: accounts.id })
            .from(accounts)
            .where(eq(accounts.user_id, clerkId));

        if (!userAccounts.some(account => account.id === accountId)) {
            return { status: "not_found" as const };
        }

        if (userAccounts.length === 1) {
            return { status: "last_account" as const };
        }

        const [deletedAccount] = await tx
            .delete(accounts)
            .where(and(eq(accounts.id, accountId), eq(accounts.user_id, clerkId)))
            .returning({ id: accounts.id });

        return deletedAccount
            ? { status: "deleted" as const, account: deletedAccount }
            : { status: "not_found" as const };
    });
};