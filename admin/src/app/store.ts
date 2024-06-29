// src/app/store.ts
import { configureStore } from '@reduxjs/toolkit';
import { ThunkAction, Action } from '@reduxjs/toolkit';
import authReducer from '../features/authSlice';


import categoryReducer from '../redux/categorySlice';
import productSlice from '../redux/productSlice';
import userSlice from '../redux/userSlice';
import orderSlice from '../redux/orderSlice';
import payment from '../redux/payment';
import { orderSliceApi } from '../redux/Api/Order';
// import { orderSliceApi } from '../redux/Api/Order';

const store = configureStore({
  reducer: {
    auth: authReducer,
    category: categoryReducer,
    product:productSlice,
    user:userSlice, 
    order:orderSlice,
    payment:payment,
    [orderSliceApi.reducerPath]: orderSliceApi.reducer,
    // [categoryApi.reducerPath]: categoryApi.reducer,
    // [productApi.reducerPath]: productApi.reducer, // Add the categoryApi reducer
    // Add other reducers as needed
  },

   middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(orderSliceApi.middleware),

});

export type AppThunk<ReturnType = void> = ThunkAction<ReturnType, RootState, unknown, Action<string>>;
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
