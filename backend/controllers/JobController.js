import Properties from "../properties";
import JobModel from "../models/JobModel";
import ErrorManager from "../classes/ErrorManager";
import { authorize } from "../security/SecurityManager";
import SecurityController from "./SecurityController";
import RecruiterModel from "../models/RecruiterModel";
import ApplicationModel from "../models/ApplicationModel";

const jobController = {
  /**
   * Init routes
   */
  init: (router) => {
    const baseUrl = `${Properties.api}/job`;
    router.post(baseUrl, authorize(["RECRUITER"]), jobController.create);

    router.get(
      baseUrl + "",
      authorize(["CANDIDATE", "RECRUITER"]),
      jobController.list
    );
    router.get(
      baseUrl + "/me",
      authorize(["CANDIDATE"]),
      jobController.getAppliedJobs
    );
    router.get(
      baseUrl + "/filter",
      authorize(["CANDIDATE"]),
      jobController.filterByRecruiter
    );
    router.post(
      baseUrl + "/search",
      authorize(["CANDIDATE"]),
      jobController.search
    );
    router.get(
      baseUrl + "/:id",
      authorize(["RECRUITER", "CANDIDATE"]),
      jobController.get
    );
    router.post(
      baseUrl + "/:id",
      authorize(["RECRUITER"]),
      jobController.update
    );
    router.post(
      baseUrl + "/:id/apply",
      authorize(["CANDIDATE"]),
      jobController.apply
    );
    router.get(
      baseUrl + "/:id/candidates",
      authorize(["RECRUITER"]),
      jobController.getAppliedCandidates
    );
  },

  // CRUD METHODS

  /**
   * JobModel.create
   *   @description CRUD ACTION create
   *
   */
  create: async (req, res) => {
    try {
      const result = await JobModel.create(req.body);
      const { _id } = result;
      await RecruiterModel.addJob(_id, req.user._id);
      res.json(result);
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  /**
   * JobModel.get
   *   @description CRUD ACTION get
   *   @param ObjectId id Id resource
   *
   */
  get: async (req, res) => {
    try {
      const result = await JobModel.get(req.params.id);
      res.json(result);
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  /**
   * JobModel.list
   *   @description CRUD ACTION list
   *
   */
  list: async (req, res) => {
    try {
      if (req.user.role === "RECRUITER") {
        // Show only jobs posted by recruiter
        const recruiterId = req.user._id;
        const result = await RecruiterModel.getJobsPosted(recruiterId);
        res.json((result && result.jobsPosted) || []);
      } else {
        const result = await JobModel.list({});
        res.json(result);
      }
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  /**
   * JobModel.update
   *   @description CRUD ACTION update
   *   @param ObjectId id Id
   *
   */
  update: async (req, res) => {
    try {
      const result = await JobModel.update(req.body);
      res.json(result);
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  apply: async (req, res) => {
    try {
      const jobID = req.params.id;
      const application = await ApplicationModel.create({
        jobID,
        candidateID: req.user._id,
      });
      return res.json({ status: true, id: application._id });
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  filterByRecruiter: async (req, res) => {
    try {
      const recruiter = req.query.recruiterid;
      const data = await RecruiterModel.getJobsPosted(recruiter);
      res.json(data);
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  search: async (req, res) => {
    try {
      const jobs = await JobModel.search(req.body);
      res.json(jobs);
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  getAppliedJobs: async (req, res) => {
    try {
      const data = await ApplicationModel.getAppliedJobs(req.user._id);
      res.json(data);
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },

  getAppliedCandidates: async (req, res) => {
    try {
      const jobId = req.params.id;
      /** @type {{jobsPosted: Array<String>}} */
      const ownsJob = await RecruiterModel.checkOwnsJob(req.user._id, jobId);
      if (ownsJob) {
        const data = await ApplicationModel.getCandidates(jobId);
        const { tags } = await JobModel.getTags(jobId);
        const sortedData = jobController._sortCandidates(data, tags);
        res.json(sortedData);
      } else res.status(401).send();
    } catch (err) {
      const safeErr = ErrorManager.getSafeError(err);
      res.status(safeErr.status).json(safeErr);
    }
  },
  /**
   * @param {Array} data
   * @param {Array<string>} requiredTags
   */
  _sortCandidates: (data, requiredTags) => {
    let tagSet = [];
    let i=0;
    requiredTags.forEach((tag) => {
      let tags=tag.split(",");
      tags.forEach((t)=>{
       tagSet[i++]=t;
      });
    });
    data = data.map((applicant) => {
      let { candidate } = applicant;
      let matched = 0;
      candidate.jobKeywords.forEach((keyword) => {
        if (tagSet.includes(keyword)) matched = matched + 1;
      });
      applicant.matched = matched;
      return applicant;
    });
    let sortedData = data.sort((d1, d2) => d2.matched - d1.matched);
    return sortedData;
  },
};

export default jobController;
