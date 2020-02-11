module.exports = function checkLoginStatus(req, res, next) {

    res.locals.isLoggedIn = Boolean(req.session.currentUser);
    if (res.locals.isLoggedIn) {
        if (req.params.id == req.session.currentUser._id) {
            res.locals.user_id=req.session.currentUser._id;
            res.locals.message.error = req.flash("success", "Welcome on your POI page !");
            next();
        }
        else {
             res.locals.message.error = req.flash("error", "you don't have access to this page");
        }
    }
    else {
        res.redirect("/login");
    }

  }
  