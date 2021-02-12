import Properties from "../properties";
import CandidateModel from "../models/CandidateModel";
import ErrorManager from "../classes/ErrorManager";
import { authorize } from "../security/SecurityManager";
import SecurityController from "./SecurityController";
import multer from "multer";
import path from "path";
import resumeParser from "../connector/resume-parser";
import Logger from "../classes/Logger";
const storage = multer.diskStorage({
  destination: (req, res, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const datetimestamp = Date.now();
    cb(
      null,
      file.fieldname +
        "-" +
        datetimestamp +
        "." +
        file.originalname.split(".")[file.originalname.split(".").length - 1]
    );
  },
});
const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    var ext = path.extname(file.originalname);
    if (ext !== ".pdf") {
      return cb(new Error("Only pdf files are allowed"));
    }
    cb(null, true);
  },
});

const candidateController = {
  /**
   * Init routes
   */
  init: (router) => {
    const baseUrl = `${Properties.api}/candidate`;
    router.post(
      baseUrl + "/signup",
      upload.single("resume"),
      candidateController.create
    );
    router.get(
      baseUrl + "/:id",
      authorize(["RECRUITER", "CANDIDATE"]),
      candidateController.get
    );
    router.get(baseUrl + "", authorize([]), candidateController.list);
    router.post(
      baseUrl + "/:id",
      authorize(["CANDIDATE"]),
      candidateController.update
    );
  },

  // CRUD METHODS

  /**
   * CandidateModel.create
   *   @description CRUD ACTION create
   *
   */
  create: async (req, res) => {
    try {
      req.body.resume = req.file.filename;
      const result = await CandidateModel.create(req.body);
      result.role = "CANDIDATE";
      const response = SecurityController.issueToken(result);
      candidateController.processResume(req.file.filename, result._id);
      res.json({ ...result, token: response });
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  /**
   * CandidateModel.get
   *   @description CRUD ACTION get
   *   @param ObjectId id Id resource
   *
   */
  get: async (req, res) => {
    try {
      const result = await CandidateModel.get(req.params.id);
      res.json(result);
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  /**
   * CandidateModel.list
   *   @description CRUD ACTION list
   *
   */
  list: async (req, res) => {
    try {
      const result = await CandidateModel.list();
      res.json(result);
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  /**
   * CandidateModel.update
   *   @description CRUD ACTION update
   *   @param ObjectId id Id
   *
   */
  update: async (req, res) => {
    try {
      if (req.user._id == req.params.id) {
        const result = await CandidateModel.update(req.body);
        res.json(result);
      } else res.status(401).send();
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  processResume: async (filename, _id) => {
    try {
      Logger.debug("Uploading Resume");
      const { data } = await resumeParser.uploadFile(filename);
      console.log(data);
      const { identifier } = data;
      let t = setInterval(async () => {
        Logger.debug("Trying to get summary");
        const { data: resumeData } = await resumeParser.getSummary(identifier);
        if (resumeData.meta.ready) {
          clearInterval(t);
          Logger.debug("Resume parsed");
          await CandidateModel.setKeywords(_id, resumeData);
        }
      }, 2000);
    } catch (err) {
      console.log(err);
    }
  },
};

export default candidateController;
