// apiSlice.js
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const feedbackApiSlice = createApi({
  reducerPath: 'feedbackApiSlice',
  baseQuery: fetchBaseQuery({
    baseUrl: process.env.DURL,
  }),
  endpoints: (builder) => ({
    getAllFeedBack: builder.query<any, void>({
        query: () => 'feedback/feedbacks/',
      }),
      getUpdateFeedbackStatus: builder.mutation({
        query: ({ id }) => ({
          url: `feedback/feedbacks/${id}/isRead`,
          method: 'put',

        }),
      }),
  }),
});

export const { useGetAllFeedBackQuery ,useGetUpdateFeedbackStatusMutation} = feedbackApiSlice;
