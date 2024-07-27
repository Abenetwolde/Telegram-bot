import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CashResponse, CompletedOrdersResponse, TransactionResponse } from '../../types/order/order';

const baseURL = process.env.DURL;

export const productApi = createApi({
  reducerPath: 'productApi',
  baseQuery: fetchBaseQuery({ baseUrl: baseURL, prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },}),
  tagTypes: ['PRODUCT'],
  endpoints: (builder) => ({
    getAllProduct: builder.query<any, { page: number; pageSize: number; }>({
      // query: () => '/order/getorders',
      query: ({ page = 1, pageSize = 10,}) => ({

        url: `/product/getproducts`,
        params: {
          page,
          pageSize,
     
 
        },
      }),
      providesTags: (result) =>
        result
          ? [...result?.products?.map(({ _id }) => ({ type: 'PRODUCT', id: _id } as const)), { type: 'PRODUCT', id: 'LIST' }]
          : [{ type: 'PRODUCT', id: 'LIST' }],
    }),
    createProduct: builder.mutation<any, any>({
      query: (category) => ({
        url: `product/create`,
        method: 'POST',
        body: category,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'PRODUCT', id: _id }],
    }),
    uploadImageProduct: builder.mutation<any, any>({
      query: (category) => ({
        url: `product/upload`,
        method: 'POST',
        body: category,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'PRODUCT', id: _id }],
    }),
    uploadVedioProduct: builder.mutation<any, any>({
      query: (category) => ({
        url: `product/upload-video`,
        method: 'POST',
        body: category,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'PRODUCT', id: _id }],
    }),
    updateProduct: builder.mutation<any, any>({
        query: (order) => ({
          url: `product/updateproductbyid/${order?._id}`,
          method: 'PUT',
          body: order,
        }),
        invalidatesTags: (result, error, { _id }) => [{ type: 'PRODUCT', id: _id }],
      }),
    deleteProduct: builder.mutation<any,any>({
        query: (category) => ({
          url: `product/deleteproductbyid/${category}`,
          method: 'DELETE',
        
        }),
        invalidatesTags: (result, error, { _id }) => [{ type: 'PRODUCT', id: _id }],
      }),

    
  }),
});

export const {  useGetAllProductQuery, useCreateProductMutation, useUpdateProductMutation, useDeleteProductMutation, useUploadImageProductMutation,useUploadVedioProductMutation} = productApi;
