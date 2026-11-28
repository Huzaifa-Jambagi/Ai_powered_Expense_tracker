import * as repository from "./commitment.repository.js";

import type {
    CreateCommitmentInput,
    SettleCommitmentInput,
    UpdateCommitmentInput,
} from "./commitment.validation.js";

export const getCommitments = (userId: string) =>
    repository.getCommitments(userId);

export const getCommitmentById = (userId: string, commitmentId: string) =>
    repository.getCommitmentById(userId, commitmentId);

export const createCommitment = (userId: string, input: CreateCommitmentInput) =>
    repository.createCommitment(userId, input);

export const updateCommitment = (userId: string, commitmentId: string, input: UpdateCommitmentInput) =>
    repository.updateCommitment(userId, commitmentId, input);

export const settleCommitment = (userId: string, commitmentId: string, input: SettleCommitmentInput) =>
    repository.settleCommitment(userId, commitmentId, input);

export const deleteCommitment = (userId: string, commitmentId: string) =>
    repository.deleteCommitment(userId, commitmentId);