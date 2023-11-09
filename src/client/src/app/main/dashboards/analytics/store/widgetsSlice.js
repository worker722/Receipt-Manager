import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import axios from 'axios';

export const getWidgets = createAsyncThunk('analyticsDashboardPage/widgets/getWidgets', async () => {
  const response = await axios.get('/api/dashboards/analytics/widgets');

  const data = await response.data;

  return data;
});

const widgetsSlice = createSlice({
  name: 'analyticsDashboardPage/widgets',
  initialState: null,
  reducers: {},
  extraReducers: {
    [getWidgets.fulfilled]: (state, action) => action.payload,
  },
});

export const selectWidgets = ({ analyticsDashboardPage }) => analyticsDashboardPage.widgets;

export default widgetsSlice.reducer;
