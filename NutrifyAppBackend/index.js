const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//Importing Model:
const userModel = require("./models/userModel");
const foodModel = require("./models/foodModel");
const trackingModel = require("./models/trackingModel");

// Custom middleware:
const verifyToken = require("./verifyToken");

//database connection using mongodb:
mongoose
  .connect("mongodb://127.0.0.1:27017/nutrify")
  .then(() => {
    console.log("connection successful to database");
  })
  .catch((err) => {
    console.log("connection error");
  });

//Routers:
const app = express();

//Built-in middleware:
app.use(express.json());

app.post("/register", (req, res) => {
  let user = req.body;

  // Encypt the password:
  bcrypt.genSalt(10, (err, salt) => {
    if (!err) {
      bcrypt.hash(user.password, salt, async (err, hpass) => {
        if (!err) {
          user.password = hpass;

          try {
            let doc = await userModel.create(user);
            res.status(201).send({ message: "Registration successfull!" });
          } catch (err) {
            console.log(err);
            res.status(500).send({ message: "Some Problem" });
          }
        }
      });
    }
  });
});

// End-point for Login :
app.post("/login", async (req, res) => {
  let userCred = req.body;

  try {
    const user = await userModel.findOne({ email: userCred.email });

    if (user != null) {
      bcrypt.compare(userCred.password, user.password, (err, success) => {
        if (success == true) {
          jwt.sign({ email: userCred.email }, "nutrifyapp", (err, token) => {
            if (!err) {
              res.send({ message: "Login successful", token: token });
            } else {
              res.send({ message: err });
            }
          });
        } else {
          res.send({ message: "Incorrect Password" });
        }
      });
    } else {
      res.status(403).send({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
  }
});

// End-points to see all food:

app.get("/foods", verifyToken, async (req, res) => {
  try {
    let foods = await foodModel.find();
    res.send(foods);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Some problem while getting info" });
  }
});

// endpoint to search food by name:
app.get("/foods/:name", verifyToken, async (req, res) => {
  try {
    let foods = await foodModel.find({
      name: req.params.name,
    });
    // if (foods.length != 0) {
    //   res.send(foods);
    // } else {
    //   res.status(404).send({ message: "Food Item not found" });
    // }
    res.send(foods);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "Some problem has occured" });
  }
});

// End-point to track food:
app.post("/track", verifyToken, async (req, res) => {
  let trackData = req.body;
  console.log(trackData);
  try {
    let data = await trackingModel.create(trackData);

    res.status(201).send({ message: "Food Added" });
  } catch (err) {
    res.send({ message: "some ocurred occured" });
  }
});

// endpoint to fetch all foods eaten by a person:
app.get("/track/:user_id/:date", verifyToken, async (req, res) => {
  let userid = req.params.user_id;
  let date = new Date(req.params.date);
  let strDate =
    date.getDay() + "/" + date.getMonth() + "/" + date.getFullYear();
  //console.log(strDate);
  try {
    let foods = await trackingModel
      .find({ user_id: userid, eatenDate: strDate })
      .populate("user_id")
      .populate("food_id");
    res.send(foods);
  } catch (err) {
    console.log(err);
    res.status(500).send({ message: "some problem occured" });
  }
});

// Server where application is running:
app.listen(8000, () => {
  console.log("Server is up and running");
});
