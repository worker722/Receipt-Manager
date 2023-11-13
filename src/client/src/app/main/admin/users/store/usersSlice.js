import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import _ from "@lodash";
import FuseUtils from "@fuse/utils/FuseUtils";

const LOG_PATH = "admin/users/store/usersSlice";

export const getUsers = createAsyncThunk("admin/users/getUsers", async () => {
  const response = await axios.get("/api/admin/users/getAll");
  if (response?.status == 200) {
    const { data = {}, error = {}, message = "", status = -1 } = response.data;
    if (status == 200) {
      return data ?? { users: [] };
    } else {
      if (!FuseUtils.isEmpty(error))
        console.error(`${LOG_PATH}@getUsers`, error);

      return {
        users: [],
        ...response.data,
      };
    }
  } else {
    return {
      users: [],
    };
  }
});

export const createUser = createAsyncThunk(
  "admin/users/createUser",
  async (user) => {
    const response = await axios.post("/api/admin/users/create", { user });
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data?.user ?? {};
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@createUser`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

export const updateUser = createAsyncThunk(
  "admin/users/updateUser",
  async (user) => {
    const response = await axios.post("/api/admin/users/update", { user });
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data?.user ?? {};
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@updateUser`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/users/deleteUser",
  async (id) => {
    const response = await axios.post("/api/admin/users/delete", { id });
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data?.user ?? {};
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@deleteUser`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

const usersSlice = createSlice({
  name: "admin/users",
  initialState: {
    users: [],
    createdUser: {},
    updatedUser: {},
    deletedUser: {},
  },
  reducers: {},
  extraReducers: {
    [getUsers.fulfilled]: (state, action) => action.payload,
    [createUser.fulfilled]: (state, action) => {
      state.createdUser = action.payload;
    },
    [updateUser.fulfilled]: (state, action) => {
      state.updatedUser = action.payload;
    },
    [deleteUser.fulfilled]: (state, action) => {
      state.deletedUser = action.payload;
    },
  },
});

export const selectUsers = ({ manageUsersPage }) => manageUsersPage.users;

export default usersSlice.reducer;
