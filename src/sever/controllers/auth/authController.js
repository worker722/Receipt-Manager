const User = require("../../models/userModel.js");
const UserRole = require("../../models/userRoleModel.js");
const response = require("../../utils/response.js");
const jwt = require("jsonwebtoken");

// Sign Up / Register User
const SignUp = async (req, res) => {
  const { fullName, email, password, passwordConfirm } = req.body;

  try {
    // Validation
    if (!fullName || !email || !password || !passwordConfirm)
      return response(res, {}, {}, 400, "Please fill all the required fields.");

    if (password.length < 8)
      return response(
        res,
        {},
        {},
        400,
        "Please enter a password of at least 8 chracters."
      );

    if (password !== passwordConfirm)
      return response(res, {}, {}, 400, "Please doesn't match.");

    const existingUser = await User.findOne({ email });
    if (existingUser)
      return response(
        res,
        {},
        {},
        400,
        "An account with this email already exists."
      );

    const newUser = new User();
    newUser.role = await UserRole.getRoleID("admin");
    newUser.name = fullName;
    newUser.email = email;
    newUser.password = password;
    (await newUser.save()).populate("role").then(async (savedUser, err) => {
      // Generate JWT token
      const token = savedUser.getJwtToken();

      return response(res, {
        access_token: token,
        user: processedUser(savedUser),
      });
    });
  } catch (error) {
    console.log("error", error);
    return response(res, {}, error, 500, "Something went worng.");
  }
};

// Sign In / Log In
const SignInWithEmailAndPassword = async (req, res) => {
  const { email = null, password = null } = req.body?.data;

  try {
    // Validation fields
    if (!email || !password)
      return response(res, {}, {}, 400, "Please fill all the required fields.");

    const existingUser = await User.findOne({ email }).populate("role");

    if (!existingUser)
      return response(res, {}, {}, 404, "Email doesn't exist.");

    const isPasswordCorrect = await existingUser.comparePassword(password);

    if (!isPasswordCorrect)
      return response(
        res,
        {},
        {},
        404,
        "Inavaild Credentials. Check your email or password again."
      );

    // Generate JWT token
    const token = existingUser.getJwtToken();

    return response(res, {
      access_token: token,
      user: processedUser(existingUser),
    });
  } catch (error) {
    response(res, {}, error, 500, "Something went wrong.");
  }
};

const SignInWithToken = async (req, res) => {
  const { access_token = null } = req.body.data;

  try {
    jwt.verify(
      access_token,
      process.env.JWT_SECRET,
      async (err, decodedData) => {
        if (err) {
          console.log(err);
          return response(
            res,
            {},
            err,
            403,
            "Access to the requested resource is forbidden."
          );
        }

        const verifiedUser = await User.findById(decodedData.id)
          .populate("role")
          .exec();

        // Generate JWT token
        const token = verifiedUser.getJwtToken();

        return response(res, {
          access_token: token,
          user: processedUser(verifiedUser),
        });
      }
    );
  } catch (error) {
    console.log(error);
    response(res, {}, error, 500, "Something went wrong.");
  }
};

// Sign Out / Log Out
const SignOut = async (req, res) => {
  res
    .cookie("token", "", {
      httpOnly: true,
      expires: new Date(0),
    })
    .send();
};

const processedUser = (data = {}, isFull = false) => {
  if (isFull) return data;
  return {
    name: data.name ?? "",
    avatar: data.avatar ?? "assets/images/avatars/brian-hughes.jpg",
    email: data.email ?? "",
    role: data.getRoleName() ?? "",
    loginRedirectUrl: data.getRedirectURL() ?? "/",
    created_at: data.created_at ?? "",
  };
};

module.exports = {
  SignUp,
  SignInWithEmailAndPassword,
  SignInWithToken,
  SignOut,
};
