const Role = require("../../../models/roleModel");
const { response } = require("../../../utils");

const LOG_PATH = "admin/manage/rolesController";

const getAll = async (req, res) => {
  try {
    const roles = (await Role.find({}).exec()) ?? [];
    return response(res, { roles }, {}, 200);
  } catch (error) {
    console.log(`${LOG_PATH}@getAll`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const createRole = async (req, res) => {};

const updateRole = async (req, res) => {
  const { role } = req.body;
  if (!role?.redirect_url)
    return response(res, {}, {}, 400, "Please fill all the required fields.");

  try {
    const updatedRole = await Role.findByIdAndUpdate(
      role._id,
      {
        $set: {
          redirect_url: role.redirect_url,
        },
      },
      {
        new: true,
      }
    ).exec();

    return response(
      res,
      {
        role: updatedRole,
      },
      {},
      200
    );
  } catch (error) {
    console.log(`${LOG_PATH}@updateRole`, error);
    response(res, {}, error, 500, "Something went wrong");
  }
};

const deleteRole = async (req, res) => {};

module.exports = {
  getAll,
  createRole,
  updateRole,
  deleteRole,
};
