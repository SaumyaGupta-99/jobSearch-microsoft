// Express
import express from "express";
import http from "http";
import bodyParser from "body-parser";

// Logging
import Logger from "./Logger";
import { exitLog } from "erel";

// Properties
import properties from "../properties.js";

// Security
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";

// Controllers

// Database
import Database from "./Database.js";

// Controllers
import SecurityController from "../controllers/SecurityController";
import CandidateController from "../controllers/CandidateController";
import RecruiterController from "../controllers/RecruiterController";
import JobController from "../controllers/JobController";
dotenv.config();
// End Import Controllers

class Server {
  constructor() {
    this.app = express();
  }

  /**
   * Start the server
   * @returns {Promise<void>}
   */
  async init() {
    Logger.info("Starting Job Search application");

    // Start Init Database
    Database.init();
    // End Init Database

    // Configure logger
    exitLog.setLogger(Logger.exitMiddleware);

    // Add parser
    this.app.use(bodyParser.json({ limit: "10mb" }));
    this.app.use(bodyParser.urlencoded({ extended: true, limit: "10mb" }));
    this.app.use(exitLog.middleware);
    this.app.use(Logger.expressMiddleware);

    // Securitiy
    this.app.use(helmet());
    this.app.use(cors());

    // Start App Server
    const server = http.Server(this.app);

    await server.listen(properties.port);
    Logger.info("Server started on port " + properties.port);

    // Import controllers
    const router = express.Router();
    SecurityController.init(router);

    // Start Init Controllers
    CandidateController.init(router);
    RecruiterController.init(router);
    JobController.init(router);
    // End Init Controllers

    this.app.use("/", router);
  }
}

export default new Server();
