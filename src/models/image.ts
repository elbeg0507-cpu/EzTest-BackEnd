import { Schema, model, type Document } from "mongoose";

const ImageSchema = new Schema(
  {
    image: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

const ImageModel = model("Image", ImageSchema);

export default ImageModel;
