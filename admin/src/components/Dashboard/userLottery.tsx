import React, { useEffect, useState } from 'react';
import { Box, Paper, Skeleton, Table, TableBody, TableCell, TableContainer, TableFooter, TableHead, TablePagination, TableRow } from '@mui/material';
import { MutatingDots } from 'react-loader-spinner';

interface UserLotteryProps {
    data: Array<any>;
    loading: boolean;
  }
  
  const UserLottery: React.FC<UserLotteryProps> = ({ data, loading }) => {

    const columns = [
        {
          accessor: 'first_name',
          Header: 'First Name',
          Cell: ({ value }: any) => (
            <div className="flex items-center">
              {value && value}
            </div>
          ),
        },
        {
          accessor: 'username',
          Header: 'User Name',
          Cell: ({ value }: any) => (
            <div className="flex items-center">
              {value && value}
            </div>
          ),
        },
        {
          accessor: 'lotteryNumbers',
          Header: 'Invited User',
          Cell: ({ value }: any) => (
            <div className="flex items-center">
              {value?.invitedUsers==0?'No user invited':value?.invitedUsers}
            </div>
          ),
        },
        {
            accessor: 'lotteryNumbers',
            Header: 'Lottery Numbers',
            Cell: ({ value }: any) => (
              <div className="flex items-center">
                {!value?.number?.length?'No Lottery Number':value?.number?.map((m:any)=>m)}
              </div>
            ),
          },
      ];

    const getProductValue = (product: any, accessor: string) => {
        const keys = accessor.split('.'); // Split nested keys
        let value: any = { ...product };

        keys.forEach((key) => {
            value = value[key];
        });

        return value;
    };
    const renderSkeleton = () => {
      return (
          <TableRow>
              {columns.map((column) => (
                  <TableCell>
                      <Skeleton height={30} variant="text" />
                  </TableCell>
              ))}
              <TableCell>
                  <Skeleton height={30} variant="text" />
              </TableCell>
          </TableRow>
      );
  };

    return (
        <>

            <Box mt={1}>
              <TableContainer component={Paper} className="overflow-auto">
                <Table sx={{ maxWidth: 1200 }} aria-label="user table" className="border-collapse align-center justify-center mx-auto">
                  <TableHead>
                    <TableRow>
                      {columns.map((column) => (
                        <TableCell key={column.accessor} className={`p-2 !text-md`}>
                          {column.Header}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>

                  <TableBody>
                  {loading
                                    ? Array.from(new Array(7)).map((_, index) => renderSkeleton()):
                    data.map((product, index) => (
                      <TableRow key={product._id}>
                        {columns.map((column) => (
                          <TableCell key={column.accessor} className={`p-2`}>
                            {column.Cell ? column.Cell({ value: getProductValue(product, column.accessor) }) : getProductValue(product, column.accessor)}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>

                </Table>
              </TableContainer>
            </Box>

        </>
    );
};

export default UserLottery;
