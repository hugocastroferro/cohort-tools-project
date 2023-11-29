const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// SCHEMA - describes and enforces the structure of the docs:

const studentSchema = new Schema({
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  linkedinUrl: String,
  languages: [String],
  program: String,
  background: String,
  image: String,
  projects: [],
  cohort: {
    type: Schema.Types.ObjectId,
    ref: "Cohort",
  },
});

// MODEL

const Student = mongoose.model("Student", studentSchema);

// EXPORT MODEL

module.exports = Student;
