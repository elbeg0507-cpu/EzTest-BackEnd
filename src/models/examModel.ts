import { Schema, model, type Document } from "mongoose";

const ExamModelSchema = new Schema(
  {
    name: { type: String, required: true },
    questionNumber: { type: Number, required: true },
    answerNumber: { type: Number, required: true },
    modelResult: { type: Object, required: true },
    image: { type: Schema.Types.ObjectId, ref: "Image", required: true },
    studentImages: [
      {
        studentId: { type: String, required: true },
        imageId: { type: Schema.Types.ObjectId, ref: "Image", required: true },
        areaData: { type: Array, required: false },
      },
    ],
    areaData: { type: Array, required: true },
  },
  {
    timestamps: true,
  },
);

const ExamModel = model("ExamModel", ExamModelSchema);

export default ExamModel;
