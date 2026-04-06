import express from "express";
const router = express.Router();

import studentRoute from "./student.route";
import examModelRoute from "./examModel.route";
import examResultRoute from "./examResult.route";

router.use("/student", studentRoute);
router.use("/examModel", examModelRoute);
router.use("/examResult", examResultRoute);

export default router;
