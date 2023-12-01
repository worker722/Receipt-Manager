import FuseUtils from "@fuse/utils/FuseUtils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const LOG_PATH = "user/reports/store/reportsSlice";

export const getAllReports = createAsyncThunk(
  "user/reports/getAllReports",
  async () => {
    const response = await axios.get("/api/user/reports/getAllReports");
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data ?? { reports: [] };
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@getAllReports`, error);

        return {
          reports: [],
          ...response.data,
        };
      }
    } else {
      return {
        reports: [],
      };
    }
  }
);

const reportsSlice = createSlice({
  name: "user/reports",
  initialState: {
    reports: [],
  },
  reducers: {},
  extraReducers: {
    [getAllReports.fulfilled]: (state, action) => action.payload,
  },
});

export const selectReports = ({ reportsPage }) => reportsPage.reports;

export default reportsSlice.reducer;
