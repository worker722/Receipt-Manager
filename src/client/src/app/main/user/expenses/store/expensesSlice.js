import FuseUtils from "@fuse/utils/FuseUtils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const LOG_PATH = "user/expenses/store/expensesSlice";

export const getExpenses = createAsyncThunk(
  "user/expenses/getExpenses",
  async () => {
    const response = await axios.get("/api/user/reports/getExpenses");
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

export const createNewReport = createAsyncThunk(
  "user/reports/createNewReport",
  async (data) => {
    const response = await axios.post("/api/user/reports/createReport", {
      expense_ids: data,
    });
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data ?? { report: [] };
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@createNewReport`, error);

        return {
          report: [],
          ...response.data,
        };
      }
    } else {
      return {
        report: [],
      };
    }
  }
);

const expensesSlice = createSlice({
  name: "user/expenses",
  initialState: {
    expenses: [],
  },
  reducers: {},
  extraReducers: {
    [getExpenses.fulfilled]: (state, action) => action.payload,
  },
});

export const selectExpenses = ({ allExpensesPage }) => allExpensesPage.expenses;

export default expensesSlice.reducer;
