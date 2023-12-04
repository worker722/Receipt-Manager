import FuseUtils from "@fuse/utils/FuseUtils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const LOG_PATH = "staff/reports/store/reportsSlice";

export const getAllReports = createAsyncThunk(
  "staff/reports/getAllReports",
  async () => {
    const response = await axios.get("/api/staff/reports/getAllReports");
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
  name: "staff/reports",
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
