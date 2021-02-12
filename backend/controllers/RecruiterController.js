import Properties from "../properties";
import RecruiterModel from "../models/RecruiterModel";
import ErrorManager from "../classes/ErrorManager";
import { authorize } from "../security/SecurityManager";
import SecurityController from "./SecurityController";

const recruiterController = {
  /**
   * Init routes
   */
  init: (router) => {
    const baseUrl = `${Properties.api}/recruiter`;
    router.post(baseUrl + "/signup", recruiterController.create);
    router.get(
      baseUrl + "/:id",
      authorize(["RECRUITER", "CANDIDATE"]),
      recruiterController.get
    );
    router.get(baseUrl + "", authorize([]), recruiterController.list);
    router.post(
      baseUrl + "/:id",
      authorize(["RECRUITER"]),
      recruiterController.update
    );
  },

  // CRUD METHODS

  /**
   * RecruiterModel.create
   *   @description CRUD ACTION create
   *
   */
  create: async (req, res) => {
    try {
      const result = await RecruiterModel.create(req.body);
      result.role = "RECRUITER";
      const response = SecurityController.issueToken(result);
      res.json({ ...result, token: response });
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },
  
  /**
   * RecruiterModel.get
   *   @description CRUD ACTION get
   *   @param ObjectId id Id resource
   *
   */
  get: async (req, res) => {
    try {
      const result = await RecruiterModel.get(req.params.id);
      res.json(result);
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  /**
   * RecruiterModel.list
   *   @description CRUD ACTION list
   *
   */
  list: async (req, res) => {
    try {
      const result = await RecruiterModel.list();
      res.json(result);
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },
  /**
   * RecruiterModel.update
   *   @description CRUD ACTION update
   *   @param ObjectId id Id
   *
   */
  update: async (req, res) => {
    try {
      if (req.user._id == req.params.id) {
        const result = await RecruiterModel.update(req.body);
        res.json(result);
      } else res.status(401).send();
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },
};

export default recruiterController;
