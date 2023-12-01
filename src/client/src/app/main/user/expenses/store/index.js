import { combineReducers } from "@reduxjs/toolkit";
import expenses from "./expensesSlice";

const reducer = combineReducers({
  expenses,
});

export default reducer;
