const { User, REF_NAME } = require("../../../models/userModel");
const response = require("../../../utils/response");
const bcrypt = require("bcryptjs");

const getAll = async (req, res) => {
  try {
    const users = (await User.find({}).populate(REF_NAME.ROLE).exec()) ?? [];
    return response(res, { users }, {}, 200);
  } catch (error) {
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const createUser = async (req, res) => {};

const updateUser = async (req, res) => {
  const { user } = req.body;
  if (!user?.fullName || !user?.email || !user?.password)
    return response(res, {}, {}, 400, "Please fill all the required fields.");

  const _password = await bcrypt.hash(user.password, 10);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user._id,
      {
        $set: {
          name: user.fullName,
          email: user.email,
          password: _password,
        },
      },
      {
        new: true,
      }
    )
      .populate(REF_NAME.ROLE)
      .exec();

    return response(
      res,
      {
        user: updatedUser,
      },
      {},
      200
    );
  } catch (error) {
    console.log(error);
    response(res, {}, error, 500, "Something went wrong");
  }
};

const deleteUser = async (req, res) => {};

module.exports = {
  getAll,
  createUser,
  updateUser,
  deleteUser,
};
