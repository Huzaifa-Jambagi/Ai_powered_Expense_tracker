import { Router } from "express";
import * as commitmentController from "./commitment.controller.js";

const router = Router();

router.get("/", commitmentController.getCommitments);
router.get("/:commitmentId", commitmentController.getCommitmentById);
router.post("/", commitmentController.createCommitment);
router.patch("/:commitmentId", commitmentController.updateCommitment);
router.post("/:commitmentId/settle", commitmentController.settleCommitment);
router.delete("/:commitmentId", commitmentController.deleteCommitment);

export default router;
