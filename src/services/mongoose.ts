import config from "@/config";
import mongoose from "mongoose";

mongoose.connection.on("connected", () => {
  console.log("MongoDB is connected");
});

mongoose.connection.on("error", (err) => {
  console.log(`Could not connect to MongoDB because of ${err}`);
  process.exit(-1);
});

if (config.dotenv.env === "dev") {
  mongoose.set("debug", true);
}

export default {
  connect() {
    const mongoURI =
      config.dotenv.env === "prod" || "dev" ? config.dotenv.mongo.uri : "";

    mongoose.connect(mongoURI || "", {
      dbName: config.dotenv.mongo.dbs.default || "Temp",
    });

    return mongoose.connection;
  },
};
