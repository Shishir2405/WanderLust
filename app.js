if (process.env.NODE_ENV != "production") {
  require("dotenv").config();
}


/**
 * ! Every Thing Related To Main Server
 * * Requiring Every Dependencies
 */
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

/**
 * * Imports necessary modules for the application.
 */
const ExpressError = require("./utils/ExpressError.js");
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");
const filterRouter = require("./routes/filter.js");
const User = require("./models/user.js");
const wrapAsyn = require("./utils/wrapAsyn.js");
const Listing = require("./models/listing.js");
const { func } = require("joi");

/**
 * * Calling Express For Making App
 */
const app = express();

/**
 * *Defining port number and mongoUrl
 */
const port = 8080;
// const mongoUrl = process.env.ATLASDB_URL;
const dbUrl = process.env.ATLASDB_URL;

/**
 * * Set up view engine, directory for views, static files, body parsing, and method override middleware
 */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);

/**
 * * Establishing MongoDB Connection
 */
main()
  .then(() => {
    console.log("Connection Setup Done");
  })
  .catch((err) => {
    console.log(err);
  });

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("Error in MONGO SESSION STORE", err);
});

/**
 * * Initializes Express sessions for managing user session data.
 * * Configures flash messages middleware for displaying temporary messages to users.
 */
const sessionOption = {
  store,
  secret: process.env.SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOption));
app.use(flash());

/**
 * * Passport Configuration
 * ? Enables Passport.js to manage user sessions, facilitating user authentication across multiple requests.
 * ? Defines a local authentication strategy, allowing users to authenticate with their username and password, and specifies methods for converting user objects to and from session data.
 */
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
const GoogleStrategy = require("passport-google-oauth2").Strategy;

passport.serializeUser((user, done) => {
  done(null, user.id); // Serialize the user ID
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id); // Find the user by ID
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

/**
 * * Google
 */

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "https://wanderlust-1-88ni.onrender.com/auth/google/callback",
      passReqToCallback: true,
    },
    function (request, accessToken, refreshToken, profile, done) {
      // Extract and print username and email ID from profile
      const username = profile.displayName;
      const email = profile.emails[0].value;
      console.log('Username:', username);
      console.log('Email ID:', email);

      // Pass the profile object to done callback
      done(null, profile);
    }
  )
);


/**
 * * Flash message middleware
 */
app.use((req, res, next) => {
  res.locals.successMsg = req.flash("success");
  res.locals.errorMsg = req.flash("error");
  res.locals.updateMsg = req.flash("update");
  res.locals.currUser = req.user;
  res.locals.currPage = req.path;
  next();
});

/**
 * * Attach the 'listing' router to handle requests at '/listings'.
 * * Attach the 'review' router to handle requests at '/listings/:id/reviews'.
 * * Attach the 'user' router to handle requests at '/'.
 */
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);
app.use("/filter", filterRouter);

/**
 * * Starting Express Server
 */
app.listen(port, () => {
  console.log("Started Listening!!!");
});

app.get("/privacy", (req, res) => {
  res.render("users/privacy.ejs");
});

app.get("/terms", (req, res) => {
  res.render("users/terms.ejs");
});

function isLoggedIn(req, res, next) {
  req.user ? next() : res.sendStatus(401);
}

app.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["email", "profile"] })
);

app.get(
  "/auth/google/callback",
  passport.authenticate("google", {
    successRedirect: "/auth/google/success",
    failureRedirect: "/auth/google/failure",
  })
);

app.get("/auth/google/success", isLoggedIn, (req, res) => {
  req.flash("success", "Welcome To WanderLust");
  res.send("Google authentication successful");
});

app.get("/auth/google/failure", (req, res) => {
  res.send("Google authentication failed");
});

/**
 * * Standard Route
 * ? If not matched from above it will displayed
 */
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page Not Found"));
});

/**
 * ! Error Handling MiddleWare
 */
app.use((err, req, res, next) => {
  let { statusCode = 500, message = "---ERROR---" } = err;
  res.status(statusCode).render("listings/error.ejs", { err });
});