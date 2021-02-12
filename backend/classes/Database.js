// Import Mongoose
import mongoose from "mongoose";
// Logging
import Logger from "./Logger";
// Properties
import properties from "../properties.js";

// Start Import Models

import JobModel from "../models/JobModel";
import CandidateModel from "../models/CandidateModel";
import RecruiterModel from "../models/RecruiterModel";
import ApplicationModel from "../models/ApplicationModel";

// End Import Models

class Database {
  constructor() {}

  /**
   * Init database
   */
  async init() {
    await this.authenticate();
    Logger.info("MongoDB connected at: " + properties.dbUrl);

    // Start Init Models

    JobModel.init();
    CandidateModel.init();
    RecruiterModel.init();
    ApplicationModel.init();
    // End Init Models
  }

  /**
   * Start database connection
   */
  async authenticate() {
    Logger.info("Authenticating to the databases...");
    try {
      this.dbConnection = await mongoose.connect(
        "mongodb://" + properties.dbUrl,
        {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          useCreateIndex: true,
          useFindAndModify: false,
        }
      );
    } catch (err) {
      Logger.error(`Failed connection to the DB: ${err.message}`);
      Logger.error(err);
      await new Promise((resolve) => setTimeout(resolve, 5000));
      await this.authenticate();
    }
  }

  /**
   * Get connection db
   */
  getConnection() {
    return this.dbConnection;
  }
}

export default new Database();
