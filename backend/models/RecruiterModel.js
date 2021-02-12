import Database from "../classes/Database";
import mongoose from "mongoose";
import { hash, verify } from "argon2";

const recruiterModel = {
  init() {
    const db = Database.getConnection();

    const recruiterSchema = new mongoose.Schema({
      name: {
        type: "String",
        required: true,
      },
      email: {
        type: "String",
        unique: true,
        required: true,
      },
      phone: {
        type: "String",
        required: true,
      },
      address: { type: "String", required: true },
      password: {
        type: "String",
        required: true,
      },
      jobsPosted: [{ type: mongoose.Schema.ObjectId, ref: "Job" }],
    });
    recruiterSchema.index({ email: 1 }, { unique: true });
    const Recruiter = db.connection.model("Recruiter", recruiterSchema);
    recruiterModel.setModel(Recruiter);
    return recruiterSchema;
  },

  setModel: (model) => {
    recruiterModel.model = model;
  },

  getModel: () => {
    return recruiterModel.model;
  },
  /**
   * RecruiterModel.create
   *   @description CRUD ACTION create
   *
   */
  async create(item) {
    item.password = await hash(item.password);
    const obj = new recruiterModel.model(item);
    let data = await obj.save();
    data = data.toObject();
    delete data.password;
    delete data.jobsPosted;
    return data;
  },

  /**
   * RecruiterModel.delete
   *   @description CRUD ACTION delete
   *   @param ObjectId id Id
   *
   */
  async delete(id) {
    return await recruiterModel.model.findByIdAndRemove(id);
  },

  /**
   * RecruiterModel.get
   *   @description CRUD ACTION get
   *   @param ObjectId id Id resource
   *
   */
  async get(id) {
    return await recruiterModel.model
      .findOne({ _id: id })
      .select("-password")
      .lean();
  },

  /**
   * RecruiterModel.list
   *   @description CRUD ACTION list
   *
   */
  async list() {
    return await recruiterModel.model.find().select("-password").lean();
  },

  /**
   * RecruiterModel.update
   *   @description CRUD ACTION update
   *   @param ObjectId id Id
   *
   */
  async update(item) {
    delete item.password;

    return await recruiterModel.model.findOneAndUpdate(
      { _id: item._id },
      item,
      { new: true, update: true }
    );
  },

  /**
   * Update password
   */
  updatePassword: async (idUser, password) => {
    let user = await recruiterModel.model.findOneAndUpdate(
      { _id: idUser },
      {
        password: password,
      }
    );
    return user;
  },

  login: async (email, pwd) => {
    let data = await recruiterModel.model
      .findOne({ email })
      .select("-jobsPosted")
      .lean();
    let passwordMatched = await verify(data.password, pwd);
    delete data.password;
    if (passwordMatched) {
      return { status: true, user: data };
    }
    return { status: false, error: "INVALID_CREDENTIALS" };
  },

  addJob: async (jobId, recruiterId) => {
    return await recruiterModel.model.findOneAndUpdate(
      { _id: recruiterId },
      { $push: { jobsPosted: jobId } },
      { new: true }
    );
  },

  getJobsPosted: async (recruiterId) => {
    const data = await recruiterModel.model
      .findOne({ _id: recruiterId }, { email: 0, password: 0, phone: 0 })
      .populate({ path: "jobsPosted" });
    return data;
  },
  checkOwnsJob: async (id, jobId) => {
    const data = await recruiterModel.model
      .findOne(
        {
          _id: id,
          jobsPosted: jobId,
        },
        { _id: 1 }
      )
      .lean();
    return data ? true : false;
  },
};
export default recruiterModel;
