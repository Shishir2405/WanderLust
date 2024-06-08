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

module.exports.renderWishlist = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate("favoriteListings");

    res.render("users/wishlists", { currUser: user });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error rendering wishlist.");
    res.redirect("/");
  }
};

module.exports.addToWishlist = async (req, res, next) => {
  try {
    const { userId, listingId } = req.body;
    const user = await User.findById(userId);
    if (user) {
      if (!user.favoriteListings.includes(listingId)) {
        user.favoriteListings.push(listingId);
        await user.save();
        req.flash("success", "Listing added to wishlist successfully.");
        res.redirect("/listings/" + listingId);
      } else {
        req.flash("error", "Listing already exists in wishlist.");
        res.redirect("/listings/" + listingId);
      }
    } else {
      req.flash("error", "User not found.");
      res.redirect("/listings/" + listingId);
    }
  } catch (err) {
    console.error(err);
    req.flash("error", "Internal server error.");
    res.redirect("/listings/" + listingId);
  }
};

module.exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { userId, listingId } = req.body;
    const user = await User.findById(userId);
    if (user) {
      await User.findByIdAndUpdate(userId, {
        $pull: { favoriteListings: listingId },
      });
      req.flash("success", "Listing removed from wishlist successfully.");
      res.redirect("/wishlists");
    } else {
      req.flash("error", "User not found.");
      res.redirect("/");
    }
  } catch (err) {
    console.error(err);
    req.flash("error", "Internal server error.");
    res.redirect(`/listings/${listingId}`);
  }
};
