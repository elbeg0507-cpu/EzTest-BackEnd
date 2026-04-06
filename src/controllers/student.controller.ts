import type { Request, Response, NextFunction } from "express";
import StudentModel from "@/models/student";

async function create(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { name, cls } = request.body;
    const student = await StudentModel.create({
      name,
      class: cls,
      examResult: [],
    });
    return response.status(200).json(student);
  } catch (error) {
    console.error(error);
    next(error);
    return response.status(500).json({ message: "Internal Server Error" });
  }
}

async function getAll(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const students = await StudentModel.find().lean();
    return response.status(200).json(students);
  } catch (error) {
    console.error(error);
    next(error);
    return response.status(500).json({ message: "Internal Server Error" });
  }
}

export default {
  create,
  getAll,
};
