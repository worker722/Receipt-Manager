import FuseUtils from "@fuse/utils/FuseUtils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const LOG_PATH = "user/reports/store/receiptSlice";

export const getCategories = createAsyncThunk(
  "user/receipts/getCategories",
  async () => {
    const response = await axios.get("/api/user/reports/getCategories");
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data ?? { categories: [] };
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@getCategories`, error);

        return {
          categories: [],
          ...response.data,
        };
      }
    } else {
      return {
        categories: [],
      };
    }
  }
);

export const uploadReceipt = createAsyncThunk(
  "user/receipt/uploadReceipt",
  async (receipt) => {
    const response = await axios.post(
      "/api/user/receipts/upload",
      {
        ...receipt,
      },
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data;
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@upload`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

export const createReceipt = createAsyncThunk(
  "user/receipt/createReceipt",
  async (data) => {
    const response = await axios.post("/api/user/receipts/create", data);
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
          console.error(`${LOG_PATH}@createReceipt`, error);

        return {
          ...response.data,
        };
      }
    } else {
      return {};
    }
  }
);

export const updateReceipt = createAsyncThunk(
  "user/receipt/updateReceipt",
  async (data) => {
    const response = await axios.post("/api/user/receipts/update", data);
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

export const deleteReceipt = createAsyncThunk(
  "user/receipt/deleteReceipt",
  async (id) => {
    const response = await axios.post("/api/user/receipts/delete", { id });
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
          console.error(`${LOG_PATH}@deleteReceipt`, error);

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
  name: "user/receipt",
  initialState: {},
  reducers: {},
});

export const selectReceipts = ({ manageReceiptPage }) =>
  manageReceiptPage.receipts;

export default receiptSlice.reducer;
