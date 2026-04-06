import express from "express";
import configs from "@/config";
import route from "@/routes";
import cors from "cors";

const app = express();

app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true, limit: "100mb" }));

app.use(express.json());

app.use(cors());
app.use("/api", route);

export default {
  start() {
    app.listen(configs.dotenv.port, (error: unknown) => {
      if (error) {
        console.log("Error : ", error);
        process.exit(-1);
      }
      console.log(configs.dotenv.app + " is running on " + configs.dotenv.port);
    });
  },
};
