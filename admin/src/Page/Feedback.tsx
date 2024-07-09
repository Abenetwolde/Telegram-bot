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
    Drawer,
    IconButton,
    Typography,
    List,
    ListItem,
    ListItemText,
    Card,
    CardHeader,
    Button,
} from '@mui/material';
import { setPageClick, setPaginationDataClick, setRowsPerPageClick } from '../../redux/userSlice';
import VisibilityIcon from '@mui/icons-material/Visibility';
import Iconify from '../components/Iconify';
import { useGetAllFeedBackQuery } from '../redux/Api/feedback';
// import { useGetUserClicksQuery } from '../redux/Api/User';
// import LoadingIndicator from './LoadingIndicator';

const FeedBackPage: React.FC = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: any) => state.user);
    const [filter, setFilter] = useState('perMonth')
    const [search, setSearch] = useState('');
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [selectedFeedback, setSelectedFeedback] = useState<any>(null);
    const [reply, setReply] = useState('');
    const handleFiletr = (string) => {
        setFilter(string)
    }
    const handleSearchChange = (event) => {
        setSearch(event.target.value);
        // setPage(0);
    };

    const { data, error, isLoading } = useGetAllFeedBackQuery();



    // const handleChangePage = (_event: unknown, newPage: number) => {
    //     dispatch(setPageClick(newPage));
    //     console.log("iser newPage when the user is newPage", newPage)
    // };

    // const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    //     dispatch(setRowsPerPageClick(parseInt(event.target.value, 10)));
    // };

    // const sceneNames = data?.clicksPerScene?.flatMap(item => item.userinformationperScene.map(scene => scene.sceneName)) || [];
    // const uniqueSceneNames = Array.from(new Set(sceneNames));
    // const handleViewClick = (user: any) => {
    //     setSelectedUser(user);

    //     setDrawerOpen(true);
    // };

    // const handleDrawerClose = () => {
    //     setDrawerOpen(false);
    //     setSelectedUser(null);
    // };
    const columns = [
        {
            accessor: 'user',
            Header: 'First Name',
            Cell: ({ value }: any) => <div>{value?.first_name}</div>,
        },
        {
            accessor: 'user',
            Header: 'User Name',
            Cell: ({ value }: any) => <div>{value?.username}</div>,
        },
        {
            accessor: 'feedback',
            Header: 'User Name',
            Cell: ({ value }: any) => <div>{value}</div>,
        },

        // {
        //     accessor: 'actions',
        //     Header: 'Actions',
        //     Cell: ({  row }: any) => (
        //         <IconButton onClick={() => handleViewClick(row)}>
        //             <VisibilityIcon />
        //         </IconButton>
        //     ),
        // },
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
    const handleViewClick = (feedback: any) => {
        setSelectedFeedback(feedback);
        setDrawerOpen(true);
    };

    const handleDrawerClose = () => {
        setDrawerOpen(false);
        setSelectedFeedback(null);
        setReply('');
    };

    const handleSendReply = () => {
        // Implement the logic to send the reply
        console.log('Reply sent:', reply);
        setReply('');
    };


    return (
        <div className='mt-5'>

            <Card>
                <CardHeader title={"User Feedbacks Table"} />
                <Box mt={1}>
                    <Grid container py={5} px={10} spacing={2} sx={{ display: 'flex', justifyContent: 'center' }}>
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
                            {/* <FilterButtonGroup handlefilter={handleFiletr} filter={filter} /> */}
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
                                    <TableCell className="p-2">Actions</TableCell>
                                </TableRow>


                            </TableHead>
                            <TableBody>

                                {isLoading
                                    ? Array.from(new Array(7)).map((_, index) => renderSkeleton())
                                    : data?.map((feedback) => (
                                        <TableRow key={feedback._id}>
                                            {columns.map((column) => (
                                                <TableCell key={column.accessor}>
                                                     {column.Cell({ value: feedback[column.accessor] })}

                                                </TableCell>
                                            ))}
                                            <TableCell className="p-2">
                                                <IconButton onClick={() => handleViewClick(feedback)}>
                                                    <VisibilityIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>

                                    ))}
                            </TableBody>
                            {/* <TablePagination
                                rowsPerPageOptions={[5, 10, 25]}
                                count={user.clicktotalRows}
                                rowsPerPage={user.clickrowsPerPage}
                                page={user.clickpage}
                                onPageChange={null}
                                onRowsPerPageChange={null}
                            /> */}
                        </Table>
                    </TableContainer>
                    <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerClose}>
                        <Box sx={{ width: 350, p: 3 }}>
                            <Typography variant="h6">User Feedback Detail</Typography>
                            {selectedFeedback && (
                                <List>
                                    <ListItem>
                                        <ListItemText primary="First Name" secondary={selectedFeedback.user.first_name} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Username" secondary={selectedFeedback.user.username} />
                                    </ListItem>
                                    <ListItem>
                                        <ListItemText primary="Feedback" secondary={selectedFeedback.feedback} />
                                    </ListItem>
                                </List>
                            )}
                            <TextField
                                label="Reply"
                                multiline
                                rows={4}
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                variant="outlined"
                                fullWidth
                                sx={{ mt: 2 }}
                            />
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                                <Button variant="contained" color="primary" onClick={handleSendReply}>
                                    Send
                                </Button>
                            </Box>
                        </Box>
                    </Drawer>
                </Box>
            </Card>
        </div>
    );
};

export default FeedBackPage;
