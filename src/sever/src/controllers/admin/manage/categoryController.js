const { Category, REF_NAME } = require("../../../models/categoryModel");
const { response, isEmpty } = require("../../../utils");
const { faker } = require("@faker-js/faker");
const { categoryUploader } = require("../../../utils/fileUploader");

const LOG_PATH = "admin/manage/categoryController";

const getAll = async (req, res) => {
  try {
    const categories = (await Category.find({}).exec()) ?? [];
    return response(res, { categories }, {}, 200);
  } catch (error) {
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const createCategory = async (req, res) => {
  try {
    categoryUploader(req, res, async function (_err) {
      if (_err) {
        return response(
          res,
          {},
          _err,
          400,
          "Photo upload failed. Please try again."
        );
      } else {
        const { name } = req.body;
        const subname = processString(name);
        const existingCategory = await Category.findOne({ subname });
        if (existingCategory)
          return response(
            res,
            {},
            {},
            400,
            "A category with this name already exists."
          );

        const category = new Category();
        category.name = name;
        if (req?.file?.path) category.photo = req.file.path;
        category.subname = subname;
        category
          .save()
          .then(async (savedCategory) => {
            return response(res, {
              category: savedCategory,
            });
          })
          .catch((_error) => {
            console.log(`${LOG_PATH}@createCategory`, _error);
            response(res, {}, _error, 500, "Something went wrong!");
          });
      }
    });
  } catch (error) {
    console.log(`${LOG_PATH}@createCategory`, error);
    response(res, {}, error, 500, "Something went wrong!");
  }
};

const updateCategory = async (req, res) => {};

const deleteCategory = async (req, res) => {};

const generateFakeData = async (req, res) => {};

const processString = (str) => {
  var result = str.replace(/[^a-zA-Z0-9 ]/g, "");
  var result = str.replace(/\s\s+/g, "");
  return result.toLowerCase();
};

module.exports = {
  getAll,
  createCategory,
  updateCategory,
  deleteCategory,

  generateFakeData,
};
