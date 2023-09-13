const jwt = require("jsonwebtoken");
const User = require("../models/User");

const requireAuth = (req, res, next) => {
  console.log("auth middle ware is called hwere", { req: req.headers });
  const { token } = req.headers;
  console.log({ token });

  // Check if the cookie exists
  if (!token) {
    return res
      .status(401)
      .json({ error: "Authentication required", redirectTo: "/login" });
    // return res.status(401).redirect("/login");
  }

  jwt.verify(token, "my secret", (err, decodedToken) => {
    if (err) {
      console.error(err.message);
      return res
        .status(401)
        .json({ error: "Authentication required", redirectTo: "/login" });
      //   return res.status(302).redirect("/login");
    } else {
      console.log(decodedToken);
      req.user = decodedToken;
      next();
    }
  });
};

// Check current user
const checkUser = async (req, res, next) => {
  const { cookie } = req.headers;

  // Check if the cookie exists
  if (cookie && cookie.includes("token=")) {
    // Extract the token from the cookie
    const token = cookie.split("token=")[1].split(";")[0];

    jwt.verify(token, "my secret", async (err, decodedToken) => {
      if (!err) {
        console.log(decodedToken);
        try {
          let user = await User.findById(decodedToken.id);
          res.locals.user = user;
        } catch (err) {
          console.error(err.message);
        }
      }
    });
  }
  next();
};

module.exports = { requireAuth, checkUser };
