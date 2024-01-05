import FuseUtils from "@fuse/utils/FuseUtils";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const LOG_PATH = "staff/expenses/store/expensesSlice";
const API = "/api/staff/expenses";

export const getUsers = createAsyncThunk(
  "staff/expenses/getUsers",
  async () => {
    const response = await axios.get(`${API}/getUsers`);
    if (response?.status == 200) {
      const {
        data = {},
        error = {},
        message = "",
        status = -1,
      } = response.data;
      if (status == 200) {
        return data ?? { users: [] };
      } else {
        if (!FuseUtils.isEmpty(error))
          console.error(`${LOG_PATH}@getUsers`, error);

        return {
          users: [],
          ...response.data,
        };
      }
    } else {
      return {
        users: [],
      };
    }
  }
);

export const getExpenses = createAsyncThunk(
  "staff/expenses/getExpenses",
  async (assignee_id) => {
    const response = await axios.post(`${API}/getAll`, { assignee_id });
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
  async (data) => {
    const response = await axios.post(
      `${API}/create`,
      { ...data },
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
        return data?.expenses ?? {};
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
