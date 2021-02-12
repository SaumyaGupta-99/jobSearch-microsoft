import Database from "../classes/Database";
import mongoose from "mongoose";
import { hash, verify } from "argon2";

const CandidateModel = {
  init() {
    const db = Database.getConnection();

    const candidateSchema = new mongoose.Schema({
      name: {
        type: "String",
        required: true,
      },
      email: {
        type: "String",
        unique: true,
        required: true,
      },
      password: {
        type: "String",
        required: true,
      },
      phone: {
        type: "String",
        required: true,
      },
      address: {
        type: "String",
        required: true,
      },
      city: { type: "String", required: true },
      country: { type: "String", required: true },
      resume: { type: "String", required: true },
      jobKeywords: [{ type: "String" }],
      resumeParsed: { type: "Boolean", default: false },
      rawResult: { type: Object },
    });
    candidateSchema.index({ email: 1 }, { unique: true });
    const Candidate = db.connection.model("Candidate", candidateSchema);
    CandidateModel.setModel(Candidate);
    return candidateSchema;
  },

  setModel: (model) => {
    CandidateModel.model = model;
  },

  getModel: () => {
    return CandidateModel.model;
  },
  /**
   * CandidateModel.create
   *   @description CRUD ACTION create
   *
   */
  async create(item) {
    item.password = await hash(item.password);
    const obj = new CandidateModel.model(item);
    let data = await obj.save();
    data = data.toObject();
    delete data.password;
    delete data.jobsApplied;
    delete data.jobKeywords;
    delete data.resume;
    return data;
  },

  /**
   * CandidateModel.delete
   *   @description CRUD ACTION delete
   *   @param ObjectId id Id
   *
   */
  async delete(id) {
    return await CandidateModel.model.findByIdAndRemove(id);
  },

  /**
   * CandidateModel.get
   *   @description CRUD ACTION get
   *   @param ObjectId id Id resource
   *
   */
  async get(id) {
    return await CandidateModel.model
      .findOne({ _id: id }, { password: 0, rawResult: 0 })
      .lean();
  },

  /**
   * CandidateModel.list
   *   @description CRUD ACTION list
   *
   */
  async list() {
    return await CandidateModel.model.find().select("-password").lean();
  },

  /**
   * CandidateModel.update
   *   @description CRUD ACTION update
   *   @param ObjectId id Id
   *
   */
  async update(item) {
    delete item.password;

    return await CandidateModel.model.findOneAndUpdate(
      { _id: item._id },
      item,
      { new: true, update: true }
    );
  },

  /**
   * Update password
   */
  updatePassword: async (idUser, password) => {
    let user = await CandidateModel.model.findOneAndUpdate(
      { _id: idUser },
      {
        password: password,
      }
    );
    return user;
  },

  login: async (email, pwd) => {
    let data = await CandidateModel.model
      .findOne({ email })
      .select({
        jobsApplied: 0,
        resume: 0,
        jobKeywords: 0,
        rawResult: 0,
        jobKeywords: 0,
      })
      .lean();
    let passwordMatched = await verify(data.password, pwd);
    delete data.password;
    if (passwordMatched) {
      return { status: true, user: data };
    }
    return { status: false, error: "INVALID_CREDENTIALS" };
  },

  setKeywords: async (_id, rawData) => {
    await CandidateModel.model.findOneAndUpdate(
      { _id },
      {
        jobKeywords: rawData.data.skills,
        rawResult: rawData,
        resumeParsed: true,
      }
    );
  },
};

export default CandidateModel;
