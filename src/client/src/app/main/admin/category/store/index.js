import { combineReducers } from "@reduxjs/toolkit";
import categories from "./categorySlice";

const reducer = combineReducers({
  categories,
});

export default reducer;
