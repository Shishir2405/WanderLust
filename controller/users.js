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
    // Retrieve the currently logged-in user
    const user = await User.findById(req.user._id).populate('favoriteListings');

    res.render("users/wishlists", { currUser: user });
  } catch (err) {
    console.error(err);
    req.flash("error", "Error rendering wishlist.");
    res.redirect("/"); // Redirect to the home page or another appropriate page
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
        res.status(200).send('Listing added to wishlist successfully.');
      } else {
        res.status(400).send('Listing already exists in wishlist.');
      }
    } else {
      res.status(404).send('User not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error.');
  }
};

module.exports.removeFromWishlist = async (req, res, next) => {
  try {
    const { userId, listingId } = req.body;
    const user = await User.findById(userId);
    if (user) {
      user.favoriteListings = user.favoriteListings.filter(id => id !== listingId);
      await user.save();
      res.status(200).send('Listing removed from wishlist successfully.');
    } else {
      res.status(404).send('User not found.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('Internal server error.');
  }
};