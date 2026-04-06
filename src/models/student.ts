import { Schema, model, type Document } from "mongoose";

const StudentSchema = new Schema(
  {
    name: { type: String, required: true },
    examResult: [
      { type: Schema.Types.ObjectId, ref: "ExamResult", required: true },
    ],
    class: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const StudentModel = model("Student", StudentSchema);

export default StudentModel;
