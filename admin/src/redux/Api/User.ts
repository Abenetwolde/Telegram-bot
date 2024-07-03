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
interface UserPerformance {
  user: {
    user: {
      telegramid: string;
      first_name: string;
      last_name: string;
    };
    timeSpent: number;
    totalClicks: number;
    totalOrders: number;
  };
  timeSpent: number;
  totalClicks: number;
  totalOrders: number;
  overallScore: string;
}

interface UserPerformanceResponse {
  page: number;
  totalUsers: number;
  currentPage: number;
  totalPages: number;
  users: UserPerformance[];
}


export const userApi = createApi({
  reducerPath: 'userApi',
  baseQuery: fetchBaseQuery({ baseUrl: process.env.DURL ,    prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.token;
    console.log("token from the sate ",token)
    if (token) {
      headers.set('authorization', `Bearer ${token}`);
    }
    return headers;
  },}),
  
  tagTypes: ['User'],
  endpoints: (builder) => ({
    createUser: builder.mutation<User, Partial<User>>({
      query: (newUser) => ({
        url: '/user/register',
        method: 'POST',
        body: newUser,
      }),
      invalidatesTags: [{ type: 'User', id: 'LIST' }],
    }),

    deleteUser: builder.mutation<{ success: boolean }, string>({
      query: (id) => ({
        url: `/user/deleteuser/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [{ type: 'User', id: id }, { type: 'User', id: 'LIST' }],
    }),
  
   updateUser: builder.mutation<any, Partial<any>>({
      query: (userData) => ({
        url: `user/updateuser/${userData._id}`,
        method: 'PUT',
        body: userData,
      }),
      invalidatesTags: (result, error, { _id }) => [{ type: 'User', id: _id }],
    }),
    getUsers:  builder.query<PaginatedResponse<User>, { page: number; pageSize: number; search : string; sortField: string;  sortOrder :string;  joinMethod :string;  role :string; }>({
      query: ({ page = 0, pageSize = 10, search = '', sortField = 'createdAt', sortOrder = 'asc', joinMethod = '', role = '' }) => ({
        url: `user/getallusers`,
        params: {
          page,
          pageSize,
          search,
          sortField,
          sortOrder,
          joinMethod,
          role,
        },
      }),
      providesTags: (result) =>
        result
          ? [...result?.users?.map(({ _id }) => ({ type: 'User', id: _id } as const)), { type: 'User', id: 'LIST' }]
          : [{ type: 'User', id: 'LIST' }],
    }),
    getUserPerformance: builder.query<UserPerformanceResponse, { page: number; pageSize: number; search: string; sortField: string; sortOrder: string; joinMethod: string; role: string }>({
      query: ({ page = 0, pageSize = 10, search = '', interval = 'perMonth',  }) => ({
        url: `kpi/get-users-performance`,
        params: {
          page,
          pageSize,
          search,
          interval
          
        },
      }),
      providesTags: (result) =>
        result
          ? [...result?.users?.map(({ user }) => ({ type: 'User', id: user.user.telegramid } as const)), { type: 'User', id: 'PERFORMANCE' }]
          : [{ type: 'User', id: 'PERFORMANCE' }],
    }),
}),
});

export const {
  useGetUsersQuery,
  useCreateUserMutation,
  useUpdateUserMutation,
  useDeleteUserMutation,
  useGetUserPerformanceQuery,
} = userApi;
