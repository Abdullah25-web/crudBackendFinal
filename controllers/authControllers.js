const User = require("../models/User");
const jwt = require("jsonwebtoken");

//handle errors
const handleErrors = (err) => {
  // console.log(err.message, err.code);
  let errors = { email: "", password: "" };

  //if incorrect email
  if (err.message === "incorrect email") {
    errors.email = "that email is not registered";
  }

  //if incorrect password
  if (err.message === "incorrect password") {
    errors.password = "that password is not registered";
  }

  //duplicate error code
  if (err.code === 11000) {
    errors.email = "this email is already registered";
    return errors;
  }

  if (err.message.includes("user validsation failed")) {
    Object.values(err.errors).forEach(({ properties }) => {
      errors[properties.path] = properties.message;
    });
  }
  return errors;
};

const maxAge = 3 * 24 * 60 * 60;
const createToken = (id) => {
  return jwt.sign({ id }, "my secret", {
    expiresIn: maxAge,
  });
};

module.exports.signup_get = (req, res) => {
  res.render("signup");
};

module.exports.login_get = (req, res) => {
  if (req.headers.accept === "application/json") {
    res.status(200).json({ message: "Welcome to the login API." });
  } else {
    res.render("login");
  }
};

module.exports.signup_post = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.create({ email, password });
    const token = createToken(user._id);
    res.cookie("jwt", token, { httpOnly: true, maxAge: maxAge * 1000 });
    res.status(200).json({ user: user._id });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.login_post = async (req, res) => {
  const { email, password } = req.body;
  // console.log(email, password);

  try {
    const user = await User.login(email, password);

    if (!user) {
      // User.login should return null for invalid login
      throw Error("incorrect email or password");
    }
    const token = createToken(user._id);
    res
      .cookie("jwt", token, {
        httpOnly: true,
        maxAge: maxAge * 1000,
        origin: "http://localhost:3001/",
      })
      .cookie("jwt", token, {
        // httpOnly: true,
        maxAge: maxAge * 1000,
        origin: "http://localhost:3001/",
      });

    res.status(200).json({ user: user._id, token: token });
  } catch (err) {
    const errors = handleErrors(err);
    res.status(400).json({ errors });
  }
};

module.exports.logout_get = (req, res) => {
  res.cookie("jwt", "", { maxAge: 1 });
  res.redirect("/login");
};
