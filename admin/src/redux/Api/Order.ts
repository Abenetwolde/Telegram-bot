import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CashResponse, CompletedOrdersResponse } from '../../types/order/order';

const baseURL = process.env.DURL;

export const orderSliceApi = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: baseURL }),
  endpoints: (builder) => ({
    getCompletedOrders: builder.query<CompletedOrdersResponse, void>({
      query: () => '/order/get-complated-order',
    }),
    getCancelOrders: builder.query<CompletedOrdersResponse, void>({
        query: () => '/order/get-cancel-order',
      }),
      getCashOrders: builder.query<CashResponse, void>({
        query: () => '/order/get-order-by-cash',
      }),
  }),
});

export const { useGetCompletedOrdersQuery,useGetCancelOrdersQuery, useGetCashOrdersQuery } = orderSliceApi;
