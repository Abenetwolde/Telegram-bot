import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { CashResponse, CompletedOrdersResponse, TransactionResponse } from '../../types/order/order';

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
      getOnlineOrders: builder.query<CashResponse, void>({
        query: () => '/order/get-order-by-online',
      }),
      getTotalTransaction: builder.query<TransactionResponse, void>({
        query: () => '/order/get-total-transaction',
      }),
  }),
});

export const { useGetCompletedOrdersQuery,useGetCancelOrdersQuery, useGetCashOrdersQuery , useGetOnlineOrdersQuery ,useGetTotalTransactionQuery} = orderSliceApi;
