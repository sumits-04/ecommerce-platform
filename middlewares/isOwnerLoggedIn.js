module.exports = function (req, res, next) {
  if (req.session.owner) {
    return next();
  }

  req.flash("error", "Please Login First");
  return res.redirect("/owners/login");
};
