import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showMessage } from "app/store/fuse/messageSlice";
import _ from "@lodash";

export const getUsers = createAsyncThunk("admin/users/getUsers", async () => {
  const response = await axios.get("/api/admin/users/getAll");
  const { data = {}, error = {}, message = "", status = -1 } = response.data;
  if (status == 200) {
    return data ?? { users: [] };
  } else {
    console.error("admin/users/store/usersSlice/getUsers", error);
    showMessage({
      message: message,
      variant: "error",
    });

    return [];
  }
});

export const updateUser = createAsyncThunk(
  "admin/users/updateUser",
  async (user) => {
    const response = await axios.post("/api/admin/users/update", { user });
    const { data = {}, error = {}, message = "", status = -1 } = response.data;
    if (status == 200) {
      return data?.user ?? {};
    } else {
      console.error("admin/users/store/usersSlice/update", error);
      showMessage({
        message: message,
        variant: "error",
      });

      return [];
    }
  }
);

const usersSlice = createSlice({
  name: "admin/users",
  initialState: {
    users: [],
    updatedUser: {},
  },
  reducers: {},
  extraReducers: {
    [getUsers.fulfilled]: (state, action) => action.payload,
    [updateUser.fulfilled]: (state, action) => {
      state.updatedUser = action.payload;
    },
  },
});

export const selectUsers = ({ manageUsersPage }) => manageUsersPage.users;

export default usersSlice.reducer;
