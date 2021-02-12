import Database from "../classes/Database";
import mongoose from "mongoose";
import Logger from "../classes/Logger";

const ApplicationModel = {
  init() {
    const db = Database.getConnection();

    const applicationSchema = new mongoose.Schema({
      jobID: {
        type: mongoose.Schema.ObjectId,
        ref: "Job",
      },
      candidateID: {
        type: mongoose.Schema.ObjectId,
        ref: "Candidate",
      },
      status: {
        type: "String",
        enum: ["Submitted", "Accepted", "Rejected", "Under Review"],
        default: "Submitted",
      },
      dateSubmitted: {
        type: "String",
        default: Date.now(),
      },
    });
    applicationSchema.index({ candidateID: 1 });
    applicationSchema.index({ jobID: 1 });
    const Application = db.connection.model("Application", applicationSchema);
    ApplicationModel.setModel(Application);
    return applicationSchema;
  },

  setModel: (model) => {
    ApplicationModel.model = model;
  },

  getModel: () => {
    return ApplicationModel.model;
  },
  /**
   * ApplicationModel.create
   *   @description CRUD ACTION create
   *
   */
  async create(item) {
    const obj = new ApplicationModel.model(item);
    return await obj.save();
  },

  /**
   * ApplicationModel.delete
   *   @description CRUD ACTION delete
   *   @param ObjectId id Id
   *
   */
  async delete(id) {
    return await ApplicationModel.model.findByIdAndRemove(id);
  },

  /**
   * ApplicationModel.get
   *   @description CRUD ACTION get
   *   @param ObjectId id Id resource
   *
   */
  async get(id) {
    return await ApplicationModel.model.findOne({ _id: id }).lean();
  },

  /**
   * ApplicationModel.list
   *   @description CRUD ACTION list
   *
   */
  async list() {
    return await ApplicationModel.model.find().lean();
  },

  /**
   * ApplicationModel.update
   *   @description CRUD ACTION update
   *   @param ObjectId id Id
   *
   */
  async update(item) {
    delete item.password;

    return await ApplicationModel.model.findOneAndUpdate(
      { _id: item._id },
      item,
      {
        new: true,
        update: true,
      }
    );
  },

  async getAppliedJobs(candidateID) {
    return await ApplicationModel.model
      .find({ candidateID })
      .populate("jobID")
      .exec();
  },

  async getCandidates(jobID) {
    return await ApplicationModel.model.aggregate([
      {
        $match: {
          jobID: new mongoose.Types.ObjectId(jobID),
        },
      },
      {
        $lookup: {
          from: "candidates",
          localField: "candidateID",
          foreignField: "_id",
          as: "candidate",
        },
      },
      {
        $unwind: {
          path: "$candidate",
        },
      },
      {
        $project: {
          candidateID: 0,
          "candidate.password": 0,
          "candidate.rawResult": 0,
        },
      },
    ]);
  },
};

export default ApplicationModel;
