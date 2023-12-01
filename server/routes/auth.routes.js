const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const { isAuthenticated } = require("./../middleware/jwt.middleware");

const router = express.Router();
const saltRounds = 10;

router.get("/", (req, res, next) => {
  res.json("All good in auth");
});

// POST  /auth/signup
router.post("/signup", async (req, res) => {
  const { email, password, name } = req.body;

  if (email === "" || password === "" || name === "") {
    res.status(400).json({ message: "Provide email, pass and username" });
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  if (!emailRegex.test(email)) {
    res.status(400).json({ message: "Fix email format" });
    return;
  }

  try {
    const response = await User.findOne({ email });
    if (response) {
      res.status(400).json({ message: "User already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(saltRounds);
    const hashedPass = bcrypt.hashSync(password, salt);

    const createdUser = await User.create({
      email,
      name,
      password: hashedPass,
    });

    const user = {
      email: createdUser.email,
      name: createdUser.name,
      _id: createdUser._id,
    };

    console.log(user);
    res.status(201).json(user);
  } catch (err) {
    console.log(err);
    res
      .status(500)
      .json({ message: "Could not create user. Internal server error" });
  }
});

// POST  /auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (email === "" || password === "") {
    res.status(400).json({ message: "Provide email and password" });
    return;
  }
  try {
    const foundUser = await User.findOne({ email });
    if (!foundUser) {
      res.status(401).json({ message: "User not found." });
      return;
    }

    const passCorrect = bcrypt.compareSync(password, foundUser.password);
    if (passCorrect) {
      const { name, email, _id } = foundUser;

      const payload = { _id, email, name };

      const authToken = jwt.sign(payload, process.env.TOKEN_SECRET, {
        algorithm: "HS256",
        expiresIn: "6h",
      });
      console.log("User authenticated");
      res.status(200).json({ authToken: authToken });
    } else {
      res.status(401).json({ message: "Unable to authenticate the user" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: "Could not login." });
  }
});

// GET  /auth/verify
router.get("/verify", isAuthenticated, (req, res, next) => {
  console.log(`req.payload`, req.payload);

  res.status(200).json(req.payload);
});

module.exports = router;
