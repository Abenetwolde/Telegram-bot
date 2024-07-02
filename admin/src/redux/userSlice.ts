// src/redux/slices/userSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { User } from '../Api/User';
// import User

interface UserState {
  page: number;
  rowsPerPage: number;
  totalPages: number;
  totalRows: number;
}

const initialState: UserState = {
  page: 0,
  rowsPerPage: 10,
  totalPages: 0,
  totalRows: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setPage(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setRowsPerPage(state, action: PayloadAction<number>) {
      state.rowsPerPage = action.payload;
    },
    setPaginationData(state, action: PayloadAction<{ totalPages: number; totalRows: number }>) {
      state.totalPages = action.payload.totalPages;
      state.totalRows = action.payload.totalRows;
    },
  },
});

export const { setPage, setRowsPerPage, setPaginationData } = userSlice.actions;
export default userSlice.reducer;
