import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface Category {
  _id: string;
  category: {
    name: string;
    icon: string;
  };
}

interface CategoryState {
  data: Category[];
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

const categorySlice = createSlice({
  name: 'category',
  initialState,
  reducers: {
    setCategoryPage(state, action) {
      state.page = action.payload;
  },
  setCategoryRowsPerPage(state, action) {
      state.rowsPerPage = action.payload;
  },
  setCategoryPaginationData(state, action) {
      state.totalRows = action.payload.totalRows;
      state.totalPages = action.payload.totalPages;
  },}
});

export const {
  setCategoryPaginationData,
  setCategoryPage,
  setCategoryRowsPerPage,
} = categorySlice.actions;

export default categorySlice.reducer;

// export const fetchCategories = (): AppThunk => async (dispatch, getState) => {
//   const { page, rowsPerPage } = getState().category;
//   dispatch(fetchCategoriesStart());
//   try {
//     const categories = await getCategoryList(page, rowsPerPage);
//     dispatch(fetchCategoriesSuccess({ ...categories, page, pageSize: rowsPerPage }));
//   } catch (error) {
//     dispatch(fetchCategoriesFailure( 'Failed to fetch categories'));
//   }
// };

// export const setRowsPerPageAndFetch = (newRowsPerPage: number): AppThunk => async (dispatch) => {
//   dispatch(setRowsPerPage(newRowsPerPage));
//   dispatch(setPage(0));
//   dispatch(fetchCategories());
// };

// export const setPageAndFetch = (newPage: number): AppThunk => async (dispatch) => {
//   dispatch(setPage(newPage));
//   dispatch(fetchCategories());
// };
