import type { Request, Response, NextFunction } from "express";
import ExamModel from "@/models/examModel";
import { createCanvas } from "canvas";
import QRCode from "qrcode";
import StudentModel from "@/models/student";
import ImageModel from "@/models/image";

function generateImage(
  questionNumber: number,
  answerNumber: number,
  qrData: string,
  student: string,
  examName: string = "exam",
) {
  const canvas = createCanvas(2480, 3508);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 2480, 3508);

  const corner = createCanvas(200, 200);
  const cornerCtx = corner.getContext("2d");
  cornerCtx.fillStyle = "black";
  cornerCtx.fillRect(0, 0, 200, 200);
  cornerCtx.fillStyle = "white";
  cornerCtx.fillRect(50, 50, 100, 100);
  ctx.drawImage(corner, 0, 0);
  ctx.drawImage(corner, 2280, 0);
  ctx.drawImage(corner, 0, 3308);
  ctx.drawImage(corner, 2280, 3308);

  if (qrData) {
    const qrImage = createCanvas(500, 500);
    const qrCtx = qrImage.getContext("2d");
    qrCtx.fillStyle = "black";
    qrCtx.fillRect(0, 0, 500, 500);
    
    QRCode.toCanvas(qrImage, qrData, { width: 500 }, (error) => {
      if (error) console.error(error);
    });
    ctx.drawImage(qrImage, 200, 0);
  }

  if (student) {
    ctx.font = "100px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(student, 800, 400);
  }
  if (examName) {
    ctx.font = "100px Arial";
    ctx.fillStyle = "black";
    ctx.fillText(examName, 800, 200);
  }

  const answerBox = { x: 200, y: 500, width: 2080, height: 2808 };
  const answerArea = createCanvas(answerBox.width, answerBox.height);
  const answerCtx = answerArea.getContext("2d");
  answerCtx.fillStyle = "white";
  answerCtx.fillRect(0, 0, answerBox.width, answerBox.height);

  const areaData = [];
  for (let i = 0; i < questionNumber; i++) {
    const y = 150 + i * 250;
    for (let j = 0; j < answerNumber; j++) {
      const x = 150 + j * 400;
      answerCtx.beginPath();
      answerCtx.ellipse(50 + x, y, 135, 80, 0, 0, Math.PI * 2);
      answerCtx.strokeStyle = "black";
      answerCtx.lineWidth = 25;
      answerCtx.stroke();
      areaData.push({
        question: i + 1,
        answer: j + 1,
        x: 200 + 50 + x - 295 / 2,
        y: 500 + y - 185 / 2,
        w: 295,
        h: 185,
      });
    }
  }

  ctx.drawImage(answerArea, answerBox.x, answerBox.y);
  //debug
  // for (const { question, answer, x, y, w, h } of areaData) {
  //   ctx.rect(x, y, w, h);
  //   ctx.strokeStyle = "red";
  //   ctx.lineWidth = 5;
  //   ctx.stroke();
  //   ctx.font = "100px Arial";
  //   ctx.fillStyle = "green";
  //   ctx.fillText(`Q${question}A${answer}`, x + 10, y + 50);
  // }

  return {
    image: canvas.toBuffer("image/png").toString("base64"),
    areaData,
  };
}

async function create(
  request: Request,
  response: Response,
  next: NextFunction,
) {
  try {
    const { examName, questionNumber, answerNumber, modelResult, studentIds } =
      request.body;
    console.log(request.body);
    const students = await StudentModel.find({
      _id: { $in: studentIds },
    }).lean();

    const imagedStundents = await Promise.all(
      students.map(async (student) => {
        const imageData = generateImage(
          questionNumber,
          answerNumber,
          student._id.toString(),
          student.class + " " + student.name,
          examName,
        );
        const image = await ImageModel.create({
          image: imageData.image,
        });
        return {
          studentId: student._id.toString(),
          image: imageData.image,
          imageId: image._id.toString(),
          areaData: imageData.areaData,
        };
      }),
    );
    const imageData = generateImage(questionNumber, answerNumber, "", "", "");
    const image = await ImageModel.create({
      image: imageData.image,
    });
    const examModel = await ExamModel.create({
      name: examName,
      questionNumber,
      answerNumber,
      modelResult,
      image: image._id.toString(),
      studentImages: imagedStundents,
      areaData: imageData.areaData,
    });
    imagedStundents.push({
      studentId: "",
      image: imageData.image,
      imageId: image._id.toString(),
      areaData: imageData.areaData,
    });
    return response.status(200).json(imagedStundents);
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
    const examModels = await ExamModel.find().lean();
    return response.status(200).json(examModels);
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
