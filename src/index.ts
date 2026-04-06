import express from "./services/express";
import mongoose from "./services/mongoose";

express.start();
mongoose.connect();

export default express;
