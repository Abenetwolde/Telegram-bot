// src/components/UserClicksTable.tsx

import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import { RootState } from '../redux/store';
import {
    Box,
    Grid,
    InputAdornment,
    Paper,
    Skeleton,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    TextField,
} from '@mui/material';
import { setPageClick, setPaginationDataClick, setRowsPerPageClick } from '../../redux/userSlice';

import { useGetUserClicksQuery } from '../../redux/Api/User';
import FilterButtonGroup from '../FilterButtonGroup';
import Iconify from '../Iconify';
// import { useGetUserClicksQuery } from '../redux/Api/User';
// import LoadingIndicator from './LoadingIndicator';

const UserClicksTable: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);
    const [filter, setFilter] = useState('perMonth')
    const [search, setSearch] = useState('');
    const handleFiletr = (string) => {
        setFilter(string)
    }
    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        // setPage(0);
    };

    const { data, error, isLoading } = useGetUserClicksQuery({
        page: user.page + 1,
        pageSize: user.rowsPerPage,
        search,
        interval: filter
    });

    useEffect(() => {
        if (data) {
            dispatch(setPaginationDataClick({ totalPages: data.totalPages, totalRows: data.totalRecords }));
        }
    }, [data, dispatch]);

    const handleChangePage = (_event: unknown, newPage: number) => {
        dispatch(setPageClick(newPage));
    };

    const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
        dispatch(setRowsPerPageClick(parseInt(event.target.value, 10)));
    };

    const sceneNames = data?.clicksPerScene.flatMap(item => item.userinformationperScene.map(scene => scene.sceneName)) || [];
    const uniqueSceneNames = Array.from(new Set(sceneNames));

    const columns = [
        {
            accessor: 'userInformation',
            Header: 'First Name',
            Cell: ({ value }: any) => <div>{value?.first_name}</div>,
        },
        {
            accessor: 'userInformation',
            Header: 'User Name',
            Cell: ({ value }: any) => <div>{value?.username}</div>,
        },
        ...uniqueSceneNames.map(sceneName => ({
            accessor: sceneName,
            Header: sceneName,
            Cell: ({ value }: any) => value || 0,
        })),
        {
            accessor: 'totalClicks',
            Header: 'Total',
            Cell: ({ value }: any) => <div>{value}</div>,
        },
    ];
    const renderSkeleton = () => {
        return (
            <TableRow>
                {columns.map((column) => (
                    <TableCell key={column.accessor}>
                        <Skeleton height={30} variant="text" />
                    </TableCell>
                ))}
                <TableCell>
                    <Skeleton height={30} variant="text" />
                </TableCell>
            </TableRow>
        );
    };
    const getSceneClicks = (userinformationperScene: any[], sceneName: string) => {
        const scene = userinformationperScene.find(scene => scene.sceneName === sceneName);
        return scene ? scene.totalClicks : 0;
    };

    return (
        <div>

            <Box mt={1}>
                <Grid container py={5 }px={10} spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Grid item xs={12} md={6} lg={6} xl={6} >
                        <TextField
                            size="small"
                            value={search}
                            placeholder="Search users"
                            onChange={handleSearchChange}
                            variant="outlined"

                            fullWidth
                            InputProps={{
                                startAdornment: <InputAdornment position="start">
                                    <Iconify
                                        icon={'eva:search-fill'}
                                        sx={{ color: 'text.disabled', width: 20, height: 20 }}
                                    />
                                </InputAdornment>,
                            }}

                        />
                    </Grid>
                    <Grid item xs={12} md={6} lg={6} xl={6} >
                    <FilterButtonGroup handlefilter={handleFiletr} filter={filter} />
                    </Grid>
                    
                </Grid>

                <TableContainer component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                {columns.map((column) => (
                                    <TableCell key={column.accessor}>
                                        {column.Header}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHead>
                        <TableBody>

                            {isLoading
                                ? Array.from(new Array(user.rowsPerPage)).map((_, index) => renderSkeleton())
                                : data?.clicksPerScene.map((click) => (
                                    <TableRow key={click.telegramid}>
                                        {columns.map((column) => (
                                            <TableCell key={column.accessor}>
                                                {column.accessor === 'userInformation' || column.accessor === 'totalClicks'
                                                    ? column.Cell({ value: click[column.accessor as keyof typeof click] })
                                                    : column.Cell({ value: getSceneClicks(click.userinformationperScene, column.accessor) })}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                        </TableBody>
                        <TablePagination
                            rowsPerPageOptions={[5, 10, 25]}
                            count={user.totalRows}
                            rowsPerPage={user.rowsPerPage}
                            page={user.page}
                            onPageChange={handleChangePage}
                            onRowsPerPageChange={handleChangeRowsPerPage}
                        />
                    </Table>
                </TableContainer>
            </Box>

        </div>
    );
};

export default UserClicksTable;