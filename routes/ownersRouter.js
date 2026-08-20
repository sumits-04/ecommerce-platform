const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");
const express = require("express");
const upload = require("../config/multer-config");
const router = express.Router();
const ownerModel = require("../models/owner-model");
const productModel = require("../models/product-model");
const { generateToken } = require("../utils/generateToken");
require("dotenv").config();
const bcrypt = require("bcrypt");

if (process.env.NODE_ENV === "development") {
  router.post("/login", async (req, res) => {
    let { email, password } = req.body;
    let owner = await ownerModel.findOne({ email });

    if (!owner) {
      req.flash("error", "Incorrect Email or Password");
      return res.redirect("/owners/login");
    }

    bcrypt.compare(password, owner.password, (err, result) => {
      if (err) {
        return res.send(err.message);
      }

      if (result) {
        req.session.owner = owner;

        req.flash("success", "Successfully Login");
        return res.redirect("/owners/AllProducts");
      }

      req.flash("error", "Incorrect Email or Password");
      return res.redirect("/owners/login");
    });
  });
}

router.get("/login", (req, res) => {
  let failled = req.flash("failled");
  let error = req.flash("error");
  res.render("owner-login.ejs", { failled, error, loggedin: false });
});

router.use(isOwnerLoggedIn);

router.get("/logout", (req, res) => {
  let failled = req.flash("failled");
  let error = req.flash("error");
  res.render("owner-login.ejs", { failled, error, loggedin: false });
});

router.get("/createproducts", (req, res) => {
  let success = req.flash("success");
  let CreatedOwner = req.flash("CreatedOwner");
  res.render("createproducts.ejs", { success, CreatedOwner });
});

router.get("/delete/:productid", async (req, res) => {
  await productModel.findByIdAndDelete(req.params.productid);
  req.flash("delete", "Item Deleted Successfully");
  return res.redirect("/owners/AllProducts");
});

router.get("/edit/:productid", async (req, res) => {
  let product = await productModel.findById(req.params.productid);
  res.render("EditProduct.ejs", { product });
});

router.post("/EditProducts/:productid", async (req, res) => {
  await productModel.findByIdAndUpdate(req.params.productid, req.body);
  req.flash("edit", "Edited Successfully");
  return res.redirect("/owners/AllProducts");
});

router.get("/AllProducts", async (req, res) => {
  let products = await productModel.find();
  let Delete = req.flash("delete");
  let edit = req.flash("edit");
  res.render("AllProducts.ejs", { products, Delete, edit });
});

// router.get("/account", async (req,res)=>{
//   let owners= await ownerModel.find();
//   res.render("account.ejs", { owners });
// })

router.get("/account", async (req, res) => {
    if (!req.session.owner) {
        return res.redirect("/owners/login");
    }

    const owner = await ownerModel.findById(req.session.owner._id);
    let Update= req.flash("Update");

    res.render("account", {
        owner,
        loggedin: true,
        Update
    });
});

router.post(
    "/profile-image",
    upload.single("profileImage"),
    async (req, res) => {

        await ownerModel.findByIdAndUpdate(
            req.session.owner._id,
            {
                profileImage: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            }
        );

        res.redirect("/owners/account");
    }
);

router.get("/profile-image", async (req, res) => {

    let owner = await ownerModel.findById(req.session.owner._id);

    if (!owner.profileImage.data) {
        return res.status(404).send("No image");
    }

    res.set("Content-Type", owner.profileImage.contentType);
    res.send(owner.profileImage.data);
});

router.get("/editprofile", async (req,res)=>{
  let owner= await ownerModel.findById(req.session.owner._id);
  res.render("editprofile.ejs", { owner });
})

router.post("/editprofile/:id", async (req,res)=>{
  await ownerModel.findByIdAndUpdate(req.params.id, req.body);
  req.flash("Update","Update Successfull");
  return res.redirect("/owners/account");
})

router.get("/changepassword", async (req,res)=>{
  let owner= await ownerModel.findById(req.session.owner._id);
  res.render("ownerpassword.ejs", { owner });
})

router.post("/account/change-password", async (req, res) => {

    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        const owner = await ownerModel.findById(req.session.owner._id);

        // Check current password
        const isMatch = await bcrypt.compare(
            currentPassword,
            owner.password
        );

        if (!isMatch) {
            req.flash("Update", "Current password is incorrect");
            return res.redirect("/owners/account");
        }

        // Check new password confirmation
        if (newPassword !== confirmPassword) {
            req.flash("Update", "New passwords do not match");
            return res.redirect("/owners/account");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        owner.password = hashedPassword;

        await owner.save();

        req.flash("Update", "Password changed successfully");
        res.redirect("/owners/account");

    } catch (error) {
        console.log(error);
        req.flash("Update", "Something went wrong");
        res.redirect("/owners/account");
    }
});

module.exports = router;
