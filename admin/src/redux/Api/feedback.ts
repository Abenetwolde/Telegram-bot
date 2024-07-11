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
      providesTags: ['Feedback'],
    }),
    getUpdateFeedbackStatus: builder.mutation({
      query: ({ id }) => ({
        url: `feedback/feedbacks/${id}/isRead`,
        method: 'PUT',
      }),
      invalidatesTags: [{ type: 'Feedback', id: 'LIST' }],
    }),
    replyFeedback: builder.mutation({

      query: (data) => ({
        url: `feedback/feedbacks/reply/${data.id}`,
        method: 'POST',
        body: data.reply,
      }),
      invalidatesTags: [{ type: 'Feedback', id: 'LIST' }],
    }),
  }),
  tagTypes: ['Feedback'],
});

export const { useGetAllFeedBackQuery, useGetUpdateFeedbackStatusMutation, useReplyFeedbackMutation } = feedbackApiSlice;
