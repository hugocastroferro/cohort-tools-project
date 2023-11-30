const express = require("express");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");
const PORT = 5005;
const cohorts = require("./cohorts.json");
const students = require("./students.json");
const mongoose = require("mongoose");
const Cohort = require("./models/Cohort.model");
const Student = require("./models/Student.model");



mongoose
  .connect("mongodb://127.0.0.1:27017/cohort-tools-api")
  .then((x) => console.log(`Connected to Database: "${x.connections[0].name}"`))
  .catch((err) => console.error("Error connecting to MongoDB", err));

// STATIC DATA
// Devs Team - Import the provided files with JSON data of students and cohorts here:
// ...

// INITIALIZE EXPRESS APP - https://expressjs.com/en/4x/api.html#express
const app = express();

// MIDDLEWARE
// Research Team - Set up CORS middleware here:
const cors = require("cors");

app.use(express.json());
app.use(morgan("dev"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(cors());

// ROUTES - https://expressjs.com/en/starter/basic-routing.html
// Devs Team - Start working on the routes here:
// ...

app.get("/docs", (req, res) => {
  res.sendFile(__dirname + "/views/docs.html");
});

// ROUTES - COHORTS:

//GET - All cohorts in JSON format:
app.get("/api/cohorts", (req, res) => {
  Cohort.find({})
    .then((cohorts) => {
      console.log("Retrieved cohorts ->", cohorts);
      res.json(cohorts);
    })
    .catch((error) => {
      console.error("Error while retrieving cohorts ->", error);
      res.status(500).send({ error: "Failed to retrieve cohorts" });
    });
});

//GET - Specified cohort by id:
app.get("/api/cohorts/:cohortId", (req, res, next) => {
  const { cohortId } = req.params;

  Cohort.findById(cohortId)
    .then((cohortFromDB) => {
      res.status(200).json(cohortFromDB)
    })
    .catch((error) => {
      res.status(500).json("Error getting cohort.")
    });
});

// POST - Create new cohort:
app.post("/api/cohorts", (req, res) => {
  const {
    inProgress,
    cohortSlug,
    cohortName,
    program,
    campus,
    startDate,
    endDate,
    programManager,
    leadTeacher,
    totalHours,
  } = req.body;

Cohort.create({ 
  inProgress,
  cohortSlug,
  cohortName,
  program,
  campus,
  startDate,
  endDate,
  programManager,
  leadTeacher,
  totalHours
})  
    .then((cohortFromDB) => {
      res.status(201).json(cohortFromDB);
    })
    .catch((error) => {
      console.log(error)
      res.status(500).json("Error creating a cohort in the DB.");
    });
});

// PUT - Update specified cohort by id:
app.put("/api/cohorts/:cohortId", (req, res) => {
  
  Cohort.findByIdAndUpdate(req.params.cohortId, req.body, { new: true})
    .then((updatedCohort) => {
      console.log(req.body, updatedCohort)
      res.status(200).json(updatedCohort);
    })
    .catch((error) => {
      res.status(500).json("Error updating Cohort.")
    });
});


// DELETE - Delete specified cohort by id:
app.delete("/api/cohorts/:cohortId", (req, res, next) => {
  const { cohortId } = req.params;

  Cohort.findByIdAndDelete(cohortId)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      res.status(500).json("Error deleting Cohort.")
    });
});


// GET - All students in JSON format:
app.get("/api/students", (req, res) => {
  Student.find({})
    .populate("cohort") // populate 
    .then((students) => {
      console.log("Retrieved students ->", students);
      res.json(students);
    })
    .catch((error) => {
      console.error("Error while retrieving students ->", error);
      res.status(500).send({ error: "Failed to retrieve students" });
    });
});


// GET - All the students of a specified cohort in JSON format:
app.get("/api/students/cohort/:cohortId", (req, res) => {
  const { cohortId } = req.params;

  Student.find({ cohort: cohortId })
    .populate("cohort") // populate 
    .then((students) => {
      res.json(students);
    })
    .catch((error) => {
      res.status(500).json({
        error: "Failed to retrieve students for the specified cohort",
      });
    });
});

// GET - Specified students by id:
app.get("/api/students/:studentId", (req, res, next) => {
  const { studentId } = req.params;

  Student.findById(studentId)
    .populate("cohort") // populate 
    .then((studentFromDB) => {
      res.status(200).json(studentFromDB);
    })
    .catch((error) => {
      res.status(500).json("Error getting Student.");
    });
});

// POST - Create a new student with the respective cohort id:
app.post("/api/students", (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    linkedinUrl,
    languages,
    program,
    background,
    image,
    projects,
    cohort: cohortId,
  } = req.body;

Student.create({
  firstName,
  lastName,
  email,
  phone,
  linkedinUrl,
  languages,
  program,
  background,
  image,
  projects,
  cohort: cohortId,
  })
  
  .then((studentFromDB) => {
    // Populate 
    Student.populate(studentFromDB, { path: "cohort" }, (err, populatedStudent) => {
      if (err) {
        console.error("Error populating cohort field", err);
        res.status(500).json({ error: "Error creating a student in the DB." });
      } else {
        res.status(201).json(populatedStudent);
      }
    });
  })
  .catch((error) => {
    console.error("Error creating a student in the DB.", error);
    res.status(500).json({ error: "Error creating a student in the DB." });
  });
});


// PUT - Update specified student by id:
app.put("/api/students/:studentId", (req, res) => {
  const { studentId } = req.params;

  Student.findByIdAndUpdate(studentId, req.body, { new: true })
    .populate("cohort") // populate 
    .then((updatedStudent) => {
      res.status(200).json(updatedStudent);
    })
    .catch((error) => {
      res.status(500).json("Error updating Student.");
    });
});

// DELETE - Delete specified cohort by id:
app.delete("/api/students/:studentId", (req, res, next) => {
  const { studentId } = req.params;

  Student.findByIdAndDelete(studentId)
    .then(() => {
      res.status(200).send();
    })
    .catch((error) => {
      res.status(500).json("Error deleting Student.");
    });
});


// START SERVER
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
