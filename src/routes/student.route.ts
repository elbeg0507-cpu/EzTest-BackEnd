import express from "express";
const router = express.Router();

import studentController from "@/controllers/student.controller";

router.post("/create", studentController.create);
router.post("/getAll", studentController.getAll);

export default router;
