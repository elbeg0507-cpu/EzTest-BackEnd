import { Schema, model, type Document } from "mongoose";

const ExamResultSchema = new Schema(
  {
    analysis: { type: Object, required: false },
    examModel: {
      type: Schema.Types.ObjectId,
      ref: "ExamModel",
      required: true,
    },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    image: { type: Schema.Types.ObjectId, ref: "Image", required: false },
    baseimage: { type: Schema.Types.ObjectId, ref: "Image", required: false },
  },
  {
    timestamps: true,
  },
);

const ExamResultModel = model("ExamResult", ExamResultSchema);

export default ExamResultModel;
