import FuseUtils from "@fuse/utils/FuseUtils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const LOG_PATH = "staff/reports/store/reportSlice";

export const getReport = createAsyncThunk(
  "staff/reports/getReport",
  async (public_id) => {
    const response = await axios.post("/api/staff/reports/getReport", {
      public_id,
    });
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
          console.error(`${LOG_PATH}@getReport`, error);

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

export const approveReport = createAsyncThunk(
  "staff/reports/approveReport",
  async (public_id) => {
    const response = await axios.post("/api/staff/reports/approveReport", {
      public_id,
    });
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
          console.error(`${LOG_PATH}@approveReport`, error);

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

export const REPORT_STATUS = {
  IN_PROGRESS: 0,
  IN_REVIEW: 1,
  APPROVED: 2,
  REJECTED: 3,
  CLOSED: 4,
};

const reportSlice = createSlice({
  name: "staff/report",
  initialState: {},
  reducers: {},
});

export default reportSlice.reducer;
