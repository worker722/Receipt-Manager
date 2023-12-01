import { combineReducers } from "@reduxjs/toolkit";
// Reducers
import receipts from "./receiptSlice";
import report from "./reportSlice";
import reports from "./reportsSlice";

const reducer = combineReducers({
  reports,
  report,
  receipts,
});

export default reducer;
