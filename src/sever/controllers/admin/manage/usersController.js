const { User, REF_NAME } = require("../../../models/userModel");
const Role = require("../../../models/roleModel");
const response = require("../../../utils/response");
const bcrypt = require("bcryptjs");
const { faker } = require("@faker-js/faker");

const LOG_PATH = "admin/manage/usersController"

const getAll = async (req, res) => {
  try {
    const users = (await User.find({}).populate(REF_NAME.ROLE).exec()) ?? [];
    return response(res, { users }, {}, 200);
  } catch (error) {
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const createUser = async (req, res) => {
  const { user } = req.body;
  if (!user?.fullName || !user?.email || !user?.password || !user?.role)
    return response(res, {}, {}, 400, "Please fill all the required fields.");

  const { fullName, email, password, role } = user;
  try {
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
    newUser.role = await Role.getRoleID(role);
    newUser.name = fullName;
    newUser.email = email;
    newUser.password = password;
    (await newUser.save())
      .populate(REF_NAME.ROLE)
      .then(async (savedUser) => {
        return response(res, {
          user: savedUser,
        });
      })
      .catch((_error) => {
        console.log(`${LOG_PATH}@createUser`, _error);
        response(res, {}, _error, 500, "Something went wrong!");
      });
  } catch (error) {
    console.log(`${LOG_PATH}@createUser`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const updateUser = async (req, res) => {
  const { user } = req.body;
  if (!user?.fullName || !user?.email || !user?.password || !user?.role)
    return response(res, {}, {}, 400, "Please fill all the required fields.");

  const _password = await bcrypt.hash(user.password, 10);
  const _role = await Role.getRoleID(user.role);

  try {
    const updatedUser = await User.findByIdAndUpdate(
      user.id,
      {
        $set: {
          name: user.fullName,
          email: user.email,
          password: _password,
          role: _role,
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
    console.log(`${LOG_PATH}@updateUser`, error);
    response(res, {}, error, 500, "Something went wrong");
  }
};

const deleteUser = async (req, res) => {
  const { id = null } = req.body;
  try {
    if (!id)
      return response(
        res,
        {},
        {},
        403,
        "Cannot perform this actions. Missing params"
      );

    const deletedUser = await User.findByIdAndUpdate(
      id,
      {
        $set: {
          deleted_at: new Date(),
        },
      },
      {
        new: true,
      }
    ).exec();
    response(res, { user: deletedUser }, {}, 200, "Deleted successfully!");
  } catch (error) {
    console.log(`${LOG_PATH}@deleteUser`, error);

    response(res, {}, error, 500, "Something went wrong!");
  }
};

const generateFakeData = async (req, res) => {
  try {
    await User.deleteMany({});
    const adminRole = await Role.getRoleID("admin");
    const role = await Role.getRoleID("user");
    const _password = await bcrypt.hash("11111111", 10);
    const fakeData = [];
    fakeData.push({
      name: "Admin Tester",
      role: adminRole,
      email: "admin@test.com",
      password: _password,
    });
    for (let i = 0; i < 100; i++) {
      const newUser = {};
      newUser.name = faker.internet.displayName();
      newUser.role = role;
      newUser.email = faker.internet.email();
      newUser.password = _password;
      fakeData.push(newUser);
    }
    await User.insertMany(fakeData);

    response(res, {}, {}, 200, "Successfully generated 100 users!");
  } catch (error) {
    response(res, {}, error, 500, "Something went wrong");
  }
};

module.exports = {
  getAll,
  createUser,
  updateUser,
  deleteUser,
  generateFakeData,
};
