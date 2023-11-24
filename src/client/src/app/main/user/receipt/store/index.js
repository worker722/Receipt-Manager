import { combineReducers } from "@reduxjs/toolkit";
import receipts from "./receiptSlice";

const reducer = combineReducers({
  receipts,
});

export default reducer;
