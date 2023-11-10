import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import _ from "@lodash";
import FuseUtils from "@fuse/utils/FuseUtils";

const LOG_PATH = "staff/expenses/store/expensesSlice";
const API = "/api/staff/expenses";

export const getExpenses = createAsyncThunk(
  "staff/expenses/getExpenses",
  async () => {
    const response = await axios.get(`${API}/getAll`);
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

export const createExpense = createAsyncThunk(
  "staff/expenses/createExpense",
  async (file) => {
    const response = await axios.post(`${API}/create`, {
      file,
    });
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data?.expense ?? {};
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@createExpense`, error);

        return {
          createdExpenses: [],
          ...response.data,
        };
      }
    } else {
      return [];
    }
  }
);

const expensesSlice = createSlice({
  name: "staff/expenses",
  initialState: {
    expenses: [],
    createdExpenses: [],
  },
  reducers: {},
  extraReducers: {
    [getExpenses.fulfilled]: (state, action) => action.payload,
    [createExpense.fulfilled]: (state, action) => {
      state.createdExpenses = action.payload;
    },
  },
});

export const selectExpenses = ({ manageExpensesPage }) =>
  manageExpensesPage.expenses;

export default expensesSlice.reducer;
