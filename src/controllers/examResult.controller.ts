import type { Request, Response, NextFunction } from "express";
import ExamResultModel from "@/models/examResult";
import ExamModel from "@/models/examModel";
import axios from "axios";
import ImageModel from "@/models/image";
import StudentModel from "@/models/student";

function cleanBase64(dataUrl: string) {
  return dataUrl.replace(/^data:image\/\w+;base64,/, '');
}

async function upload(req: Request, res: Response, next: NextFunction) {
  try {
    const { examModelId, images } = req.body;
    // console.log("Received:", req.body);
    const examModel = await ExamModel.findById(examModelId);
    if (!examModel) {
      return res.status(404).json({ message: "Exam model not found" });
    }
    const findedImage = await ImageModel.findById(examModel.image).lean();
    if (!findedImage) {
      return res.status(404).json({ message: "Base image not found" });
    }
    const baseImage = findedImage.image
    const result = await Promise.all(images.map(async (image: string) => {
      try {
        const response = await axios.post("http://localhost:5000/", {
          baseImage: baseImage,
          editedImage: image,
        });
        return {
          ...response.data,
          rawImage: image
        };
      } catch (error) {
        console.error("Error fetching data:", error);
        return null;
      }
    }));

    const filteredResult = result.filter((item) => item.qr);
    const finalResult = filteredResult.map((item) => {
      const qrData = item.qr;
      const boxes = item.boxes;
      const answers = examModel.areaData.filter((area: {
        question: number;
        answer: number;
        x: number;
        y: number;
        w: number;
        h: number;
      }) => {
        return boxes.some((box: {
          x: number;
          y: number;
          width: number;
          height: number;
        }) => {
          const boxX1 = box.x;
          const boxY1 = box.y;
          const boxX2 = box.x + box.width;
          const boxY2 = box.y + box.height;

          const areaX1 = area.x;
          const areaY1 = area.y;
          const areaX2 = area.x + area.w;
          const areaY2 = area.y + area.h;
          
          return areaX1 < boxX1 && boxX2 < areaX2 && areaY1 < boxY1 && boxY2 < areaY2;
        });
      });
      return {
        qrData,
        answers,
        rawImage: item.rawImage,
      };
    });

    const analysisResults = finalResult.map((result) => {
      const analysis = result.answers.reduce((acc: any, answer: any) => {
        if (!acc[answer.question - 1]) {
          acc[answer.question - 1] = answer.answer;
        }
        acc[answer.question - 1] = answer.answer;
        return acc;
      }, [])
      return { studentId: result.qrData, analysis, rawImage: result.rawImage };
    })
    console.log("Analysis Results:", analysisResults?.[0]?.analysis);

    await Promise.all(analysisResults.map(async (analysisResult) => {
      const student = await StudentModel.findById(analysisResult.studentId);
      if (!student) {
        console.warn(`Student with ID ${analysisResult.studentId} not found. Skipping exam result creation.`);
        return;
      }
      const examResult = new ExamResultModel({
        examModel: examModel._id,
        student: student._id,
        analysis: analysisResult.analysis,
        image: await ImageModel.create({ image: analysisResult.rawImage }),
      });
      await examResult.save();
    }));
    // const savedExamResult = await examResult.save();
    res.status(200).json({ message: "Exam results uploaded successfully", examModelId: examModel._id });
  } catch (error) {
    next(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const { examModelId } = req.body;
    const examResults = await ExamResultModel.find({ examModel: examModelId }).populate("student");
    res.status(200).json(examResults);
  } catch (error) {
    next(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
}

export default {
  upload,
  getAll,
};
