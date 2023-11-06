import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showMessage } from "app/store/fuse/messageSlice";
import _ from "@lodash";
import FuseUtils from "@fuse/utils/FuseUtils";

export const getUsers = createAsyncThunk("admin/users/getUsers", async () => {
  const response = await axios.get("/api/admin/users/getAll");
  const { data = {}, error = {}, message = "", status = -1 } = response.data;
  if (status == 200) {
    return data ?? { users: [] };
  } else {
    if (!FuseUtils.isEmpty(error))
      console.error("admin/users/store/usersSlice/getUsers", error);

    return {
      users: [],
      ...response.data,
    };
  }
});

export const createUser = createAsyncThunk(
  "admin/users/createUser",
  async (user) => {
    const response = await axios.post("/api/admin/users/create", { user });
    const { data = {}, error = {}, message = "", status = -1 } = response.data;
    if (status == 200) {
      return data?.user ?? {};
    } else {
      console.error("admin/users/store/usersSlice/createUser", error);

      return {
        ...response.data,
      };
    }
  }
);

export const updateUser = createAsyncThunk(
  "admin/users/updateUser",
  async (user) => {
    const response = await axios.post("/api/admin/users/update", { user });
    const { data = {}, error = {}, message = "", status = -1 } = response.data;
    if (status == 200) {
      return data?.user ?? {};
    } else {
      console.error("admin/users/store/usersSlice/updateUser", error);

      return {
        ...response.data,
      };
    }
  }
);

export const deleteUser = createAsyncThunk(
  "admin/users/deleteUser",
  async (id) => {
    const response = await axios.post("/api/admin/users/delete", { id });
    const { data = {}, error = {}, message = "", status = -1 } = response.data;
    if (status == 200) {
      return data?.user ?? {};
    } else {
      console.error("admin/users/store/usersSlice/deleteUser", error);

      return {
        ...response.data,
      };
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
