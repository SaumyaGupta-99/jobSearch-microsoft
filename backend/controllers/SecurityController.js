// Properties
import Properties from "../properties";

// Security
import jsonwebtoken from "jsonwebtoken";
import RecruiterModel from "../models/RecruiterModel";
import CandidateModel from "../models/CandidateModel";

// Errors
import ErrorManager from "../classes/ErrorManager";
import Errors from "../classes/Errors";

const securityControllers = {
  /**
   * Init routes
   */
  init: (router) => {
    const baseUrl = `${Properties.api}`;
    router.post(baseUrl + "/login", securityControllers.login);
    router.post(baseUrl + "/verifyToken", securityControllers.verifyToken);
  },

  /**
   * Login function
   *
   */
  login: async (req, res) => {
    try {
      /** @type {string} */
      let role = req.query.role;
      if (role !== "recruiter" && role !== "candidate")
        return res.status(400).json({ err: `Invalid role type ${role}` });
      // Get parameters from post request
      let params = req.body;
      let model = role === "recruiter" ? RecruiterModel : CandidateModel;
      let loginStatus = await model.login(params.email, params.password);
      if (loginStatus.status) {
        loginStatus.user.role = role.toUpperCase();
        let token = securityControllers.issueToken(loginStatus.user);
        loginStatus.user.token = token;
        res.send(loginStatus.user);
      } else {
        // Error login
        throw new Errors.INVALID_LOGIN();
      }
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  /**
   * Verify JWT Token function
   *
   */
  verifyToken: async (req, res) => {
    try {
      let token = req.body.token;
      if (token) {
        let decoded = null;
        try {
          decoded = jsonwebtoken.verify(token, Properties.tokenSecret);
        } catch (err) {
          return res.json({
            success: false,
            mesage: "Failed to authenticate token",
          });
        }

        res.json(decoded);
      } else {
        throw new Errors.NO_TOKEN();
      }
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(400).json(safeErr);
    }
  },

  issueToken: (user) => {
    return jsonwebtoken.sign(user, Properties.tokenSecret, {
      expiresIn: 26400, //1 day
    });
  },
};

export default securityControllers;
