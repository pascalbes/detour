const express = require("express");
const router = new express.Router();
const userModel = require("../models/User.model");
const bcryptjs = require("bcryptjs");

////////////////////
// REGISTER / SIGNUP
////////////////////

router.get("/register", (req, res, next) => {
  res.render("auth/register", { scripts: ["auth"] });
});

router.post("/register", (req, res, next) => {
  const user = req.body;

  if (!user.email || !user.password) {
    req.flash("error", "All fields are required");
    res.redirect("/register");
    return;
  } else {
    userModel
      .findOne({
        email: user.email
      })
      .then(dbRes => {
        if (dbRes) {
          req.flash("error", "Sorry, this email is already in use.");
          return res.redirect("/register");
        }

        const salt = bcryptjs.genSaltSync(10);
        const hashed = bcryptjs.hashSync(user.password, salt);
        user.password = hashed;

        userModel.create(user).then(user => {
          req.session.currentUser = user;
          res.redirect("/user/poi/all/" + user._id);
        });
      })
      .catch(next);
  }
});

/////////////////
// LOGIN / SIGNIN
/////////////////

router.get("/login", (req, res, next) => {
  res.render("auth/login", { scripts: ["auth"] });
});

router.post("/login", (req, res, next) => {
  const user = req.body;

  if (!user.email || !user.password) {
    req.flash("error", "Wrong credentials");
    return res.redirect("/login");
  }

  userModel
    .findOne({ email: user.email })
    .then(dbRes => {
      if (!dbRes) {
        req.flash("error", "Wrong credentials");
        return res.redirect("/login");
      }

      if (bcryptjs.compareSync(user.password, dbRes.password)) {
        const { _doc: clone } = { ...dbRes };

        delete clone.password;
        clone.id = dbRes._id;
        req.session.currentUser = clone;

        return res.redirect("/user/poi/all/" + dbRes._id);
      } else {
        req.flash("error", "Wrong credentials");
        return res.redirect("/login");
      }
    })
    .catch(next);
});

router.get("/logout", (req, res, next) => {
  req.session.destroy(() => {
    res.locals.isLoggedIn = null;
    res.locals.user_id = null;
  });
  res.redirect("/");
});

module.exports = router;
