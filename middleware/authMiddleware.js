const jwt = require("jsonwebtoken");

const requireAuth = (req, res, next) => {
  const { token } = req.headers;

  if (!token) {
    return res
      .status(401)
      .json({ error: "Authentication required", redirectTo: "/login" });
  }

  jwt.verify(token, "my secret", (err, decodedToken) => {
    if (err) {
      console.error(err.message);
      return res
        .status(401)
        .json({ error: "Authentication required", redirectTo: "/login" });
    } else {
      // console.log(decodedToken);
      req.user = decodedToken;
      next();
    }
  });
};

module.exports = { requireAuth };
