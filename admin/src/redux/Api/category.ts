import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CashResponse, CompletedOrdersResponse, TransactionResponse } from '../../types/order/order';

const baseURL = process.env.DURL;

export const categoryApi = createApi({
  reducerPath: 'categoryApi',
  baseQuery: fetchBaseQuery({ baseUrl: baseURL, prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;

    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },}),
  tagTypes: ['CATEGORY'],
  endpoints: (builder) => ({
    getAllCategories: builder.query<any, { page: number; pageSize: number; }>({
      // query: () => '/order/getorders',
      query: ({ page = 1, pageSize = 10,}) => ({

        url: `/category/getcategories`,
        params: {
          page,
          pageSize,
     
 
        },
      }),
      providesTags: (result) =>
        result
          ? [...result?.categorys?.map(({ _id }) => ({ type: 'CATEGORY', id: _id } as const)), { type: 'CATEGORY', id: 'LIST' }]
          : [{ type: 'CATEGORY', id: 'LIST' }],
    }),
    createCategory: builder.mutation<any, Partial<Order>>({
      query: (category) => ({
        url: `/category/create`,
        method: 'POST',
        body: category,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'CATEGORY', id: _id }],
    }),
    updateCategory: builder.mutation<any, any>({
        query: (order) => ({
          url: `category/updatecategorybyid/${order.id}`,
          method: 'PUT',
          body: order,
        }),
        invalidatesTags: (result, error, { _id }) => [{ type: 'CATEGORY', id: _id }],
      }),
    deleteCategory: builder.mutation<any,any>({
        query: (category) => ({
          url: `category/deletecategorybyid/${category.id}`,
          method: 'DELETE',
        
        }),
        invalidatesTags: (result, error, { _id }) => [{ type: 'CATEGORY', id: _id }],
      }),

    
  }),
});

export const {  useGetAllCategoriesQuery, useCreateCategoryMutation, useUpdateCategoryMutation, useDeleteCategoryMutation} = categoryApi;
