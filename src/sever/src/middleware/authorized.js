const jwt = require("jsonwebtoken");
const { response } = require("@utils");
const { User, REF_NAME } = require("@models/userModel");

function Authenticated(req, res, next) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) return response(res, {}, {}, 401, "Unauthorized");

    // Verifing token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decodedData) => {
      if (err)
        return response(
          res,
          {},
          err,
          403,
          "Access to the requested resource is forbidden."
        );

      const verifiedUser = await User.findById(decodedData.id)
        .populate(REF_NAME.ROLE)
        .exec();

      if (verifiedUser) {
        if (verifiedUser.active == 0)
          return response(
            res,
            {},
            {
              redirect_url: "sign-in",
            },
            404,
            "Your account has been blocked. Contact to support."
          );

        req.currentUser = verifiedUser;

        next();
      } else {
        return response(res, {}, {}, 404);
      }
    });
  } catch (error) {
    console.log("middleware/authorized", error);
    return response(res, {}, error, 401, "Unauthorized");
  }
}

function isAdmin(req, res, next) {
  if (req.currentUser.role.name == "admin") {
    next();
  } else {
    console.log("You're not permitted to perform this action.");
    return response(
      res,
      {},
      {},
      403,
      "You are not permitted to perform this actions."
    );
  }
}

function isStaff(req, res, next) {
  if (
    req.currentUser.role.name == "admin" ||
    req.currentUser.role.name == "staff"
  ) {
    next();
  } else {
    console.log("You're not permitted to perform this action.");
    return response(
      res,
      {},
      {},
      403,
      "You are not permitted to perform this actions."
    );
  }
}

function isUser(req, res, next) {
  if (
    req.currentUser.role.name == "admin" ||
    req.currentUser.role.name == "user"
  ) {
    next();
  } else {
    console.log("You're not permitted to perform this action.");
    return response(
      res,
      {},
      {},
      403,
      "You are not permitted to perform this actions."
    );
  }
}

function isOnlyUser(req, res, next) {
  if (req.currentUser.role.name == "user") {
    next();
  } else {
    console.log("You're not permitted to perform this action.");
    return response(
      res,
      {},
      {},
      403,
      "You are not permitted to perform this actions."
    );
  }
}

module.exports = { Authenticated, isAdmin, isStaff, isUser, isOnlyUser };
