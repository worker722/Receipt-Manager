const jwt = require("jsonwebtoken");
const response = require("../utils/response");

function checkAuthentication(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return response(res, {}, {}, 401, "Unauthorized");

    // Verifing token
    jwt.verify(token, process.env.JWT_SECRET, (err, verifiedUser) => {
      if (err)
        return response(
          res,
          {},
          err,
          403,
          "Access to the requested resource is forbidden."
        );
      req.user = verifiedUser;
      next();
    });
  } catch (error) {
    console.log(error);
    return response(res, {}, error, 401, "Unauthorized");
  }
}

module.exports = checkAuthentication;
