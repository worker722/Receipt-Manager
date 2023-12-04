import FuseUtils from "@fuse/utils/FuseUtils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const LOG_PATH = "staff/reports/store/receiptSlice";

export const updateReceipt = createAsyncThunk(
  "staff/receipt/updateReceipt",
  async (data) => {
    const response = await axios.post("/api/staff/receipts/update", data);
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data?.receipt ?? {};
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@updateReceipt`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

export const approveReceipt = createAsyncThunk(
  "staff/receipt/approveReceipt",
  async (id) => {
    const response = await axios.post("/api/staff/receipts/approveReceipt", {
      id,
    });
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data?.receipt ?? {};
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@updateReceipt`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

export const refundReceipt = createAsyncThunk(
  "staff/receipt/refundReceipt",
  async (id) => {
    const response = await axios.post("/api/staff/receipts/refundReceipt", {
      id,
    });
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data?.receipt ?? {};
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@updateReceipt`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

export const RECEIPT_STATUS = {
  IN_PROGRESS: 0,
  PENDING: 1,
  APPROVED: 2,
  REFUNDED: 3,
  CLOSED: 4,
};

const receiptSlice = createSlice({
  name: "staff/receipt",
  initialState: {},
  reducers: {},
});

export default receiptSlice.reducer;
