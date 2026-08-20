const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost/scatch");

const ownerSchema = mongoose.Schema({
  fullname: {
    type: String,
    minLength: 3,
    trim: true,
  },
  email: String,
  password: String,
  profileImage: {
    data: Buffer,
    contentType: String
},
  products: {
    type: Array,
    default: [],
  },
  picture: String,
  gstin: String,
});

module.exports = mongoose.model("owner", ownerSchema);
