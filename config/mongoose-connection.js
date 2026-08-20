mongoose = require("mongoose");
const dbgr = require("debug")("development:mongoose");
const config = require("config");

mongoose
  .connect(`${config.get("MONGODB_URI")}`)
  .then(() => {
    dbgr("MongoDB Connected");
  })
  .catch((err) => {
    dbgr(err);
  });

module.exports = mongoose.connection;
