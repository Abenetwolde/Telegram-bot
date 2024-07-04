// src/redux/slices/userSlice.ts

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { User } from '../Api/User';
// import User

interface UserState {
  page: number;
  rowsPerPage: number;
  totalPages: number;
  totalRows: number;
  performancePage: number;
  performanceRowsPerPage: number;
  performanceTotalPages: number;
  performanceTotalRows: number;
}

const initialState: UserState = {
  page: 0,
  rowsPerPage: 10,
  totalPages: 0,
  totalRows: 0,
  performancePage: 0,
  performanceRowsPerPage: 10,
  performanceTotalPages: 0,
  performanceTotalRows: 0,
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
    setPerformancePage(state, action: PayloadAction<number>) {
      state.performancePage = action.payload;
    },
    setPerformanceRowsPerPage(state, action: PayloadAction<number>) {
      state.performanceRowsPerPage = action.payload;
    },
    setPerformancePaginationData(state, action: PayloadAction<{ totalPages: number; totalRows: number }>) {
      state.performanceTotalPages = action.payload.totalPages;
      state.performanceTotalRows = action.payload.totalRows;
    },
    setPageClick(state, action: PayloadAction<number>) {
      state.page = action.payload;
    },
    setRowsPerPageClick(state, action: PayloadAction<number>) {
      state.rowsPerPage = action.payload;
    },
    setPaginationDataClick(state, action: PayloadAction<{ totalPages: number; totalRows: number }>) {
      state.totalPages = action.payload.totalPages;
      state.totalRows = action.payload.totalRows;
    },
  },
});

export const { setPage, setRowsPerPage, setPaginationData, setPerformancePage, setPerformanceRowsPerPage, setPerformancePaginationData,setPageClick,setPaginationDataClick,setRowsPerPageClick } = userSlice.actions;
export default userSlice.reducer;
