import { api } from "./api";
import type { CategoryKey } from "../constants/catogories";

export type Commitment = {
    id: string;
    user_id: string;
    name: string;
    counterparty: string | null;
    type: "PAY" | "RECEIVE";
    amount: string;
    settled_amount: string;
    notes: string | null;
    created_at: string;
    updated_at: string;
    remaining_amount: string;
    settlement_status: "PENDING" | "PARTIAL" | "SETTLED";
};

export type CommitmentTransaction = {
    id: string;
    user_id: string;
    account_id: string;
    commitment_id: string | null;
    type: "INCOME" | "EXPENSE";
    amount: string;
    category: string;
    description: string | null;
    date: string;
    status: string;
    input_method: string;
    voice_transcript: string | null;
    is_flagged: boolean;
    flag_reason: string | null;
    created_at: string;
    updated_at: string;
};

export type CommitmentSummary = {
    toPay: {
        amount: string;
        count: number;
    };
    toReceive: {
        amount: string;
        count: number;
    };
};

export type CommitmentDetails = Commitment & {
    transactions: CommitmentTransaction[];
};

export type CreateCommitmentInput = {
    name: string;
    counterparty?: string | null;
    type: "PAY" | "RECEIVE";
    amount: string | number;
    notes?: string | null;
};

export type UpdateCommitmentInput = {
    name?: string;
    counterparty?: string | null;
    amount?: string | number;
    notes?: string | null;
};

export type SettleCommitmentInput = {
    accountId: string;
    amount: string | number;
    category: CategoryKey;
};

export type ApiResponse<T> = {
    success: boolean;
    data: T;
    message: string;
};

export type GetCommitmentsResponse = ApiResponse<{
    commitments: Commitment[];
    summary: CommitmentSummary;
}>;

export type GetCommitmentResponse = ApiResponse<CommitmentDetails>;

export type CreateCommitmentResponse = ApiResponse<Commitment>;

export type UpdateCommitmentResponse = ApiResponse<Commitment>;

export type SettleCommitmentResponse = ApiResponse<{
    commitment: Commitment;
    transaction: CommitmentTransaction;
}>;

export type DeleteCommitmentResponse = {
    success: boolean;
    message: string;
};

export const getCommitments = async (): Promise<GetCommitmentsResponse> => {
    const response = await api.get("/api/v1/commitments");
    return response.data;
};

export const getCommitmentById = async (commitmentId: string): Promise<GetCommitmentResponse> => {
    const response = await api.get(`/api/v1/commitments/${commitmentId}`);
    return response.data;
};

export const createCommitment = async (data: CreateCommitmentInput): Promise<CreateCommitmentResponse> => {
    const response = await api.post("/api/v1/commitments", data);
    return response.data;
};

export const updateCommitment = async (commitmentId: string, data: UpdateCommitmentInput): Promise<UpdateCommitmentResponse> => {
    const response = await api.patch(`/api/v1/commitments/${commitmentId}`, data);
    return response.data;
};

export const settleCommitment = async (commitmentId: string, data: SettleCommitmentInput): Promise<SettleCommitmentResponse> => {
    const response = await api.post(`/api/v1/commitments/${commitmentId}/settle`, data);
    return response.data;
};

export const deleteCommitment = async (commitmentId: string): Promise<DeleteCommitmentResponse> => {
    const response = await api.delete(`/api/v1/commitments/${commitmentId}`);
    return response.data;
};
