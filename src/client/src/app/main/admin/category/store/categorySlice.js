import FuseUtils from "@fuse/utils/FuseUtils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const LOG_PATH = "admin/category/store/categorySlice";

export const getCategories = createAsyncThunk(
  "admin/category/getCategories",
  async () => {
    const response = await axios.get("/api/admin/category/getAll");
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data ?? { categories: [] };
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@getCategories`, error);

        return {
          categories: [],
          ...response.data,
        };
      }
    } else {
      return {
        categories: [],
      };
    }
  }
);

export const createCategory = createAsyncThunk(
  "admin/category/createCategory",
  async (category) => {
    const response = await axios.post(
      "/api/admin/category/create",
      {
        ...category,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data?.category ?? {};
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@createCategory`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

export const updateCategory = createAsyncThunk(
  "admin/category/updateCategory",
  async (category) => {
    const response = await axios.post(
      "/api/admin/category/update",
      {
        ...category,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data?.category ?? {};
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@updateCategory`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

export const deleteCategory = createAsyncThunk(
  "admin/category/deleteCategory",
  async (id) => {
    const response = await axios.post("/api/admin/category/delete", { id });
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data?.category ?? {};
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@deleteCategory`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

const categorySlice = createSlice({
  name: "admin/category",
  initialState: {
    categories: [],
    createdCategory: {},
    updatedCategory: {},
    deletedCategory: {},
  },
  reducers: {},
  extraReducers: {
    [getCategories.fulfilled]: (state, action) => action.payload,
    [createCategory.fulfilled]: (state, action) => {
      state.createdCategory = action.payload;
    },
    [updateCategory.fulfilled]: (state, action) => {
      state.updatedCategory = action.payload;
    },
    [deleteCategory.fulfilled]: (state, action) => {
      state.deletedCategory = action.payload;
    },
  },
});

export const selectCategories = ({ manageCategoryPage }) =>
  manageCategoryPage.categories;

export default categorySlice.reducer;
