const userModel = require("../models/user-model");
const jwt = require("jsonwebtoken");
const { generateToken } = require("../utils/generateToken");
const bcrypt = require("bcrypt");

module.exports.registerUser = async (req, res) => {
  try {
    let { fullname, email, password } = req.body;

    let user = await userModel.findOne({ email: email });
    if (user) {
      req.flash("error", "You already have an account, please login.");
      return res.redirect("/");
    }

    bcrypt.genSalt(10, (err, salt) => {
      bcrypt.hash(password, salt, async (err, hash) => {
        if (err) return res.send(err.message);
        else {
          let user = await userModel.create({
            fullname,
            email,
            password: hash,
          });

          let token = generateToken(user);
          res.cookie("token", token);
          req.flash("create","User Created Successfully");
          return res.redirect("/");
        }
      });
    });
  } catch (err) {
    res.send(err.message);
  }
};

module.exports.loginUser = async (req, res) => {
  let { email, password } = req.body;

  let user = await userModel.findOne({ email });
  if (!user) {
    req.flash("error", "Incorrect Email or Password");
    return res.redirect("/");
  }

  bcrypt.compare(password, user.password, (err, result) => {
    if (result) {
      let token = generateToken(user);
      res.cookie("token", token);
      res.redirect("/shop");
    } else {
      req.flash("error", "Incorrect Email or Password");
      return res.redirect("/");
    }
  });
};

module.exports.logout = async (req, res) => {
  res.cookie("token", "");
  return res.redirect("/");
};
