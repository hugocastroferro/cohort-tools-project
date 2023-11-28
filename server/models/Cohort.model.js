const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// SCHEMA - describes and enforces the structure of the docs:

const cohortSchema = new Schema({
  inProgress: Boolean,
  cohortSlug: String,
  cohortName: String,
  program: String,
  campus: String,
  startDate: String,
  endDate: String,
  programManager: String,
  leadTeacher: String,
  totalHours: Number,
});

// MODEL

const Cohort = mongoose.model("Cohort", cohortSchema);

// EXPORT MODEL

module.exports = Cohort;
