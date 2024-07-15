// redux/slices/userKpiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const userKpiApi = createApi({
  reducerPath: 'userKpiApi',
  baseQuery: fetchBaseQuery({baseUrl: process.env.DURL ,    prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    console.log("token from the sate ",token)
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  }, }),
  endpoints: (builder) => ({
    getUserRange: builder.mutation({
      query: ({ startDate, endDate }) => ({
        url: 'user/getuserrange',
        method: 'POST',
        body: { startDate, endDate },
      }),
    }),
    getNewUser: builder.query({
      query: (interval) => `user/getnewuser?interval=${interval}`,
    }),
  }),
});

export const { useGetUserRangeMutation, useGetNewUserQuery } = userKpiApi;
