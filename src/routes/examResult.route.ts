import express from "express";
const router = express.Router();

import examResultController from "@/controllers/examResult.controller";

router.post("/upload", examResultController.upload);
router.post("/getAll", examResultController.getAll);

export default router;
