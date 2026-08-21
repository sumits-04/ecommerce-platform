const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async (req, res, next) => {
  if (!req.cookies.token) {
    req.flash("error", "you need to login first");
    return res.redirect("/");
  }

  try {
    const decode = jwt.verify(req.cookies.token, process.env.JWT_KEY);

    const user = await userModel
      .findById(decode.id)
      .select("-password");

    if (!user) {
      res.clearCookie("token");
      req.flash("error", "User not found. Please login again");
      return res.redirect("/");
    }

    req.user = user;
    next();

  } catch (err) {
    console.log(err);
    req.flash("error", "something went wrong");
    return res.redirect("/");
  }
};