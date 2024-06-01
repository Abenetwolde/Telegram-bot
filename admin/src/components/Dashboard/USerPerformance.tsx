import React from 'react';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow } from '@mui/material';
import LoadingIndicator from '../LoadingIndicator';

interface UserPerformanceProps {
    data: Array<any>;
    loading: boolean;
}

const UserPerformance: React.FC<UserPerformanceProps> = ({ data, loading }) => {
    const columns = [
    //   {
    //     accessor: 'user.user.telegramid',
    //     Header: 'Telegram ID',
    //     Cell: ({ value }: any) => (
    //         <div className="flex items-center">
    //             {value}
    //         </div>
    //     ),
    // },
      {
        accessor: 'user',
        Header: 'First Name',
        Cell: ({ value }: any) => (
            <div className="flex items-center">
                {value?.user?.first_name}
            </div>
        ),
    },
    {
      accessor: 'user',
      Header: 'User Name',
      Cell: ({ value }: any) => (
          <div className="flex items-center">
              {`@${value?.user?.last_name}`}
          </div>
      ),
  },
        {
            accessor: 'timeSpent',
            Header: 'Time Spent',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                    {`${value.toFixed(2)} min`}
                </div>
            ),
        },
        {
            accessor: 'totalClicks',
            Header: 'Total Clicks',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                    {value}
                </div>
            ),
        },
        {
            accessor: 'totalOrders',
            Header: 'Total Orders',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                     {value}
                </div>
            ),
        },
        {
            accessor: 'overallScore',
            Header: 'Overall Score',
            Cell: ({ value }: any) => (
                <div className="flex items-center">
                       {`${value*100}%`}
                </div>
            ),
        },
    ];

    const getNestedValue = (data: any, accessor: string) => {
        const keys = accessor.split('.');
        let value = data;
        keys.forEach(key => {
            value = value[key];
        });
        return value;
    };

    return (
        <div>
            {
                !loading ?
                    (
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
                                        {data?.length ? data.map((item, index) => (
                                            <TableRow key={index}>
                                                {columns.map((column) => (
                                                    <TableCell key={column.accessor} className="p-2">
                                                        {column.Cell({ value: getNestedValue(item, column.accessor) })}
                                                    </TableCell>
                                                ))}
                                            </TableRow>
                                        )) :
                                            <TableRow>
                                                <TableCell colSpan={columns.length} className="p-2" align="center">
                                                    No data
                                                </TableCell>
                                            </TableRow>
                                        }
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    ) :
                    (
                        <LoadingIndicator />
                    )
            }
        </div>
    );
};

export default UserPerformance;
