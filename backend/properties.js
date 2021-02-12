import dotenv from "dotenv";
dotenv.config();
export default {
  dbUrl: (process.env.DB_HOST || "localhost") + ":27017/job-search",
  port: process.env.NODE_PORT || 3000,
  tokenSecret: process.env.TOKEN_SECRET || "dfu%6r3oi903#5",
  api: "/api",
  affindaToken: process.env.AFFINDA_TOKEN,
};
