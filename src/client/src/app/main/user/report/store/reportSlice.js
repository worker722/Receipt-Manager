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

export const REPORT_STATUS = {
  IN_PROGRESS: 0,
  PENDING: 2,
  APPROVED: 3,
  REFUNDED: 4,
  CLOSED: 5,
};

const reportSlice = createSlice({
  name: "user/report",
  initialState: {},
  reducers: {},
});

export default reportSlice.reducer;
