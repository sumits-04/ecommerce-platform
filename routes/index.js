const express = require("express");
const router = express.Router();
const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const upload = require("../config/multer-config");
const userModel = require("../models/user-model");
const ownerModel = require("../models/owner-model");
const bcrypt = require("bcrypt");

router.get("/", (req, res) => {
  let error = req.flash("error");
  let create = req.flash("create");
  res.render("index.ejs", { error, loggedin: false, create });
});

router.get("/shop", isLoggedIn, async (req, res) => {
  let products = await productModel.find();
  let success = req.flash("success");
  res.render("shop.ejs", { products, success });
});

router.get("/logout", isLoggedIn, (req, res) => {
  res.render("shop.ejs");
});

router.get("/addtocart/:productid", isLoggedIn, async (req, res) => {
  let user = await userModel.findById(req.user._id);

  if (!user) {
    return res.status(404).send("User not found");
  }

  let item = user.cart.find(
    (item) => item.product && item.product.toString() === req.params.productid,
  );

  if (item) {
    item.quantity += 1;
  } else {
    user.cart.push({
      product: req.params.productid,
      quantity: 1,
    });
  }

  await user.save();
  req.flash("success", "Added to Cart");
  if (req.query.from === "discount") {
    return res.redirect("/discountproducts");
  }

  return res.redirect("/shop");
});

router.post("/removefromcart/:productid", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    const productId = req.params.productid;

    user.cart = user.cart.filter((item) => {
      return item.product.toString() !== productId;
    });

    await user.save();

    res.redirect("/cart");
  } catch (error) {
    console.log(error);
    res.status(500).send("Something went wrong");
  }
});

router.get("/increase/:id", isLoggedIn, async (req, res) => {
  let user = await userModel.findById(req.user.id);

  let item = user.cart.find(
    (item) => item.product.toString() === req.params.id,
  );

  if (item) {
    item.quantity++;
  }

  await user.save();
  res.redirect("/cart");
});

router.get("/decrease/:id", isLoggedIn, async (req, res) => {
  let user = await userModel.findById(req.user.id);

  let item = user.cart.find(
    (item) => item.product.toString() === req.params.id,
  );

  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
    }
  }
  await user.save();
  res.redirect("/cart");
});

router.get("/cart", isLoggedIn, async (req, res) => {
  let user = await userModel.findById(req.user._id).populate("cart.product");

  res.render("cart.ejs", { user });
});

router.get("/discountproducts", async (req, res) => {
  let products = await productModel.find();
  let success = req.flash("success");
  res.render("discountproducts.ejs", { products, success });
});

router.post(
    "/profile-image", isLoggedIn ,
    upload.single("profileImage"),
    async (req, res) => {

        await userModel.findByIdAndUpdate(
            req.user._id,
            {
                profileImage: {
                    data: req.file.buffer,
                    contentType: req.file.mimetype
                }
            }
        );

        res.redirect("/account");
    }
);

router.get("/account", isLoggedIn, async(req,res)=>{
  let user= await userModel.findById(req.user._id);
  let Update= req.flash("Update");
  res.render("useraccount.ejs", { user, Update });
})

router.get("/profile-image", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findById(req.user._id);

    if (!user?.profileImage?.data) {
      return res.status(404).send("No image");
    }

    res.set("Content-Type", user.profileImage.contentType);
    return res.send(user.profileImage.data);

  } catch (err) {
    console.log("IMAGE ERROR:", err);
    return res.status(500).send("Server error");
  }
});

router.get("/editprofile", isLoggedIn, async (req,res)=>{
  let user= await userModel.findById(req.user._id);
  res.render("usereditprofile", { user });
})

router.get("/changepassword", isLoggedIn, async (req,res)=>{
  let user= await userModel.findById(req.user._id);
  res.render("password.ejs", { user });
})

router.post("/account/change-password", isLoggedIn, async (req, res) => {

    try {
        const { currentPassword, newPassword, confirmPassword } = req.body;

        const user = await userModel.findById(req.user._id);

        // Check current password
        const isMatch = await bcrypt.compare(
            currentPassword,
            user.password
        );

        if (!isMatch) {
            req.flash("Update", "Current password is incorrect");
            return res.redirect("/account");
        }

        // Check new password confirmation
        if (newPassword !== confirmPassword) {
            req.flash("Update", "New passwords do not match");
            return res.redirect("/account");
        }

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        user.password = hashedPassword;

        await user.save();

        req.flash("Update", "Password changed successfully");
        res.redirect("/account");

    } catch (error) {
        console.log(error);
        req.flash("Update", "Something went wrong");
        res.redirect("/account");
    }
});

router.post("/editprofile/:id", isLoggedIn, async (req,res)=>{
 await userModel.findByIdAndUpdate(req.params.id, req.body);
 req.flash("Update","Update Successfull");
 return res.redirect("/account");
})

module.exports = router;
