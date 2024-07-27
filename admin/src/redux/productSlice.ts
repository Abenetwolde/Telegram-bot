import { createSlice, PayloadAction } from '@reduxjs/toolkit';
// import { AppThunk } from '../store';
import { AppThunk } from '../app/store';
import {  getCategoryList } from '../services/category';
import { getProductList } from '../services/product';
import { Product } from '../types/product';
interface Category {
  _id: string;
  category: {
    name: string;
    icon: string;
  };
}

interface ProdcutState {
  data: Product[];
  loading: boolean;
  error: string | null;
  page: number;
  rowsPerPage: number;
  totalPages: number;
  totalRows: number;
}

const initialState: any = {
  page: 0,
  rowsPerPage: 10,
  totalRows: 0,
  totalPages: 0,
};
const productSlice = createSlice({
  name: 'prodcut',
  initialState,
  reducers: {
    setProductPage(state, action) {
      state.page = action.payload;
  },
  setProductRowsPerPage(state, action) {
      state.rowsPerPage = action.payload;
  },
  setProductPaginationData(state, action) {
      state.totalRows = action.payload.totalRows;
      state.totalPages = action.payload.totalPages;
  },}
});

export const {

  setProductPaginationData,
  setProductPage,
  setProductRowsPerPage,
} = productSlice.actions;

export default productSlice.reducer;

// export const fetchProduct = (): AppThunk => async (dispatch, getState) => {
//   const { page, rowsPerPage } = getState().product;
//   dispatch(fetchProductStart());
//   try {
//     const products = await getProductList(page, rowsPerPage);
//     dispatch(fetchProductSuccess({ ...products, page, pageSize: rowsPerPage }));
//   } catch (error) {
//     dispatch(fetchProductFailure( 'Failed to fetch categories'));
//   }
// };

// export const setRowsPerPageAndFetch = (newRowsPerPage: number): AppThunk => async (dispatch) => {
//   dispatch(setRowsPerPage(newRowsPerPage));
//   dispatch(setPage(0));
//   dispatch(fetchProduct());
// };

// export const setPageAndFetch = (newPage: number): AppThunk => async (dispatch) => {
//   dispatch(setPage(newPage));
//   dispatch(fetchProduct());
// };
