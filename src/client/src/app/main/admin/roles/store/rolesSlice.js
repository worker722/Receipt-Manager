import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import { showMessage } from "app/store/fuse/messageSlice";
import _ from "@lodash";
import FuseUtils from "@fuse/utils/FuseUtils";

export const getRoles = createAsyncThunk("admin/roles/getRoles", async () => {
  const response = await axios.get("/api/admin/roles/getAll");
  const { data = {}, error = {}, message = "", status = -1 } = response.data;
  if (status == 200) {
    return data ?? { roles: [] };
  } else {
    if (!FuseUtils.isEmpty(error))
      console.error("admin/roles/store/rolesSlice/getRoles", error);

    return {
      roles: [],
      ...response.data,
    };
  }
});

export const updateRole = createAsyncThunk(
  "admin/roles/updateRole",
  async (role) => {
    const response = await axios.post("/api/admin/roles/update", { role });
    const { data = {}, error = {}, message = "", status = -1 } = response.data;
    if (status == 200) {
      return data?.role ?? {};
    } else {
      console.error("admin/roles/store/rolesSlice/updateRole", error);

      return {
        ...response.data,
      };
    }
  }
);

const rolesSlice = createSlice({
  name: "admin/roles",
  initialState: {
    roles: [],
    updatedRole: {},
  },
  reducers: {},
  extraReducers: {
    [getRoles.fulfilled]: (state, action) => action.payload,
    [updateRole.fulfilled]: (state, action) => {
      state.updatedRole = action.payload;
    },
  },
});

export const selectRoles = ({ manageRolesPage }) => manageRolesPage.roles;

export default rolesSlice.reducer;
