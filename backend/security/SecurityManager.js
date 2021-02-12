// Dependencies
import jsonwebtoken from "jsonwebtoken";
import cors from "cors";
import helmet from "helmet";
// Properties
import properties from "../properties";
// Errors
import ErrorManager from "../classes/ErrorManager";
import Errors from "../classes/Errors";

/**
 * Middleware JWT
 * @param {string, array} roles Authorized role, null for all
 */
export const authorize = (roles = []) => {
  return [
    // Authenticate JWT token and attach user to request object (req.user)
    async (req, res, next) => {
      let token =
        req.headers.authorization &&
        req.headers.authorization.replace("Bearer ", "");

      if (!token) {
        const safeErr = ErrorManager.getSafeError(
          new Errors.INVALID_AUTH_HEADER()
        );
        res.status(safeErr.status).json(safeErr);
      } else {
        let decodedUser = null;
        try {
          decodedUser = jsonwebtoken.verify(token, properties.tokenSecret);
        } catch (err) {
          // Token not valid
          const safeErr = ErrorManager.getSafeError(new Errors.JWT_INVALID());
          return res.status(safeErr.status).json(safeErr);
        }

        if (decodedUser && hasRole(roles, decodedUser)) {
          req.user = decodedUser;
          next();
        } else {
          const safeErr = ErrorManager.getSafeError(new Errors.UNAUTHORIZED());
          res.status(safeErr.status).json(safeErr);
        }
      }
    },
  ];
};

export const initSecurity = (app) => {
  app.use(helmet());
  app.use(cors());
};

// ---------------- UTILS FUNCTIONS ---------------- //

/**
 * Check if user has role
 * @param {*} roles String or array of roles to check
 * @param {*} user Current logged user
 */
var hasRole = function (roles, user) {
  return (
    (user != undefined && roles.length === 0) ||
    (user != undefined && roles.indexOf(user.role) > -1)
  );
};
