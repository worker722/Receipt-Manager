import FuseUtils from "@fuse/utils/FuseUtils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const LOG_PATH = "user/reports/store/reportSlice";

export const getReport = createAsyncThunk(
  "user/reports/getReport",
  async (public_id) => {
    const response = await axios.post("/api/user/reports/getReport", {
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

export const matchReport = createAsyncThunk(
  "user/reports/matchReport",
  async (public_id) => {
    const response = await axios.post("/api/user/reports/matchReport", {
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
          console.error(`${LOG_PATH}@matchReport`, error);

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

export const submitReport = createAsyncThunk(
  "user/reports/submitReport",
  async (public_id) => {
    const response = await axios.post("/api/user/reports/submitReport", {
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
        return true;
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@submitReport`, error);

        return false;
      }
    } else {
      return false;
    }
  }
);

export const REPORT_STATUS = {
  IN_PROGRESS: 0,
  PENDING: 1,
  APPROVED: 2,
  REFUNDED: 3,
  CLOSED: 4,
};

const reportSlice = createSlice({
  name: "user/report",
  initialState: {},
  reducers: {},
});

export default reportSlice.reducer;
