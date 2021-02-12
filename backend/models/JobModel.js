import Database from "../classes/Database";
import mongoose from "mongoose";
import Logger from "../classes/Logger";

const JobModel = {
  init() {
    const db = Database.getConnection();

    const jobSchema = new mongoose.Schema({
      title: {
        type: "String",
        required: true,
      },
      about: {
        type: "String",
        required: true,
      },
      qualification: {
        type: "String",
        required: true,
      },
      location: {
        type: "String",
        required: true,
      },
      ctc: {
        type: "Number",
        required: true,
      },
      type: {
        type: "String",
        enum: ["parttime", "fulltime", "internship"],
      },
      tags: [{ type: "String" }],
      companyName: {
        type: "String",
        required: true,
      },
    });
    jobSchema.index({ tags: 1 });
    const Job = db.connection.model("Job", jobSchema);
    JobModel.setModel(Job);
    return jobSchema;
  },

  setModel: (model) => {
    JobModel.model = model;
  },

  getModel: () => {
    return JobModel.model;
  },
  /**
   * JobModel.create
   *   @description CRUD ACTION create
   *
   */
  async create(item) {
    const obj = new JobModel.model(item);
    return await obj.save();
  },

  /**
   * JobModel.delete
   *   @description CRUD ACTION delete
   *   @param ObjectId id Id
   *
   */
  async delete(id) {
    return await JobModel.model.findByIdAndRemove(id);
  },

  /**
   * JobModel.get
   *   @description CRUD ACTION get
   *   @param ObjectId id Id resource
   *
   */
  async get(id) {
    return await JobModel.model.findOne({ _id: id }).lean();
  },

  /**
   * JobModel.list
   *   @description CRUD ACTION list
   *
   */
  async list() {
    return await JobModel.model.find().lean();
  },

  /**
   * JobModel.update
   *   @description CRUD ACTION update
   *   @param ObjectId id Id
   *
   */
  async update(item) {
    delete item.password;

    return await JobModel.model.findOneAndUpdate({ _id: item._id }, item, {
      new: true,
      update: true,
    });
  },

  async search(payload) {
    const query = {};
    if (payload && payload.location)
      query.location = new RegExp(payload.location, "i");
    if (payload && payload.tags) query.tags = { $in: payload.tags };
    if (payload && payload.title) query.title = new RegExp(payload.title, "i");
    if (payload && payload.companyName)
      query.companyName = new RegExp(payload.companyName, "i");
    return await JobModel.model.find(query).lean();
  },

  async getTags(_id) {
    return await JobModel.model.findOne({ _id }, { tags: 1 }).lean();
  },
};

export default JobModel;
