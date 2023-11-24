import FuseUtils from "@fuse/utils/FuseUtils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const LOG_PATH = "user/receipt/store/receiptSlice";

export const getExpenses = createAsyncThunk(
  "user/receipt/getExpense",
  async () => {
    const response = await axios.get("/api/user/receipts/getExpenses");
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data ?? { expenses: [] };
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@getExpenses`, error);

        return {
          expenses: [],
          ...response.data,
        };
      }
    } else {
      return {
        expenses: [],
      };
    }
  }
);

export const getReceipts = createAsyncThunk(
  "user/receipt/getReceipts",
  async () => {
    const response = await axios.get("/api/user/receipts/getAll");
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data ?? { receipts: [] };
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@getReceipts`, error);

        return {
          receipts: [],
          ...response.data,
        };
      }
    } else {
      return {
        receipts: [],
      };
    }
  }
);

export const getCategories = createAsyncThunk(
  "user/receipts/getCategories",
  async () => {
    const response = await axios.get("/api/user/receipts/getCategories");
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
  async (receipt) => {
    const response = await axios.post("/api/user/receipts/create", {
      ...receipt,
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
  async (receipt) => {
    const response = await axios.post(
      "/api/user/receipts/update",
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

const receiptSlice = createSlice({
  name: "user/receipt",
  initialState: {
    receipts: [],
    categories: [],
    createdReceipt: {},
    updatedReceipt: {},
    deletedReceipt: {},
  },
  reducers: {},
  extraReducers: {
    [getReceipts.fulfilled]: (state, action) => action.payload,
    [createReceipt.fulfilled]: (state, action) => {
      state.createdReceipt = action.payload;
    },
    [updateReceipt.fulfilled]: (state, action) => {
      state.updatedReceipt = action.payload;
    },
    [deleteReceipt.fulfilled]: (state, action) => {
      state.deletedReceipt = action.payload;
    },
  },
});

export const selectReceipts = ({ manageReceiptPage }) =>
  manageReceiptPage.receipts;

export default receiptSlice.reducer;
