import express from "express";
const router = express.Router();

import examModelController from "@/controllers/examModel.controller";

router.post("/create", examModelController.create);
router.post("/getAll", examModelController.getAll);

export default router;
