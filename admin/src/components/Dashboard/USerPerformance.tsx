import React from 'react';
import { Box, Button, Card, CardHeader, Divider, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, useTheme } from '@mui/material';
import LoadingIndicator from '../LoadingIndicator';
// import Scrollbar from '../Scrollbar';
import Iconify from '../Iconify';
import Scrollbar from '../Scrollbar';
import Label from '../Label';
import FilterButtonGroup from '../FilterButtonGroup';

interface UserPerformanceProps {
    data: Array<any>;
    loading: boolean;
    filterUserPerformanceTable:any;
    handleFilterUserPerformanceTable:any;
}

const UserPerformance: React.FC<UserPerformanceProps> = ({ data, loading,filterUserPerformanceTable,handleFilterUserPerformanceTable, }) => {
    const theme = useTheme();

    const isLight = theme.palette.mode === 'light';
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

                <Label
                    variant={isLight ? 'ghost' : 'filled'}
                    color={"info"}>

                    {`@${value?.user?.last_name}`}
                </Label>

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
                <Label
                    variant={isLight ? 'ghost' : 'filled'}
                    color={(value >= 0.70 && 'success') ||
                        (value >= 0.30 && 'warning') ||
                        'error'}      >

                    {`${value * 100}%`}
                </Label>
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
                        <Card>
                            <CardHeader title="Recent Transitions" sx={{ mb: 3 }} />
                            <FilterButtonGroup handlefilter={handleFilterUserPerformanceTable} filter={filterUserPerformanceTable} />
                            {/* <Scrollbar children={undefined} sx={undefined}> */}
                            <TableContainer sx={{ minWidth: 720 }}>
                                <Table>
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
                            {/* </Scrollbar> */}

                            <Divider />

                            <Box sx={{ p: 2, textAlign: 'right', border: 'none', outline: "none" }}>
                                <Button sx={{
                                    '&:focus': {
                                        outline: 'none',
                                    },
                                }} size="small" color="inherit" endIcon={<Iconify icon={'eva:arrow-ios-forward-fill'} />}>
                                    View All
                                </Button>
                            </Box>
                        </Card>
                    ) :
                    (
                        <LoadingIndicator />
                    )
            }
        </div>
    );
};

export default UserPerformance;
