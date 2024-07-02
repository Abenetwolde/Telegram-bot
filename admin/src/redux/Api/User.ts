// src/redux/Api/User.ts

import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

interface User {
  _id: string;
  telegramid: string;
  first_name: string;
  last_name: string;
  username: string;
  language: string;
  is_bot: string;
  token: string;
  refreshToken: string;
}

interface PaginatedResponse<T> {
  users: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.DURL }),
  tagTypes: ['User'],
  endpoints: (builder) => ({
    // getUsers: builder.query<PaginatedResponse<User>, { page: number; rowsPerPage: number }>({
    //   query: ({ page, rowsPerPage }) => `user/getallusers?page=${page + 1}&pageSize=${rowsPerPage}`,
    // }),
    createUser: builder.mutation<User, Partial<User>>({
      query: (newUser) => ({
        url: 'user',
        method: 'POST',
        body: newUser,
      }),
    }),
    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `user/${id}`,
        method: 'DELETE',
      }),
    }),
  
   updateUser: builder.mutation<any, Partial<any>>({
      query: (userData) => ({
        url: `user/updateuser/${userData._id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'User', id: _id }],
    }),
    getUsers:  builder.query<PaginatedResponse<User>, { page: number; rowsPerPage: number }>({
   query: ({ page, rowsPerPage }) => `user/getallusers?page=${page + 1}&pageSize=${rowsPerPage}`,
      providesTags: (result) =>
        result
          ? [...result?.users?.map(({ _id }) => ({ type: 'User', id: _id } as const)), { type: 'User', id: 'LIST' }]
          : [{ type: 'User', id: 'LIST' }],
    }),
}),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
} = userApi;
