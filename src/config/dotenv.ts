import dotenv from "dotenv";

dotenv.config();

export default {
  port: process.env.PORT,
  app: process.env.APP,
  env: process.env.NODE_ENV,
  secret: process.env.APP_SECRET,
  mongo: {
    uri: process.env.MONGO_URI,
    dbs: {
      default: process.env.DEFAULT_DB,
    },
  },
};
