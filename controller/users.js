const User = require("../models/user.js");

module.exports.renderSignUpForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res) => {
  try {
    let { username, email, password } = req.body;
    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password);
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "Welcome To WanderLust");
      res.redirect("/listings");
    });
  } catch (err) {
    req.flash("alert", err.message);
    res.redirect("/signup");
  }
};

module.exports.login = async (req, res) => {
  req.flash("success", "Welcome Back To WanderLust");
  let redirect = res.locals.redirectUrl || "/listings";
  res.redirect(redirect);
};

module.exports.renderLoginForm = async (req, res) => {
  res.render("users/login.ejs");
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", `You've been successfully Logged out`);
    res.redirect("/listings");
  });
};
